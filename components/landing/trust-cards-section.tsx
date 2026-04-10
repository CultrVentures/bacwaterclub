"use client";

import { ArrowRight, Building2, ClipboardList, Shield } from "lucide-react";

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

const cards = [
  {
    title: "Official product context",
    description:
      "Frames Hospira Bacteriostatic Water for Injection within a professional request path for pricing, documentation, and account follow-up.",
    icon: Building2,
  },
  {
    title: "Clinician-first workflow",
    description:
      "Gives clinicians, practice teams, and procurement staff a clear starting point for account setup, availability questions, and next-step support.",
    icon: ClipboardList,
  },
  {
    title: "Compliance-forward procurement",
    description:
      "Places professional-use confirmation and purchaser review before pricing follow-up so the experience remains controlled and credible.",
    icon: Shield,
  },
];

export function TrustCardsSection() {
  return (
    <section className="section-spacing" aria-label="Trust and product context">
      <div className="container-shell space-y-10">
        <SectionHeader
          eyebrow="Product context"
          title="Built for legitimate clinical purchasing inquiries"
          description="The page helps qualified professionals move from initial interest to verified pricing, documentation, and account review without consumer-style checkout cues."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="h-full bg-white/70">
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="serif-heading text-3xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="px-0">
                    <a
                      href="#documentation"
                      onClick={() => {
                        trackClientEvent("trust_card_docs_click", {
                          cardTitle: card.title,
                        });
                      }}
                    >
                      Review documentation options
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
