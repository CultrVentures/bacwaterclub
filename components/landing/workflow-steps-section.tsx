"use client";

import { ArrowRight, Clock3, Route, ShieldCheck, Workflow } from "lucide-react";

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

const steps = [
  {
    number: "01",
    title: "Submit account request",
    description:
      "Share your professional contact information, practice details, and current sourcing needs.",
  },
  {
    number: "02",
    title: "Verify practice and purchaser details",
    description:
      "Your request is reviewed to confirm purchaser legitimacy, facility context, and professional-use intent.",
  },
  {
    number: "03",
    title: "Receive pricing, availability, and account support",
    description:
      "Qualified requests move into pricing follow-up, documentation support, and account assistance based on timing and purchasing context.",
  },
];

const operationsPanels = [
  {
    title: "Priority-aware routing",
    description:
      "Role, timing, and sourcing context help guide the right follow-up path.",
    icon: Route,
  },
  {
    title: "Professional-use review",
    description:
      "Requests are reviewed within a controlled professional workflow rather than an open retail purchase path.",
    icon: ShieldCheck,
  },
  {
    title: "Complete request record",
    description:
      "Practice details, timing, and request context stay attached so follow-up remains organized from first inquiry onward.",
    icon: Workflow,
  },
];

export function WorkflowStepsSection() {
  return (
    <section id="how-it-works" className="section-spacing">
      <div className="container-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-10">
          <SectionHeader
            eyebrow="How ordering works"
            title="A clear three-step procurement path"
          description="The next step is straightforward: submit a verified request, complete review, and receive the right follow-up for pricing, documentation, or account support."
          />

          <div className="grid gap-6">
            {steps.map((step) => (
              <Card key={step.number} className="bg-white/74">
                <CardContent className="grid gap-5 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
                    {step.number}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/16 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-primary-foreground/85">
              <Clock3 className="h-3.5 w-3.5" />
              Review process
            </div>
            <div className="space-y-2">
              <CardTitle className="serif-heading text-3xl text-primary-foreground">
                Built for timely professional follow-up
              </CardTitle>
              <CardDescription className="text-primary-foreground/78">
                Each request is reviewed and routed according to purchaser type, timeline, and
                sourcing need so qualified buyers receive the right next step quickly.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {operationsPanels.map((panel) => {
              const Icon = panel.icon;

              return (
                <div key={panel.title} className="flex gap-4">
                  <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-primary-foreground">{panel.title}</p>
                    <p className="text-sm leading-7 text-primary-foreground/78">
                      {panel.description}
                    </p>
                  </div>
                </div>
              );
            })}

            <Button asChild variant="secondary" size="lg">
              <a
                href="#lead-form"
                onClick={() => {
                  trackClientEvent("workflow_cta_click");
                }}
              >
                Start verified request
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
