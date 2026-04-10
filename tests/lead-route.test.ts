import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sqlTag, sqlEnd, postgresFactory } = vi.hoisted(() => {
  const hoistedSqlTag = vi.fn(async () => []);
  const hoistedSqlEnd = vi.fn(async () => undefined);
  const hoistedPostgresFactory = vi.fn(() =>
    Object.assign(hoistedSqlTag, {
      end: hoistedSqlEnd,
    }),
  );

  return {
    sqlTag: hoistedSqlTag,
    sqlEnd: hoistedSqlEnd,
    postgresFactory: hoistedPostgresFactory,
  };
});

vi.mock("postgres", () => ({
  default: postgresFactory,
}));

import { POST } from "@/app/api/lead/route";

const validLeadPayload = {
  fullName: "Dr. Jordan Hale",
  professionalEmail: "jhale@northshoreclinic.com",
  practiceName: "Northshore Clinic",
  role: "physician",
  specialty: "aesthetics",
  state: "CA",
  monthlyVolume: "11-50",
  timeline: "this-month",
  notes: "Need pricing and availability for recurring clinic use.",
  confirmedProfessionalUse: true,
  landing_page_variant: "hcp-editorial-v1",
};

describe("POST /api/lead", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/clinician_leads";
    delete process.env.HUBSPOT_API_KEY;
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.RESEND_API_KEY;
    delete process.env.POSTMARK_SERVER_TOKEN;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it("accepts a valid lead when database storage succeeds even without CRM configured", async () => {
    const request = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validLeadPayload),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      success?: boolean;
      message?: string;
      leadScore?: { bucket?: string };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Request received");
    expect(body.leadScore?.bucket).toBeDefined();
    expect(sqlTag).toHaveBeenCalledTimes(2);
    expect(sqlEnd).toHaveBeenCalledTimes(1);
  });
});
