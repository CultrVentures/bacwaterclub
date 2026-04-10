import { describe, expect, it } from "vitest";

import {
  defaultLandingPageVariant,
  leadFormSchema,
  sanitizeLeadPayload,
} from "@/lib/validation";

describe("leadFormSchema", () => {
  it("accepts a qualified professional request", () => {
    const result = leadFormSchema.safeParse({
      fullName: "Dr. Taylor Quinn",
      professionalEmail: "tquinn@northshoreclinic.com",
      practiceName: "Northshore Clinic",
      role: "physician",
      specialty: "aesthetics",
      state: "CA",
      monthlyVolume: "51-150",
      timeline: "within-2-weeks",
      notes: "Need pricing and account support for recurring clinic demand.",
      confirmedProfessionalUse: true,
      utm_source: "reddit",
      utm_medium: "paid_social",
      utm_campaign: "hcp-q2",
      utm_content: "editorial-hero",
      utm_term: "bacteriostatic water",
      reddit_click_id: "rdt-12345",
      landing_page_variant: defaultLandingPageVariant,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid or unconfirmed requests", () => {
    const result = leadFormSchema.safeParse({
      fullName: "  ",
      professionalEmail: "not-an-email",
      practiceName: "",
      role: "physician",
      specialty: "aesthetics",
      state: "CA",
      monthlyVolume: "1-10",
      timeline: "researching",
      notes: "",
      confirmedProfessionalUse: false,
      landing_page_variant: defaultLandingPageVariant,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(" ");
      expect(message).toContain("full name");
      expect(message).toContain("professional email");
      expect(message).toContain("confirmed");
    }
  });

  it("allows an empty notes field when the rest of the request is valid", () => {
    const result = leadFormSchema.safeParse({
      fullName: "Dr. Taylor Quinn",
      professionalEmail: "tquinn@northshoreclinic.com",
      practiceName: "Northshore Clinic",
      role: "physician",
      specialty: "aesthetics",
      state: "CA",
      monthlyVolume: "51-150",
      timeline: "within-2-weeks",
      notes: "",
      confirmedProfessionalUse: true,
      landing_page_variant: defaultLandingPageVariant,
    });

    expect(result.success).toBe(true);
  });
});

describe("sanitizeLeadPayload", () => {
  it("trims strings, strips markup, and applies the default variant", () => {
    const sanitized = sanitizeLeadPayload({
      fullName: "  Dr. Ava Stone  ",
      professionalEmail: " ava.stone@clinic.org ",
      practiceName: "<b>Stone Clinic</b>",
      role: "physician",
      specialty: "primary-care",
      state: "NY",
      monthlyVolume: "11-50",
      timeline: "this-month",
      notes: " Need <script>alert(1)</script> verified availability. ",
      confirmedProfessionalUse: true,
    });

    expect(sanitized.fullName).toBe("Dr. Ava Stone");
    expect(sanitized.professionalEmail).toBe("ava.stone@clinic.org");
    expect(sanitized.practiceName).toBe("Stone Clinic");
    expect(sanitized.notes).toBe("Need verified availability.");
    expect(sanitized.landing_page_variant).toBe(defaultLandingPageVariant);
  });
});
