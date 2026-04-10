import type { Metadata } from "next";
import Link from "next/link";

import { AudienceBar } from "@/components/landing/audience-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms",
  description: "Professional-use terms placeholder for the clinician landing page scaffold.",
};

export default function TermsPage() {
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
              <CardTitle className="serif-heading text-5xl">Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
              <p>
                This scaffold is intended for professional-use inquiry flows, not open retail
                checkout or consumer purchase behavior.
              </p>
              <p>
                Access to pricing, availability, documentation, and ordering support is subject to
                verification, eligibility, and the policies of the site operator.
              </p>
              <p>
                Final production terms should be reviewed and replaced with approved legal copy
                before launch.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
