import { z } from "zod";

export const defaultLandingPageVariant = "hcp-editorial-v1";

export const attributionFieldNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "reddit_click_id",
  "landing_page_variant",
] as const;

export const roleValues = [
  "physician",
  "nurse-practitioner-pa",
  "practice-administrator",
  "procurement",
  "clinic-med-spa",
  "authorized-buyer",
  "other",
] as const;

export const leadRoleOptions = [
  { value: "physician", label: "Physician" },
  { value: "nurse-practitioner-pa", label: "Nurse Practitioner / PA" },
  { value: "practice-administrator", label: "Practice Administrator" },
  { value: "procurement", label: "Procurement / Operations" },
  { value: "clinic-med-spa", label: "Clinic / Med Spa" },
  { value: "authorized-buyer", label: "Authorized Healthcare Buyer" },
  { value: "other", label: "Other Professional Role" },
] as const;

export const specialtyValues = [
  "aesthetics",
  "primary-care",
  "dermatology",
  "multi-specialty",
  "med-spa",
  "surgical",
  "other",
] as const;

export const specialtyOptions = [
  { value: "aesthetics", label: "Aesthetics" },
  { value: "primary-care", label: "Primary Care" },
  { value: "dermatology", label: "Dermatology" },
  { value: "multi-specialty", label: "Multi-specialty Practice" },
  { value: "med-spa", label: "Med Spa" },
  { value: "surgical", label: "Surgical / Procedural" },
  { value: "other", label: "Other" },
] as const;

export const monthlyVolumeValues = ["1-10", "11-50", "51-150", "151+"] as const;

export const monthlyVolumeOptions = [
  { value: "1-10", label: "1-10 units / month" },
  { value: "11-50", label: "11-50 units / month" },
  { value: "51-150", label: "51-150 units / month" },
  { value: "151+", label: "151+ units / month" },
] as const;

export const timelineValues = [
  "within-2-weeks",
  "this-month",
  "this-quarter",
  "researching",
] as const;

export const timelineOptions = [
  { value: "within-2-weeks", label: "Within 2 weeks" },
  { value: "this-month", label: "This month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "researching", label: "Researching / future need" },
] as const;

export const stateValues = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
] as const;

export const stateOptions = stateValues.map((value) => ({ value, label: value }));

const optionalTrackingField = z
  .string()
  .trim()
  .max(200, "Tracking values must be concise.")
  .optional()
  .or(z.literal(""));

export const leadFormSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter a full name.").max(100),
  professionalEmail: z
    .string()
    .trim()
    .email("Please enter a professional email address.")
    .max(160),
  practiceName: z
    .string()
    .trim()
    .min(2, "Please enter a practice or facility name.")
    .max(140),
  role: z.enum(roleValues, {
    error: "Please select your role.",
  }),
  specialty: z.enum(specialtyValues, {
    error: "Please select a specialty.",
  }),
  state: z.enum(stateValues, {
    error: "Please select a state.",
  }),
  monthlyVolume: z.enum(monthlyVolumeValues, {
    error: "Please estimate monthly volume.",
  }),
  timeline: z.enum(timelineValues, {
    error: "Please select a timeline.",
  }),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1,000 characters.")
    .optional()
    .or(z.literal("")),
  confirmedProfessionalUse: z
    .boolean()
    .refine((value) => value, {
      message: "Your request must be confirmed for professional use.",
    }),
  utm_source: optionalTrackingField,
  utm_medium: optionalTrackingField,
  utm_campaign: optionalTrackingField,
  utm_content: optionalTrackingField,
  utm_term: optionalTrackingField,
  reddit_click_id: optionalTrackingField,
  landing_page_variant: optionalTrackingField,
  honeypot: z.string().optional(),
});

export type LeadFormValues = z.output<typeof leadFormSchema>;
export type LeadFormInput = z.input<typeof leadFormSchema>;

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeOptionalText(value: unknown, maxLength: number) {
  const sanitized = sanitizeText(value, maxLength);
  return sanitized.length > 0 ? sanitized : undefined;
}

export function sanitizeLeadPayload(payload: Record<string, unknown>) {
  return {
    fullName: sanitizeText(payload.fullName, 100),
    professionalEmail: sanitizeText(payload.professionalEmail, 160).toLowerCase(),
    practiceName: sanitizeText(payload.practiceName, 140),
    role: sanitizeText(payload.role, 60),
    specialty: sanitizeText(payload.specialty, 60),
    state: sanitizeText(payload.state, 2).toUpperCase(),
    monthlyVolume: sanitizeText(payload.monthlyVolume, 20),
    timeline: sanitizeText(payload.timeline, 40),
    notes: sanitizeText(payload.notes, 1000),
    confirmedProfessionalUse:
      payload.confirmedProfessionalUse === true ||
      payload.confirmedProfessionalUse === "true" ||
      payload.confirmedProfessionalUse === "on",
    utm_source: sanitizeOptionalText(payload.utm_source, 200),
    utm_medium: sanitizeOptionalText(payload.utm_medium, 200),
    utm_campaign: sanitizeOptionalText(payload.utm_campaign, 200),
    utm_content: sanitizeOptionalText(payload.utm_content, 200),
    utm_term: sanitizeOptionalText(payload.utm_term, 200),
    reddit_click_id: sanitizeOptionalText(payload.reddit_click_id, 200),
    landing_page_variant:
      sanitizeOptionalText(payload.landing_page_variant, 200) ?? defaultLandingPageVariant,
    honeypot: sanitizeOptionalText(payload.honeypot, 120),
  };
}
