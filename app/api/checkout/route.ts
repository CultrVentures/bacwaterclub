import { NextResponse } from "next/server";
import { z } from "zod";

import { PRODUCT, SHIPPING_PROTECTION_CENTS, getVariant } from "@/lib/product";
import { getStripeClient } from "@/lib/stripe";
import { checkoutRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function resolveSiteUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function absoluteImageUrl(siteUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = checkoutRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout request.",
        issues: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  const { variantId, quantity, shippingProtection } = parsed.data;
  const variant = getVariant(variantId);
  const siteUrl = resolveSiteUrl(request);

  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: {
        name: string;
        description?: string;
        images?: string[];
        metadata?: Record<string, string>;
      };
    };
    quantity: number;
  }> = [
    {
      price_data: {
        currency: "usd",
        unit_amount: variant.priceCents,
        product_data: {
          name: `${PRODUCT.name} — ${variant.label}`,
          description: variant.description,
          images: [absoluteImageUrl(siteUrl, variant.mainImage)],
          metadata: {
            sku: variant.sku,
            variant_id: variant.id,
            vial_count: variant.vialCount.toString(),
          },
        },
      },
      quantity,
    },
  ];

  if (shippingProtection) {
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: SHIPPING_PROTECTION_CENTS,
        product_data: {
          name: "Shipping protection",
          description:
            "Covers breakage in transit. If your glass vials arrive damaged, we reship the order at no cost.",
        },
      },
      quantity: 1,
    });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: {
        variant_id: variant.id,
        sku: variant.sku,
        quantity: quantity.toString(),
        shipping_protection: shippingProtection ? "yes" : "no",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session was created without a redirect URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe error.";
    console.error("[checkout] failed to create session", error);
    return NextResponse.json(
      { error: "Unable to start checkout.", detail: message },
      { status: 500 },
    );
  }
}
