import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of sale and use for Bacwaterclub.com.",
};

export default function TermsPage() {
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
                Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
              <p>
                Products sold on Bacwaterclub.com are for research and laboratory use only. They
                are not drug products and are not intended for use in humans or animals. By placing
                an order you acknowledge this and confirm you are using the product accordingly.
              </p>
              <p>
                All sales are final once an order has shipped, except in the case of damage in
                transit, which is covered by our replace-on-arrival guarantee when shipping
                protection is purchased.
              </p>
              <p>
                This is placeholder copy. Before public launch, replace this page with terms
                reviewed by qualified legal counsel.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
