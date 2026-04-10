import type { LeadFormValues } from "@/lib/validation";

export type LeadScoreBucket = "low" | "medium" | "high";

export interface LeadScoreResult {
  score: number;
  bucket: LeadScoreBucket;
  routingRecommendation: "priority_queue" | "standard_queue" | "review_queue" | "spam_review";
  reasons: string[];
}

const freeEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
]);

const roleWeights: Record<LeadFormValues["role"], number> = {
  physician: 18,
  "nurse-practitioner-pa": 16,
  "practice-administrator": 14,
  procurement: 16,
  "clinic-med-spa": 12,
  "authorized-buyer": 15,
  other: 5,
};

const volumeWeights: Record<LeadFormValues["monthlyVolume"], number> = {
  "1-10": 6,
  "11-50": 12,
  "51-150": 18,
  "151+": 20,
};

const timelineWeights: Record<LeadFormValues["timeline"], number> = {
  "within-2-weeks": 18,
  "this-month": 14,
  "this-quarter": 8,
  researching: 4,
};

function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function getNoteQualityPoints(notes?: string) {
  if (!notes) {
    return 0;
  }

  if (notes.length >= 90) {
    return 12;
  }

  if (notes.length >= 45) {
    return 8;
  }

  if (notes.length >= 18) {
    return 4;
  }

  return 1;
}

export function scoreLead(payload: LeadFormValues): LeadScoreResult {
  const reasons: string[] = [];
  const emailDomain = getEmailDomain(payload.professionalEmail);
  const isFreeEmail = freeEmailDomains.has(emailDomain);
  let score = 0;

  if (isFreeEmail) {
    score += 6;
    reasons.push("Free email domain");
  } else {
    score += 18;
    reasons.push("Professional email domain");
  }

  score += roleWeights[payload.role];
  reasons.push(`Role signal: ${payload.role}`);

  if (payload.practiceName.length >= 3) {
    score += 12;
    reasons.push("Practice or facility provided");
  }

  if (payload.specialty !== "other") {
    score += 4;
    reasons.push("Specialty context supplied");
  }

  score += volumeWeights[payload.monthlyVolume];
  reasons.push(`Volume signal: ${payload.monthlyVolume}`);

  score += timelineWeights[payload.timeline];
  reasons.push(`Timeline signal: ${payload.timeline}`);

  if (payload.confirmedProfessionalUse) {
    score += 8;
    reasons.push("Professional-use confirmation provided");
  }

  const noteQualityPoints = getNoteQualityPoints(payload.notes);
  score += noteQualityPoints;

  if (noteQualityPoints >= 8) {
    reasons.push("Detailed sourcing notes");
  } else if (noteQualityPoints > 0) {
    reasons.push("Basic sourcing notes");
  }

  const normalizedScore = Math.min(score, 100);

  let bucket: LeadScoreBucket = "low";
  let routingRecommendation: LeadScoreResult["routingRecommendation"] = "review_queue";

  if (normalizedScore >= 75) {
    bucket = "high";
    routingRecommendation = "priority_queue";
  } else if (normalizedScore >= 55) {
    bucket = "medium";
    routingRecommendation = "standard_queue";
  }

  return {
    score: normalizedScore,
    bucket,
    routingRecommendation,
    reasons,
  };
}
