import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Headphones, ShieldCheck } from "lucide-react";

import { AudienceBar } from "@/components/landing/audience-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { ThankYouTracker } from "@/components/landing/thank-you-tracker";
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

export const metadata: Metadata = {
  title: "Request Received",
  description:
    "Confirmation and next-step expectations for clinician pricing and account requests.",
};

const nextSteps = [
  "Your request has been received and entered into review.",
  "Purchaser, practice, and sourcing details are assessed before pricing follow-up is routed.",
  "Rep or account support follow-up is typically initiated within one business day.",
];

const supportOptions = [
  {
    title: "Documentation support",
    description:
      "If you need supporting materials while review is in progress, return to the documentation section from the main page.",
    icon: FileText,
  },
  {
    title: "Verification-aware follow-up",
    description:
      "The next response may include clarification on purchaser details, practice context, or documentation needs before access is extended.",
    icon: ShieldCheck,
  },
  {
    title: "Ordering support readiness",
    description:
      "Qualified buyers can be routed into pricing, availability, and account support without shifting into a consumer checkout path.",
    icon: Headphones,
  },
];

export default function ThankYouPage() {
  return (
    <>
      <ThankYouTracker />

      <AudienceBar />

      <main id="main-content" className="section-spacing">
        <div className="container-shell grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="bg-white/84">
            <CardHeader className="space-y-5">
              <Badge variant="outline" className="w-fit bg-white/70 text-primary">
                Request received
              </Badge>
              <div className="space-y-3">
                <h1 className="serif-heading text-5xl leading-tight">Review in progress</h1>
                <CardDescription className="max-w-2xl text-base leading-7">
                  Thank you for submitting your clinical account request. The inquiry has been
                  recorded and is now being reviewed for purchaser, practice, and sourcing context.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                {nextSteps.map((step, index) => (
                  <div key={step} className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-sm leading-7 text-muted-foreground">{step}</p>
                    </div>
                    {index < nextSteps.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/#documentation">View documentation options</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    Return to homepage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="space-y-3">
              <Badge
                variant="outline"
                className="w-fit border-white/16 bg-white/8 text-primary-foreground"
              >
                Support options
              </Badge>
              <div className="space-y-2">
                <CardTitle className="serif-heading text-4xl text-primary-foreground">
                  What happens next
                </CardTitle>
                <CardDescription className="text-primary-foreground/76">
                  The experience remains centered on professional review, documentation support, and
                  a controlled procurement path for qualified buyers.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {supportOptions.map((option, index) => {
                const Icon = option.icon;

                return (
                  <div key={option.title} className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-primary-foreground">
                          {option.title}
                        </p>
                        <p className="text-sm leading-7 text-primary-foreground/76">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {index < supportOptions.length - 1 ? (
                      <Separator className="bg-white/12" />
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
