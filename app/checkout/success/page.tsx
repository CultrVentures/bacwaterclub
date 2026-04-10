import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button } from "@/components/ui/button";
import { formatPriceCents } from "@/lib/product";
import { getStripeClient } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Thanks for your order — your bacteriostatic water is on its way.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ session_id?: string }>;

type OrderSummary = {
  email: string | null;
  amountTotalCents: number;
  currency: string;
  shippingName: string | null;
  city: string | null;
  region: string | null;
};

async function loadOrderSummary(sessionId: string): Promise<OrderSummary | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer_details"],
    });

    const details = session.customer_details;
    return {
      email: session.customer_details?.email ?? null,
      amountTotalCents: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
      shippingName: details?.name ?? null,
      city: details?.address?.city ?? null,
      region: details?.address?.state ?? null,
    };
  } catch (error) {
    console.error("[checkout/success] failed to retrieve session", error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id: sessionId } = await searchParams;
  const summary = sessionId ? await loadOrderSummary(sessionId) : null;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="section-spacing">
        <div className="container-shell max-w-2xl">
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-white/80 p-10 shadow-[var(--shadow-card)]">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Order confirmed
            </p>
            <h1 className="serif-heading mt-3 text-4xl text-foreground">
              Thanks — your order is on its way.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              We&rsquo;ve received your payment and a confirmation email is heading to your inbox. Most
              orders ship within one business day in padded, foam-lined packaging.
            </p>

            {summary ? (
              <dl className="mt-8 grid gap-4 rounded-2xl border border-border/60 bg-background/60 p-6 text-sm">
                {summary.shippingName ? (
                  <div className="flex items-center justify-between gap-6">
                    <dt className="text-muted-foreground">Ship to</dt>
                    <dd className="font-medium text-foreground">
                      {summary.shippingName}
                      {summary.city ? `, ${summary.city}` : ""}
                      {summary.region ? `, ${summary.region}` : ""}
                    </dd>
                  </div>
                ) : null}
                {summary.email ? (
                  <div className="flex items-center justify-between gap-6">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium text-foreground">{summary.email}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-semibold text-foreground">
                    {formatPriceCents(summary.amountTotalCents)} {summary.currency}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-8 rounded-2xl border border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
                If you came here directly and didn&rsquo;t complete a checkout, no charges were made.
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
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
