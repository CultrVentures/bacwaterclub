import { NextResponse } from "next/server";

import { upsertCrmLead } from "@/lib/crm";
import { scoreLead } from "@/lib/lead-scoring";
import { sendConfirmationEmail, sendSlackNotification } from "@/lib/notifications";
import { persistLeadRecord } from "@/lib/storage";
import { leadFormSchema, sanitizeLeadPayload } from "@/lib/validation";

export const runtime = "nodejs";

const leadRequestTracker = new Map<
  string,
  {
    count: number;
    resetAt: number;
    lastFingerprint?: string;
    lastSubmittedAt?: number;
  }
>();

const rateLimitWindowMs = Number(process.env.LEAD_RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMax = Number(process.env.LEAD_RATE_LIMIT_MAX ?? 5);

function pruneSubmissionWindow(now: number) {
  for (const [clientId, entry] of leadRequestTracker.entries()) {
    if (entry.resetAt <= now) {
      leadRequestTracker.delete(clientId);
    }
  }
}

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
}

function assessSubmissionWindow(clientId: string, fingerprint: string) {
  const now = Date.now();
  pruneSubmissionWindow(now);
  const currentEntry = leadRequestTracker.get(clientId);

  if (!currentEntry || currentEntry.resetAt <= now) {
    return {
      duplicate: false,
      limited: false,
      now,
      resetAt: now + rateLimitWindowMs,
    };
  }

  if (
    currentEntry.lastFingerprint === fingerprint &&
    currentEntry.lastSubmittedAt &&
    now - currentEntry.lastSubmittedAt < 45_000
  ) {
    return { duplicate: true, limited: false, now, resetAt: currentEntry.resetAt };
  }

  if (currentEntry.count >= rateLimitMax) {
    return { duplicate: false, limited: true, now, resetAt: currentEntry.resetAt };
  }

  return { duplicate: false, limited: false, now, resetAt: currentEntry.resetAt };
}

function commitSubmissionWindow(
  clientId: string,
  fingerprint: string,
  windowState: { now: number; resetAt: number },
) {
  const currentEntry = leadRequestTracker.get(clientId);

  if (!currentEntry || currentEntry.resetAt <= windowState.now) {
    leadRequestTracker.set(clientId, {
      count: 1,
      resetAt: windowState.resetAt,
      lastFingerprint: fingerprint,
      lastSubmittedAt: windowState.now,
    });

    return;
  }

  leadRequestTracker.set(clientId, {
    ...currentEntry,
    count: currentEntry.count + 1,
    lastFingerprint: fingerprint,
    lastSubmittedAt: windowState.now,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sanitizedPayload = sanitizeLeadPayload(body);

    if (sanitizedPayload.honeypot) {
      return NextResponse.json(
        {
          success: true,
          message: "Request received",
        },
        { status: 200 },
      );
    }

    const parsedLead = leadFormSchema.safeParse(sanitizedPayload);

    if (!parsedLead.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please review the required fields and try again.",
          fieldErrors: parsedLead.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const lead = parsedLead.data;
    const clientId = getClientIdentifier(request);
    const fingerprint = `${lead.professionalEmail}:${lead.practiceName}`.toLowerCase();
    const submissionWindow = assessSubmissionWindow(clientId, fingerprint);

    if (submissionWindow.duplicate) {
      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          message: "Request already received and currently under review.",
        },
        { status: 202 },
      );
    }

    if (submissionWindow.limited) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests were submitted in a short period. Please try again shortly.",
        },
        { status: 429 },
      );
    }

    const leadScore = scoreLead(lead);

    const storageResult = await persistLeadRecord(lead, leadScore);
    const crmResult = await upsertCrmLead(lead, leadScore);

    // Reddit Conversions API hook point:
    // On a fully configured deployment, this is where a normalized conversion event
    // can be mirrored to `/api/reddit-capi` after lead validation succeeds.

    const hasDurableSink = storageResult.status === "stored" || crmResult.status === "sent";

    if (!hasDurableSink) {
      console.error("Lead submission was not recorded in a durable sink.", {
        storageResult,
        crmResult,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Your request could not be securely recorded in this environment. Please try again later.",
        },
        { status: 503 },
      );
    }

    commitSubmissionWindow(clientId, fingerprint, submissionWindow);

    const [slackResult, emailResult] = await Promise.all([
      sendSlackNotification(lead, leadScore),
      sendConfirmationEmail(lead),
    ]);
    const followUpResults = [storageResult, crmResult, slackResult, emailResult];

    if (followUpResults.some((result) => result.status === "failed")) {
      console.error("Lead follow-up integration failure detected.", {
        followUpResults,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Request received",
        leadScore: {
          score: leadScore.score,
          bucket: leadScore.bucket,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lead submission route failed.", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error interrupted submission. Please try again.",
      },
      { status: 500 },
    );
  }
}
