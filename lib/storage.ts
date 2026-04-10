import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

import type { LeadScoreResult } from "@/lib/lead-scoring";
import type { LeadFormValues } from "@/lib/validation";

export interface LeadStorageResult {
  status: "stored" | "prepared" | "failed";
  detail: string;
  recordId: string;
  submittedAt: string;
}

export async function persistLeadRecord(
  payload: LeadFormValues,
  leadScore: LeadScoreResult,
): Promise<LeadStorageResult> {
  const recordId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;
  const localFallbackFile = path.join(process.cwd(), ".data", "lead-requests.jsonl");

  async function writeLocalFallback() {
    await mkdir(path.dirname(localFallbackFile), { recursive: true });
    await appendFile(
      localFallbackFile,
      `${JSON.stringify({
        recordId,
        submittedAt,
        payload,
        leadScore,
      })}\n`,
      "utf8",
    );
  }

  if (!databaseUrl) {
    try {
      await writeLocalFallback();

      return {
        status: "stored",
        detail:
          "DATABASE_URL is not configured. Lead stored in the local JSONL fallback sink.",
        recordId,
        submittedAt,
      };
    } catch (error) {
      return {
        status: "prepared",
        detail:
          error instanceof Error
            ? error.message
            : "Fallback storage could not be written.",
        recordId,
        submittedAt,
      };
    }
  }

  try {
    const sql = postgres(databaseUrl, {
      connect_timeout: 5,
      idle_timeout: 5,
      max: 1,
      prepare: false,
    });

    try {
      await sql`
        create table if not exists lead_requests (
          id uuid primary key,
          submitted_at timestamptz not null,
          full_name text not null,
          professional_email text not null,
          practice_name text not null,
          role text not null,
          specialty text not null,
          state text not null,
          monthly_volume text not null,
          timeline text not null,
          notes text,
          confirmed_professional_use boolean not null,
          utm_source text,
          utm_medium text,
          utm_campaign text,
          utm_content text,
          utm_term text,
          reddit_click_id text,
          landing_page_variant text,
          lead_score integer not null,
          lead_bucket text not null,
          routing_recommendation text not null,
          payload_json text not null,
          lead_score_json text not null
        )
      `;

      await sql`
        insert into lead_requests (
          id,
          submitted_at,
          full_name,
          professional_email,
          practice_name,
          role,
          specialty,
          state,
          monthly_volume,
          timeline,
          notes,
          confirmed_professional_use,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          utm_term,
          reddit_click_id,
          landing_page_variant,
          lead_score,
          lead_bucket,
          routing_recommendation,
          payload_json,
          lead_score_json
        ) values (
          ${recordId},
          ${submittedAt},
          ${payload.fullName},
          ${payload.professionalEmail},
          ${payload.practiceName},
          ${payload.role},
          ${payload.specialty},
          ${payload.state},
          ${payload.monthlyVolume},
          ${payload.timeline},
          ${payload.notes ?? null},
          ${payload.confirmedProfessionalUse},
          ${payload.utm_source ?? null},
          ${payload.utm_medium ?? null},
          ${payload.utm_campaign ?? null},
          ${payload.utm_content ?? null},
          ${payload.utm_term ?? null},
          ${payload.reddit_click_id ?? null},
          ${payload.landing_page_variant ?? null},
          ${leadScore.score},
          ${leadScore.bucket},
          ${leadScore.routingRecommendation},
          ${JSON.stringify(payload)},
          ${JSON.stringify(leadScore)}
        )
      `;

      return {
        status: "stored",
        detail: "Lead stored in Postgres.",
        recordId,
        submittedAt,
      };
    } finally {
      await sql.end();
    }

  } catch (error) {
    return {
      status: "failed",
      detail: error instanceof Error ? error.message : "Lead persistence failed.",
      recordId,
      submittedAt,
    };
  }
}
