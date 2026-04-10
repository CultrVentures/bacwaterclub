import { FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

import { LeadCaptureForm } from "@/components/landing/lead-capture-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const supportPoints = [
  {
    title: "Qualified review",
    description:
      "Requests are reviewed for purchaser legitimacy, practice context, and sourcing need before pricing follow-up is routed.",
    icon: ShieldCheck,
  },
  {
    title: "Documentation-ready path",
    description:
      "Product insert and support documentation can be requested alongside pricing and account setup needs.",
    icon: FileCheck2,
  },
  {
    title: "Priority-aware follow-up",
    description:
      "Urgency, role, and practice context help route qualified requests toward the right next step without shifting into a consumer checkout flow.",
    icon: Sparkles,
  },
];

export function LeadCaptureSection() {
  return (
    <section id="lead-form" className="section-spacing">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-fit bg-primary text-primary-foreground">
          <CardHeader className="space-y-4">
            <Badge
              variant="outline"
              className="w-fit border-white/16 bg-white/8 text-primary-foreground"
            >
              Verified request form
            </Badge>
            <div className="space-y-3">
              <CardTitle className="serif-heading text-4xl text-primary-foreground">
                Start a verified pricing and account request
              </CardTitle>
              <CardDescription className="text-primary-foreground/76">
                Designed for licensed clinicians, practice teams, and authorized healthcare
                purchasers seeking a professional procurement path.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {supportPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <div key={point.title} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-base font-semibold text-primary-foreground">
                        {point.title}
                      </p>
                      <p className="text-sm leading-7 text-primary-foreground/76">
                        {point.description}
                      </p>
                    </div>
                  </div>
                  {index < supportPoints.length - 1 ? (
                    <Separator className="bg-white/12" />
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-white/84">
          <CardHeader className="space-y-3">
            <div className="space-y-2">
              <CardTitle className="serif-heading text-4xl">
                Request pricing, availability, and account setup
              </CardTitle>
              <CardDescription>
                Complete the form below so your request can be reviewed and routed with the right
                purchaser, practice, and urgency context.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
