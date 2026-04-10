"use client";

import { ArrowRight, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackClientEvent } from "@/lib/tracking";

export function FinalCtaSection() {
  return (
    <section className="section-spacing pt-0">
      <div className="container-shell">
        <Card className="overflow-hidden bg-primary text-primary-foreground">
          <CardContent className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.18em] text-primary-foreground/76">
                Professional follow-up
              </p>
              <div className="space-y-3">
                <h2 className="serif-heading text-4xl text-primary-foreground md:text-5xl">
                  Start your clinical account request
                </h2>
                <p className="max-w-2xl text-base leading-7 text-primary-foreground/76 md:text-lg">
                  Use the verified request form to begin pricing review, documentation follow-up,
                  or rep outreach for a qualified account request.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Button asChild size="lg" variant="secondary">
                <a
                  href="#lead-form"
                  onClick={() => {
                    trackClientEvent("final_cta_click");
                  }}
                >
                  Request Pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-primary-foreground hover:bg-white/14">
                <a
                  href="#lead-form"
                  onClick={() => {
                    trackClientEvent("final_rep_click");
                  }}
                >
                  Speak With a Rep
                  <PhoneCall className="h-4 w-4" />
                </a>
              </Button>
              <p className="max-w-xs text-sm leading-6 text-primary-foreground/76">
                Rep conversations begin through the same verified request workflow used for pricing
                and documentation follow-up.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
