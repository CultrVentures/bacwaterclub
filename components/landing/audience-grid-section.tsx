import {
  Building,
  BriefcaseBusiness,
  Hospital,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

import { SectionHeader } from "@/components/landing/section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const audienceCards = [
  {
    title: "Physicians",
    description:
      "Clinicians requesting pricing, documentation, and account support for professional use.",
    icon: Stethoscope,
  },
  {
    title: "Nurse Practitioners / PAs",
    description:
      "Clinical decision-makers who need a clear path for availability questions and verified purchasing follow-up.",
    icon: UserRound,
  },
  {
    title: "Practice Administrators",
    description:
      "Administrative teams coordinating account setup, documentation requests, and internal approvals.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Procurement / Operations Teams",
    description:
      "Buyers managing sourcing timelines, facility validation, and purchasing volume.",
    icon: Building,
  },
  {
    title: "Clinics / Med Spas",
    description:
      "Qualified practices that need a structured request path for pricing, documentation, and support.",
    icon: Hospital,
  },
  {
    title: "Authorized Healthcare Buyers",
    description: "Approved purchasers sourcing on behalf of legitimate healthcare organizations in the United States.",
    icon: UsersRound,
  },
];

export function AudienceGridSection() {
  return (
    <section className="section-spacing" aria-label="Qualified audience">
      <div className="container-shell space-y-10">
        <SectionHeader
          eyebrow="Who this is for"
          title="Built for clinical teams and authorized purchasers"
          description="The page is designed for clinical decision-makers and authorized buyers who need a credible way to request pricing, documentation, or account support."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {audienceCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="h-full bg-white/72">
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Requests are reviewed before pricing, documentation, or account follow-up moves
                    forward.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
