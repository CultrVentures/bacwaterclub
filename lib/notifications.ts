import type { LeadScoreResult } from "@/lib/lead-scoring";
import type { LeadFormValues } from "@/lib/validation";

export interface DeliveryResult {
  status: "sent" | "skipped" | "failed";
  provider: "slack" | "resend" | "postmark";
  detail: string;
}

function buildSlackBlocks(payload: LeadFormValues, leadScore: LeadScoreResult) {
  return {
    text: `New clinician lead: ${payload.fullName}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "New clinician lead request",
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name*\n${payload.fullName}` },
          { type: "mrkdwn", text: `*Email*\n${payload.professionalEmail}` },
          { type: "mrkdwn", text: `*Practice*\n${payload.practiceName}` },
          { type: "mrkdwn", text: `*Role*\n${payload.role}` },
          { type: "mrkdwn", text: `*Volume*\n${payload.monthlyVolume}` },
          { type: "mrkdwn", text: `*Timeline*\n${payload.timeline}` },
          { type: "mrkdwn", text: `*Lead score*\n${leadScore.score} (${leadScore.bucket})` },
          {
            type: "mrkdwn",
            text: `*Routing*\n${leadScore.routingRecommendation}`,
          },
        ],
      },
      payload.notes
        ? {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Notes*\n${payload.notes}`,
            },
          }
        : null,
    ].filter(Boolean),
  };
}

export async function sendSlackNotification(
  payload: LeadFormValues,
  leadScore: LeadScoreResult,
): Promise<DeliveryResult> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const slackPayload = buildSlackBlocks(payload, leadScore);

  if (!webhookUrl) {
    return {
      status: "skipped",
      provider: "slack",
      detail: "SLACK_WEBHOOK_URL is not configured. Slack payload prepared only.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5_000),
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      const message = await response.text();
      return {
        status: "failed",
        provider: "slack",
        detail: message || "Slack webhook failed.",
      };
    }

    return {
      status: "sent",
      provider: "slack",
      detail: "Slack notification sent.",
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "slack",
      detail: error instanceof Error ? error.message : "Slack notification failed.",
    };
  }
}

export async function sendConfirmationEmail(
  payload: LeadFormValues,
): Promise<DeliveryResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  const emailFrom = process.env.EMAIL_FROM ?? "clinical@cultrhealth.example";

  const subject = "Your clinical request is under review";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1D2B2A; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 12px;">Request received</h1>
      <p>Thank you for submitting a clinical request for pricing, availability, or account support.</p>
      <p>Our team is reviewing your purchaser and practice details now. Follow-up will typically include next steps on verification, documentation, and routing.</p>
      <p style="margin-top: 20px;">Submitted for: <strong>${payload.practiceName}</strong></p>
      <p>If additional information is needed, we will contact you at ${payload.professionalEmail}.</p>
    </div>
  `;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify({
          from: emailFrom,
          to: [payload.professionalEmail],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        return {
          status: "failed",
          provider: "resend",
          detail: message || "Resend request failed.",
        };
      }

      return {
        status: "sent",
        provider: "resend",
        detail: "Confirmation email sent via Resend.",
      };
    } catch (error) {
      return {
        status: "failed",
        provider: "resend",
        detail: error instanceof Error ? error.message : "Resend request failed.",
      };
    }
  }

  if (postmarkToken) {
    try {
      const response = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": postmarkToken,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify({
          From: emailFrom,
          To: payload.professionalEmail,
          Subject: subject,
          HtmlBody: html,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        return {
          status: "failed",
          provider: "postmark",
          detail: message || "Postmark request failed.",
        };
      }

      return {
        status: "sent",
        provider: "postmark",
        detail: "Confirmation email sent via Postmark.",
      };
    } catch (error) {
      return {
        status: "failed",
        provider: "postmark",
        detail: error instanceof Error ? error.message : "Postmark request failed.",
      };
    }
  }

  return {
    status: "skipped",
    provider: "resend",
    detail:
      "No email provider configured. Set RESEND_API_KEY or POSTMARK_SERVER_TOKEN to enable confirmation email delivery.",
  };
}
