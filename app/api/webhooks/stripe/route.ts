import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe";
import {
  XeroNotConfiguredError,
  XeroNotConnectedError,
} from "@/lib/xero/client";
import { recordCheckoutInXero } from "@/lib/xero/invoicing";

export const runtime = "nodejs";

/**
 * Disable Next.js body parsing — we need the raw request bytes to verify
 * the Stripe webhook signature. Reading via `request.text()` and passing
 * the result straight to `stripe.webhooks.constructEvent` is the supported
 * App-Router pattern.
 */
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe events and pushes successful checkouts into Xero.
 *
 * Flow:
 *   1. Read the raw body (required for signature verification).
 *   2. Verify the Stripe-Signature header against STRIPE_WEBHOOK_SECRET.
 *   3. On checkout.session.completed, retrieve the session with line_items
 *      and customer_details expanded, then call recordCheckoutInXero.
 *   4. Return 200 quickly. Logged failures are returned as 500 so Stripe
 *      retries automatically — recordCheckoutInXero is idempotent on
 *      session.id, so retries are safe.
 *
 * The handler is a no-op (200) for any event type other than
 * checkout.session.completed, and gracefully degrades to 200 if Xero is
 * not configured yet — that lets you wire up Stripe webhooks before
 * Xero credentials, without breaking the Stripe webhook health check.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set — refusing to process events.",
    );
    return NextResponse.json(
      {
        error: "Webhook is not configured.",
        detail: "Set STRIPE_WEBHOOK_SECRET in .env.local. See docs/xero-setup.md.",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature header." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("[stripe-webhook] signature verification failed", message);
    return NextResponse.json(
      { error: "Invalid signature.", detail: message },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge other event types so Stripe doesn't retry them.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    const stripe = getStripeClient();
    const sessionStub = event.data.object as Stripe.Checkout.Session;

    // Re-fetch with line_items + customer_details + payment_intent expanded.
    // The webhook payload doesn't include line_items by default, and the
    // invoicing mapper needs them.
    const session = await stripe.checkout.sessions.retrieve(sessionStub.id, {
      expand: ["line_items", "line_items.data.price.product", "payment_intent"],
    });

    const result = await recordCheckoutInXero(session);

    console.log(
      `[stripe-webhook] checkout ${session.id} → Xero ${result.status}` +
        (result.invoiceNumber ? ` (invoice ${result.invoiceNumber})` : ""),
    );

    return NextResponse.json({
      received: true,
      sessionId: session.id,
      xero: result,
    });
  } catch (error) {
    if (error instanceof XeroNotConfiguredError) {
      console.warn(
        "[stripe-webhook] Xero is not configured — skipping push.",
        error.message,
      );
      // 200 so Stripe doesn't retry; the Stripe Checkout itself succeeded.
      return NextResponse.json({
        received: true,
        xero: { status: "skipped_not_configured" },
      });
    }
    if (error instanceof XeroNotConnectedError) {
      console.warn(
        "[stripe-webhook] Xero is not connected — visit /api/xero/connect.",
        error.message,
      );
      return NextResponse.json({
        received: true,
        xero: { status: "skipped_not_connected" },
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("[stripe-webhook] Xero push failed", error);
    // 500 so Stripe retries. recordCheckoutInXero is idempotent.
    return NextResponse.json(
      { error: "Failed to push checkout to Xero.", detail: message },
      { status: 500 },
    );
  }
}
