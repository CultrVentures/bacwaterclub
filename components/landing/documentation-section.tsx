"use client";

import { ArrowRight, ClipboardPen, FileArchive, LifeBuoy, ShieldCheck } from "lucide-react";

import { SectionHeader } from "@/components/landing/section-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trackClientEvent } from "@/lib/tracking";

const documentationCards = [
  {
    title: "Product Insert",
    description:
      "Provide a documentation preview so professional buyers can review the product context before submitting a verified inquiry.",
    action: "Download preview",
    href: "/docs/hospira-bacteriostatic-water-product-insert.txt",
    download: true,
    eventName: "documentation_product_insert_click",
    icon: FileArchive,
  },
  {
    title: "Request Documentation",
    description:
      "Use the verified request form to ask for supporting materials needed before pricing or account review can move forward.",
    action: "Open request form",
    href: "#lead-form",
    eventName: "documentation_request_docs_click",
    icon: ClipboardPen,
  },
  {
    title: "Ordering Support",
    description:
      "Clarify how account setup, availability questions, and ordering support are handled once a qualified inquiry is on file.",
    action: "Start support request",
    href: "#lead-form",
    eventName: "documentation_support_click",
    icon: LifeBuoy,
  },
  {
    title: "Verification Workflow",
    description:
      "Explain how professional-use confirmation and purchaser validation shape access to pricing, availability, and follow-up.",
    action: "Review verification steps",
    href: "#how-it-works",
    eventName: "documentation_verification_click",
    icon: ShieldCheck,
  },
];

export function DocumentationSection() {
  return (
    <section id="documentation" className="section-spacing">
      <div className="container-shell space-y-10">
        <SectionHeader
          eyebrow="Documentation"
          title="Documentation and support, framed for professional buyers"
          description="Documentation access should clearly support the same verified procurement workflow rather than imply open retail ordering."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {documentationCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="h-full bg-white/72">
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <a
                      href={card.href}
                      download={card.download}
                      onClick={() => {
                        trackClientEvent(card.eventName);
                      }}
                    >
                      {card.action}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
