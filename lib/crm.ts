import type { LeadScoreResult } from "@/lib/lead-scoring";
import type { LeadFormValues } from "@/lib/validation";

export interface CrmSyncResult {
  status: "sent" | "skipped" | "failed";
  provider: "hubspot";
  detail: string;
  contactId?: string;
}

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || "Unknown",
  };
}

export function buildHubSpotPayload(
  payload: LeadFormValues,
  leadScore: LeadScoreResult,
) {
  const { firstName, lastName } = splitName(payload.fullName);

  return {
    properties: {
      firstname: firstName,
      lastname: lastName,
      email: payload.professionalEmail,
      company: payload.practiceName,
      jobtitle: payload.role,
      specialty: payload.specialty,
      state: payload.state,
      monthly_volume: payload.monthlyVolume,
      inquiry_timeline: payload.timeline,
      notes: payload.notes ?? "",
      professional_use_confirmed: String(payload.confirmedProfessionalUse),
      lead_score: String(leadScore.score),
      lead_bucket: leadScore.bucket,
      routing_recommendation: leadScore.routingRecommendation,
      utm_source: payload.utm_source ?? "",
      utm_medium: payload.utm_medium ?? "",
      utm_campaign: payload.utm_campaign ?? "",
      utm_content: payload.utm_content ?? "",
      utm_term: payload.utm_term ?? "",
      reddit_click_id: payload.reddit_click_id ?? "",
      landing_page_variant: payload.landing_page_variant ?? "",
    },
  };
}

export async function upsertCrmLead(
  payload: LeadFormValues,
  leadScore: LeadScoreResult,
): Promise<CrmSyncResult> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const hubspotPayload = buildHubSpotPayload(payload, leadScore);
  const requestHeaders = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (!apiKey) {
    return {
      status: "skipped",
      provider: "hubspot",
      detail:
        "HUBSPOT_API_KEY is not configured. CRM payload mapped and ready for wiring.",
    };
  }

  try {
    const searchResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers: requestHeaders,
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: payload.professionalEmail,
                },
              ],
            },
          ],
          properties: ["email"],
          limit: 1,
        }),
      },
    );

    if (!searchResponse.ok) {
      const message = await searchResponse.text();
      return {
        status: "failed",
        provider: "hubspot",
        detail: message || "HubSpot contact search failed.",
      };
    }

    const searchResult = (await searchResponse.json()) as {
      results?: Array<{ id: string }>;
    };
    const existingContactId = searchResult.results?.[0]?.id;

    const response = await fetch(
      existingContactId
        ? `https://api.hubapi.com/crm/v3/objects/contacts/${existingContactId}`
        : "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: existingContactId ? "PATCH" : "POST",
        headers: requestHeaders,
        signal: AbortSignal.timeout(5_000),
        body: JSON.stringify(hubspotPayload),
      },
    );

    if (!response.ok) {
      const message = await response.text();
      return {
        status: "failed",
        provider: "hubspot",
        detail: message || "HubSpot request failed.",
      };
    }

    const result = (await response.json()) as { id?: string };

    return {
      status: "sent",
      provider: "hubspot",
      detail: existingContactId
        ? "Existing HubSpot contact updated."
        : "Lead forwarded to HubSpot.",
      contactId: existingContactId ?? result.id,
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "hubspot",
      detail: error instanceof Error ? error.message : "HubSpot sync failed.",
    };
  }
}
