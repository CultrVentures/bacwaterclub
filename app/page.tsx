import { AudienceBar } from "@/components/landing/audience-bar";
import { AudienceGridSection } from "@/components/landing/audience-grid-section";
import { DocumentationSection } from "@/components/landing/documentation-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LeadCaptureSection } from "@/components/landing/lead-capture-section";
import { PageViewTracker } from "@/components/landing/page-view-tracker";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TrustCardsSection } from "@/components/landing/trust-cards-section";
import { WorkflowStepsSection } from "@/components/landing/workflow-steps-section";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Hospira Bacteriostatic Water for Injection for Clinical Buyers",
  description:
    "Professional pricing, availability, and account-request landing page for qualified clinicians and authorized healthcare purchasers.",
  audience: {
    "@type": "Audience",
    audienceType: "Healthcare professionals and authorized purchasers",
    geographicArea: "United States",
  },
  publisher: {
    "@type": "Organization",
    name: "CULTR Health",
  },
};

export default function HomePage() {
  return (
    <>
      <PageViewTracker eventName="landing_page_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AudienceBar />
      <SiteHeader />

      <main id="main-content">
        <HeroSection />
        <TrustCardsSection />
        <AudienceGridSection />
        <WorkflowStepsSection />
        <LeadCaptureSection />
        <DocumentationSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <SiteFooter />
    </>
  );
}
