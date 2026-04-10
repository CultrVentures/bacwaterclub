"use client";

import { ArrowRight, BadgeCheck, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trackClientEvent } from "@/lib/tracking";

const trustItems = [
  "Rx Only",
  "U.S. HCP Audience",
  "Documentation Preview Available",
  "30 mL Multiple-Dose Vial",
  "Verification Required",
];

const qualificationPoints = [
  {
    title: "Practice review",
    detail: "Practice, purchaser, and sourcing details are reviewed before pricing access is extended.",
    icon: ClipboardCheck,
  },
  {
    title: "Documentation pathway",
    detail: "Qualified inquiries can request product documentation and ordering support from the same workflow.",
    icon: FileText,
  },
  {
    title: "Professional routing",
    detail: "Lead routing is structured for clinicians, administrators, and authorized healthcare buyers.",
    icon: ShieldCheck,
  },
];

export function HeroSection() {
  return (
    <section id="product" className="section-spacing clinical-grid overflow-hidden">
      <div className="container-shell relative">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <Badge className="bg-white/80 text-primary">Professional account request</Badge>

            <div className="space-y-5">
              <h1 className="serif-heading max-w-4xl text-5xl leading-[1.02] text-foreground md:text-6xl lg:text-7xl">
                Hospira Bacteriostatic Water for Injection for Clinical Buyers
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                A professional pathway for licensed clinicians and authorized healthcare purchasers
                seeking pricing, availability, and account setup.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <a
                  href="#lead-form"
                  onClick={() => {
                    trackClientEvent("hero_request_pricing_click");
                  }}
                >
                  Request Pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="/docs/hospira-bacteriostatic-water-product-insert.txt"
                  download
                  onClick={() => {
                    trackClientEvent("hero_product_insert_click");
                  }}
                >
                  Download Documentation Preview
                </a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-border/70 bg-white/70 px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden border-primary/12 bg-white/78">
            <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-br from-accent/90 via-white/60 to-transparent" />
            <CardHeader className="relative gap-4">
              <div className="flex items-center justify-between gap-4">
                <Badge variant="outline" className="bg-white/70 text-primary">
                  Qualification preview
                </Badge>
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  Verification workflow
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="serif-heading text-3xl">
                  Structured for clinical procurement
                </CardTitle>
                <CardDescription>
                  A polished request path designed for legitimate professional sourcing rather than
                  open retail checkout.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-5">
              {qualificationPoints.map((point, index) => {
                const Icon = point.icon;

                return (
                  <div key={point.title} className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-foreground">{point.title}</p>
                        <p className="text-sm leading-7 text-muted-foreground">{point.detail}</p>
                      </div>
                    </div>
                    {index < qualificationPoints.length - 1 ? <Separator /> : null}
                  </div>
                );
              })}

              <div className="rounded-[1.75rem] border border-primary/10 bg-background/90 p-5">
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  Typical request details
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Purchaser profile
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Clinician, administrator, or authorized buyer
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Inquiry outcome
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Pricing, availability, and ordering support
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
