import { describe, expect, it } from "vitest";

import { scoreLead } from "@/lib/lead-scoring";

describe("scoreLead", () => {
  it("prioritizes strong clinician inquiries", () => {
    const result = scoreLead({
      fullName: "Dr. Taylor Quinn",
      professionalEmail: "tquinn@northshoreclinic.com",
      practiceName: "Northshore Clinic",
      role: "physician",
      specialty: "aesthetics",
      state: "CA",
      monthlyVolume: "51-150",
      timeline: "within-2-weeks",
      notes: "Recurring clinic demand, pricing and availability needed this month.",
      confirmedProfessionalUse: true,
      landing_page_variant: "hcp-editorial-v1",
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.bucket).toBe("high");
    expect(result.routingRecommendation).toBe("priority_queue");
  });

  it("downgrades vague requests from free email domains", () => {
    const result = scoreLead({
      fullName: "Jordan",
      professionalEmail: "jordanbuyer@gmail.com",
      practiceName: "",
      role: "other",
      specialty: "other",
      state: "FL",
      monthlyVolume: "1-10",
      timeline: "researching",
      notes: "checking price",
      confirmedProfessionalUse: true,
      landing_page_variant: "hcp-editorial-v1",
    });

    expect(result.score).toBeLessThan(55);
    expect(result.bucket).toBe("low");
    expect(result.routingRecommendation).toBe("review_queue");
  });

  it("keeps complete operations inquiries in the middle when intent is real but urgency is softer", () => {
    const result = scoreLead({
      fullName: "Morgan Lee",
      professionalEmail: "morgan.ops@gmail.com",
      practiceName: "Crescent Aesthetics",
      role: "procurement",
      specialty: "med-spa",
      state: "TX",
      monthlyVolume: "11-50",
      timeline: "this-quarter",
      notes: "Reviewing sourcing options for a new location opening later this quarter.",
      confirmedProfessionalUse: true,
      landing_page_variant: "hcp-editorial-v1",
    });

    expect(result.score).toBeGreaterThanOrEqual(55);
    expect(result.score).toBeLessThan(75);
    expect(result.bucket).toBe("medium");
    expect(result.routingRecommendation).toBe("standard_queue");
  });
});
