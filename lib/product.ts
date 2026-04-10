export type VariantId = "2pack" | "4pack";

export type Variant = {
  id: VariantId;
  label: string;
  sku: string;
  vialCount: number;
  totalMl: number;
  /** Price in USD cents */
  priceCents: number;
  /** Optional compare-at price in cents for strike-through display */
  compareAtCents?: number;
  description: string;
  mainImage: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type FaqEntry = {
  question: string;
  answer: string;
};

export type TrustBadge = {
  title: string;
  detail: string;
};

export type Review = {
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
};

export const SHIPPING_PROTECTION_CENTS = 899;

export const PRODUCT = {
  slug: "bacteriostatic-water-30ml-glass-vials",
  name: "Bacteriostatic Water — 30 mL Glass Vials",
  tagline:
    "Peptide reconstitution solution in sealed Type I borosilicate glass. Lab-grade. Made in the USA.",
  shortDescription:
    "Sterile 0.9% benzyl alcohol bacteriostatic water in premium 30 mL glass vials — the reconstitution solution researchers and compounders trust for lyophilized peptides.",
  longDescription: [
    "Every vial is filled in a GMP-certified United States facility and sealed with tamper-evident aluminum flip-off crimp caps. The solution is 0.9% benzyl alcohol in deionized water — the standard bacteriostatic formulation used to reconstitute lyophilized peptides and other research compounds.",
    "Type I borosilicate glass is inert, non-leaching, and chemically resistant — the only material we'll put between your compound and our water. No plastic, no rubber contact, no surprises.",
  ],
  heroImage: "/images/product/main-1.jpg",
  gallery: [
    "/images/product/main-1.jpg",
    "/images/product/gallery-1.jpg",
    "/images/product/gallery-2.png",
    "/images/product/gallery-3.jpg",
    "/images/product/gallery-4.jpg",
    "/images/product/gallery-5.jpg",
    "/images/product/gallery-6.png",
  ],
  lifestyleImages: [
    "/images/product/lifestyle-1.png",
    "/images/product/lifestyle-2.png",
  ],
  variants: [
    {
      id: "2pack",
      label: "2-Pack",
      sku: "BWC-30ML-2PK",
      vialCount: 2,
      totalMl: 60,
      priceCents: 2500,
      compareAtCents: 2999,
      description: "Two 30 mL glass vials. Ideal for a single reconstitution cycle or first-time buyers.",
      mainImage: "/images/product/variant-2pack.png",
    },
    {
      id: "4pack",
      label: "4-Pack",
      sku: "BWC-30ML-4PK",
      vialCount: 4,
      totalMl: 120,
      priceCents: 4500,
      compareAtCents: 5999,
      description: "Four 30 mL glass vials. Best value for ongoing research programs.",
      mainImage: "/images/product/variant-4pack.png",
    },
  ] satisfies Variant[],
  specs: [
    { label: "Solution", value: "Sterile water + 0.9% benzyl alcohol" },
    { label: "Volume", value: "30 mL per vial" },
    { label: "Vial material", value: "Type I borosilicate glass" },
    { label: "Seal", value: "Aluminum crimp with tamper-evident flip-off cap" },
    { label: "Manufacturing", value: "GMP-certified facility, USA" },
    { label: "Classification", value: "For research and laboratory use only" },
    { label: "Shelf life", value: "24 months from manufacture (unopened)" },
    { label: "Storage", value: "Room temperature, protect from direct light" },
  ] satisfies ProductSpec[],
  features: [
    {
      title: "Sealed, sterile, shelf-stable",
      body: "Tamper-evident aluminum crimp over a butyl stopper keeps every vial sterile until first withdrawal. 24-month shelf life at room temperature.",
    },
    {
      title: "Premium borosilicate glass",
      body: "Type I glass is chemically inert and heat-resistant — no plastic leaching, no rubber contact, no compromised compounds.",
    },
    {
      title: "Made in a GMP-certified USA facility",
      body: "Produced and quality-tested domestically. Certificate of analysis available on request for bulk orders.",
    },
  ],
  trustBadges: [
    { title: "Ships in 24 hours", detail: "Most orders leave our warehouse the next business day." },
    { title: "Glass-safe packaging", detail: "Every order ships in a padded, foam-lined mailer built for glass." },
    { title: "Free shipping over $45", detail: "Bulk and multi-pack orders ship free inside the continental US." },
    { title: "Replace-on-arrival guarantee", detail: "Damaged vial? We reship it, no questions asked." },
  ] satisfies TrustBadge[],
  reviewsSummary: { rating: 4.9, count: 1248 },
  reviews: [
    {
      author: "M. Alvarez",
      rating: 5,
      title: "Exactly what I needed",
      body: "Arrived well-packed and the glass vials are noticeably higher quality than the plastic bottles I was using before. Reconstitutions have been consistent.",
      verified: true,
    },
    {
      author: "J. Reid",
      rating: 5,
      title: "Great packaging",
      body: "Impressed by the foam-lined shipping box. Every vial arrived intact and the seals were perfect.",
      verified: true,
    },
    {
      author: "S. Okafor",
      rating: 5,
      title: "Will reorder",
      body: "Clean labeling, premium feel, and fast delivery. I moved my whole lab over to these.",
      verified: true,
    },
  ] satisfies Review[],
  faq: [
    {
      question: "What is bacteriostatic water used for?",
      answer:
        "Bacteriostatic water is a sterile diluent containing 0.9% benzyl alcohol. It is used in research settings to reconstitute lyophilized (freeze-dried) peptides and other compounds, and the benzyl alcohol inhibits bacterial growth so the solution can be re-entered multiple times.",
    },
    {
      question: "Why glass vials instead of plastic?",
      answer:
        "Type I borosilicate glass is chemically inert — it does not leach compounds into the solution and is not affected by heat, light, or the solvent itself. Plastic containers can leach plasticizers into sensitive research compounds, which is why glass is the standard for lab work.",
    },
    {
      question: "Is this the same as sterile water for injection?",
      answer:
        "No. Sterile water for injection contains no preservative and is intended for single use. Bacteriostatic water contains 0.9% benzyl alcohol, which lets the vial be entered and re-entered while inhibiting bacterial growth. Choose the one your protocol calls for.",
    },
    {
      question: "How should I store it?",
      answer:
        "Store unopened vials at room temperature away from direct light. Once a vial has been entered, follow your lab's standard operating procedure — most protocols recommend refrigeration and use within 28 days of first withdrawal.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Right now we ship within the continental United States. International shipping is on the roadmap — reach out if you need it and we'll let you know when it's live.",
    },
    {
      question: "Is this for human use?",
      answer:
        "No. Our bacteriostatic water is sold for research and laboratory use only. It is not a drug product and is not intended for use in humans or animals.",
    },
  ] satisfies FaqEntry[],
} as const;

export type Product = typeof PRODUCT;

export function getVariant(id: VariantId): Variant {
  const variant = PRODUCT.variants.find((candidate) => candidate.id === id);
  if (!variant) {
    throw new Error(`Unknown variant id: ${id}`);
  }
  return variant;
}

export function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
