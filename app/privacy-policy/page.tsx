import type { Metadata } from "next";
import Link from "next/link";

import { AudienceBar } from "@/components/landing/audience-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy and data handling overview for clinician lead submissions.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AudienceBar />
      <main className="section-spacing">
        <div className="container-shell space-y-8">
          <Button asChild variant="outline">
            <Link href="/">Return to homepage</Link>
          </Button>

          <Card className="bg-white/84">
            <CardHeader>
              <CardTitle className="serif-heading text-5xl">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
              <p>
                This scaffold collects professional contact, practice, and attribution information
                strictly for pricing, documentation, and account-request review.
              </p>
              <p>
                Submitted information may be routed to CRM, notification, email, and storage
                systems configured by the operator of this site. Final production deployments should
                update this page with legal-approved privacy language before launch.
              </p>
              <p>
                Do not use placeholder policy copy in production without review by legal, privacy,
                and compliance stakeholders.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
