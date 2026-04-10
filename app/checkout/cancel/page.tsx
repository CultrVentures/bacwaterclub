import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Your checkout session was cancelled. No charges were made.",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="section-spacing">
        <div className="container-shell max-w-2xl">
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-white/90 p-10 shadow-[var(--shadow-card)] sm:p-12">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              Checkout cancelled
            </p>
            <h1 className="serif-heading mt-4 text-4xl text-foreground sm:text-[2.75rem]">
              No problem — nothing was charged.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              You exited the checkout before finishing, so no payment was taken. Your cart is still
              waiting whenever you&apos;re ready.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/#buy">Return to the product</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Back to the store</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
