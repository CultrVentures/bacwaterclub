import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy and data handling overview for Bacwaterclub.com customers.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section-spacing">
        <div className="container-shell space-y-8">
          <Button asChild variant="outline">
            <Link href="/">Return to the store</Link>
          </Button>

          <Card className="bg-white/90">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="serif-heading text-4xl text-foreground sm:text-5xl">
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
              <p>
                Bacwaterclub collects the information you provide at checkout — name, shipping
                address, email, and payment details — solely to fulfill your order and communicate
                about it. Payment information is handled directly by Stripe; we never store card
                numbers on our servers.
              </p>
              <p>
                Order and contact details may be shared with shipping carriers, our payment
                processor, and email delivery providers as strictly necessary to complete your
                order. We do not sell customer data.
              </p>
              <p>
                This is placeholder copy. Before public launch, replace this page with privacy
                language reviewed by qualified legal counsel.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
