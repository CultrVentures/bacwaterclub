"use client";

import { SectionHeader } from "@/components/landing/section-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackClientEvent } from "@/lib/tracking";

const faqItems = [
  {
    question: "Who can request pricing?",
    answer:
      "Pricing requests are intended for licensed clinicians, practice administrators, procurement teams, clinics, med spas, and other authorized healthcare purchasers seeking information for professional use.",
  },
  {
    question: "Is this intended for clinical use?",
    answer:
      "This experience is framed for legitimate professional sourcing and account review. It is not positioned as a general consumer purchase flow.",
  },
  {
    question: "How does verification work?",
    answer:
      "Submitted requests are reviewed against purchaser, practice, and sourcing details so pricing, availability, and follow-up can be routed appropriately for professional buyers.",
  },
  {
    question: "Can I access product documentation?",
    answer:
      "Yes. Documentation pathways are surfaced throughout the page so qualified buyers can request supporting materials alongside pricing and account inquiries.",
  },
  {
    question: "What happens after I submit a request?",
    answer:
      "Your inquiry is received, reviewed, and routed for follow-up based on urgency and fit. Qualified buyers receive next-step support related to pricing, availability, and account setup.",
  },
  {
    question: "Is this page intended for consumers?",
    answer:
      "No. This page is built for healthcare professionals and authorized purchasers. It is not an open retail or consumer checkout experience.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="section-spacing">
      <div className="container-shell space-y-10">
        <SectionHeader
          eyebrow="FAQ"
          title="Clear answers for qualified professional buyers"
          description="The FAQ reinforces intended audience, documentation access, and what happens after a request is submitted."
          align="center"
        />

        <Accordion
          type="single"
          collapsible
          className="grid gap-4"
          onValueChange={(value) => {
            if (value) {
              trackClientEvent("faq_opened", { item: value });
            }
          }}
        >
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
