import { AiContentSection } from "@/components/product/ai-content-section";
import { ProductFaqSection } from "@/components/product/faq-section";
import { LifestyleSection } from "@/components/product/lifestyle-section";
import { ProductHero } from "@/components/product/product-hero";
import { ProductSpecs } from "@/components/product/product-specs";
import { ReviewsSection } from "@/components/product/reviews-section";
import { TrustBadges } from "@/components/product/trust-badges";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PRODUCT, formatPriceCents } from "@/lib/product";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bacwaterclub.com";

/**
 * SCHEMA STRATEGY
 * ---------------
 * We emit a single JSON-LD @graph that includes every schema type the major
 * search engines + AI retrievers look for on a product page:
 *
 *   - Organization  (trust + entity disambiguation)
 *   - WebSite       (sitelinks search box)
 *   - BreadcrumbList (Google rich result)
 *   - Product + Offer + AggregateRating (Google Shopping + Bing)
 *   - FAQPage       (AI Overviews, Perplexity, Bing Copilot)
 *   - HowTo         (Google + ChatGPT "how to mix peptides" queries)
 *   - MedicalWebPage (authority signal for health-adjacent queries)
 *
 * Using @graph (instead of multiple loose blocks) lets us reference the same
 * entities across schemas by @id, which Google explicitly recommends.
 */
function buildStructuredData() {
  const productId = `${siteUrl}/#product`;
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const breadcrumbId = `${siteUrl}/#breadcrumb`;
  const webPageId = `${siteUrl}/#webpage`;
  const faqId = `${siteUrl}/#faq`;
  const howToId = `${siteUrl}/#howto`;

  const lowestPrice = Math.min(...PRODUCT.variants.map((v) => v.priceCents)) / 100;
  const highestPrice = Math.max(...PRODUCT.variants.map((v) => v.priceCents)) / 100;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Bacwaterclub",
        url: siteUrl,
        logo: `${siteUrl}/images/product/brand-mark.png`,
        description:
          "Direct-to-consumer supplier of research-grade 30 mL bacteriostatic water in Type I borosilicate glass vials, manufactured in a GMP-certified USA facility.",
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: "Bacwaterclub",
        publisher: { "@id": orgId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bacteriostatic Water 30 mL Glass Vials",
            item: `${siteUrl}/#product`,
          },
        ],
      },
      {
        "@type": ["WebPage", "MedicalWebPage"],
        "@id": webPageId,
        url: siteUrl,
        name: "Best Bacteriostatic Water for Peptide Reconstitution — 30 mL Glass Vials",
        description:
          "The complete guide to bacteriostatic water: what it is, how it differs from sterile water, how to reconstitute peptides with it, and where to buy research-grade 30 mL glass vials from a GMP-certified USA facility.",
        inLanguage: "en-US",
        isPartOf: { "@id": websiteId },
        about: { "@id": productId },
        primaryImageOfPage: `${siteUrl}/images/product/main-1.jpg`,
        breadcrumb: { "@id": breadcrumbId },
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().slice(0, 10),
        specialty: "Pharmacy",
        mainContentOfPage: {
          "@type": "WebPageElement",
          cssSelector: "#main-content",
        },
      },
      {
        "@type": "Product",
        "@id": productId,
        name: PRODUCT.name,
        description: PRODUCT.shortDescription,
        sku: PRODUCT.variants[0].sku,
        mpn: "BWC-30ML",
        category: "Laboratory Supplies > Bacteriostatic Water",
        brand: { "@type": "Brand", name: "Bacwaterclub" },
        manufacturer: { "@id": orgId },
        image: PRODUCT.gallery.map((src) => `${siteUrl}${src}`),
        url: siteUrl,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: PRODUCT.reviewsSummary.rating,
          reviewCount: PRODUCT.reviewsSummary.count,
          bestRating: 5,
          worstRating: 1,
        },
        review: PRODUCT.reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
          name: r.title,
          reviewBody: r.body,
        })),
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: lowestPrice.toFixed(2),
          highPrice: highestPrice.toFixed(2),
          offerCount: PRODUCT.variants.length,
          availability: "https://schema.org/InStock",
          seller: { "@id": orgId },
          offers: PRODUCT.variants.map((variant) => ({
            "@type": "Offer",
            sku: variant.sku,
            name: `${PRODUCT.name} — ${variant.label}`,
            price: (variant.priceCents / 100).toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/#buy`,
            itemCondition: "https://schema.org/NewCondition",
            priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: variant.priceCents >= 4500 ? "0" : "5.99",
                currency: "USD",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "US",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 2,
                  maxValue: 5,
                  unitCode: "DAY",
                },
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "US",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
          })),
        },
        additionalProperty: PRODUCT.specs.map((spec) => ({
          "@type": "PropertyValue",
          name: spec.label,
          value: spec.value,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: PRODUCT.faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        "@id": howToId,
        name: PRODUCT.howToReconstitute.name,
        description: PRODUCT.howToReconstitute.description,
        totalTime: PRODUCT.howToReconstitute.totalTime,
        supply: [
          { "@type": "HowToSupply", name: "Lyophilized peptide vial" },
          {
            "@type": "HowToSupply",
            name: "Bacwaterclub 30 mL bacteriostatic water vial",
          },
          { "@type": "HowToSupply", name: "Sterile syringe and needle" },
          { "@type": "HowToSupply", name: "Isopropyl alcohol swabs" },
        ],
        tool: [{ "@type": "HowToTool", name: "Laboratory refrigerator (2–8°C)" }],
        step: PRODUCT.howToReconstitute.steps.map((step, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: step.name,
          text: step.text,
          url: `${siteUrl}/#guide`,
        })),
      },
    ],
  };
}

export default function HomePage() {
  const structuredData = buildStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SiteHeader />

      <main id="main-content">
        <ProductHero />
        <ProductSpecs />
        <LifestyleSection />
        <TrustBadges />
        <AiContentSection />
        <ReviewsSection />
        <ProductFaqSection />
      </main>

      <SiteFooter />
    </>
  );
}

// Re-export for any external callers — product price is derived, not hardcoded here.
export const _productStartingPrice = formatPriceCents(
  Math.min(...PRODUCT.variants.map((v) => v.priceCents)),
);
