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

import { persistLeadRecord } from "@/lib/storage";

const leadPayload = {
  fullName: "Dr. Jordan Hale",
  professionalEmail: "jhale@northshoreclinic.com",
  practiceName: "Northshore Clinic",
  role: "physician" as const,
  specialty: "aesthetics" as const,
  state: "CA" as const,
  monthlyVolume: "11-50" as const,
  timeline: "this-month" as const,
  notes: "Need pricing and availability for recurring clinic use.",
  confirmedProfessionalUse: true,
  landing_page_variant: "hcp-editorial-v1",
};

const leadScore = {
  score: 82,
  bucket: "high" as const,
  routingRecommendation: "priority_queue" as const,
  reasons: ["Professional email domain", "Practice or facility provided"],
};

describe("persistLeadRecord", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/clinician_leads";
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
  });

  it("stores lead records through postgres when DATABASE_URL is configured", async () => {
    const result = await persistLeadRecord(leadPayload, leadScore);

    expect(result.status).toBe("stored");
    expect(postgresFactory).toHaveBeenCalledWith(
      process.env.DATABASE_URL,
      expect.any(Object),
    );
    expect(sqlTag).toHaveBeenCalledTimes(2);
    expect(sqlEnd).toHaveBeenCalledTimes(1);
  });
});
