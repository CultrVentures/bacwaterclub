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

const productStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: PRODUCT.name,
  description: PRODUCT.shortDescription,
  brand: { "@type": "Brand", name: "Bacwaterclub" },
  image: PRODUCT.gallery.map((src) => `${siteUrl}${src}`),
  sku: PRODUCT.variants[0].sku,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: PRODUCT.reviewsSummary.rating,
    reviewCount: PRODUCT.reviewsSummary.count,
  },
  offers: PRODUCT.variants.map((variant) => ({
    "@type": "Offer",
    sku: variant.sku,
    name: `${PRODUCT.name} — ${variant.label}`,
    price: (variant.priceCents / 100).toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/#buy`,
    itemCondition: "https://schema.org/NewCondition",
    ...(variant.compareAtCents
      ? { priceSpecification: { "@type": "PriceSpecification", price: (variant.compareAtCents / 100).toFixed(2), priceCurrency: "USD" } }
      : {}),
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />

      <SiteHeader />

      <main id="main-content">
        <ProductHero />
        <ProductSpecs />
        <LifestyleSection />
        <TrustBadges />
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
