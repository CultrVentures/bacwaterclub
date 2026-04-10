"use client";

import { Check, Loader2, ShieldCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PRODUCT,
  SHIPPING_PROTECTION_CENTS,
  formatPriceCents,
  type Variant,
  type VariantId,
} from "@/lib/product";
import { cn } from "@/lib/utils";

type BuyBoxProps = {
  initialVariantId?: VariantId;
};

export function BuyBox({ initialVariantId = "4pack" }: BuyBoxProps) {
  const [variantId, setVariantId] = useState<VariantId>(initialVariantId);
  const [quantity, setQuantity] = useState(1);
  const [shippingProtection, setShippingProtection] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedVariant = useMemo<Variant>(
    () => PRODUCT.variants.find((v) => v.id === variantId) ?? PRODUCT.variants[0],
    [variantId],
  );

  const subtotalCents =
    selectedVariant.priceCents * quantity + (shippingProtection ? SHIPPING_PROTECTION_CENTS : 0);

  const savingsCents =
    selectedVariant.compareAtCents != null
      ? (selectedVariant.compareAtCents - selectedVariant.priceCents) * quantity
      : 0;

  async function handleCheckout() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          variantId,
          quantity,
          shippingProtection,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to start checkout.");
      }

      const { url } = (await response.json()) as { url?: string };
      if (!url) {
        throw new Error("Checkout session returned no URL.");
      }
      window.location.href = url;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div
      id="buy"
      className="flex flex-col gap-6 rounded-[var(--radius-lg)] border border-border/60 bg-white/85 p-7 shadow-[var(--shadow-card)] backdrop-blur"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Bacwaterclub · Research-grade
        </p>
        <h1 className="serif-heading mt-3 text-3xl leading-tight text-foreground sm:text-4xl">
          {PRODUCT.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{PRODUCT.tagline}</p>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1 text-[#b8860b]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span>
            <span className="font-semibold text-foreground">
              {PRODUCT.reviewsSummary.rating.toFixed(1)}
            </span>
            /5 · {PRODUCT.reviewsSummary.count.toLocaleString()} reviews
          </span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">Choose a pack</legend>
        <div className="grid gap-3" role="radiogroup" aria-label="Pack size">
          {PRODUCT.variants.map((variant) => {
            const isActive = variant.id === variantId;
            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setVariantId(variant.id)}
                className={cn(
                  "focus-outline flex items-start justify-between gap-4 rounded-2xl border bg-white/70 p-4 text-left transition-all",
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/60 hover:border-primary/50",
                )}
              >
                <div>
                  <p className="font-semibold text-foreground">{variant.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {variant.vialCount} × 30 mL vials · {variant.totalMl} mL total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {formatPriceCents(variant.priceCents)}
                  </p>
                  {variant.compareAtCents ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPriceCents(variant.compareAtCents)}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-foreground">
          Quantity
        </label>
        <div className="inline-flex items-center gap-0 rounded-full border border-border/60 bg-white/70">
          <button
            type="button"
            className="focus-outline h-10 w-10 rounded-full text-lg text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            id="quantity"
            aria-live="polite"
            className="w-8 text-center text-sm font-semibold text-foreground"
          >
            {quantity}
          </span>
          <button
            type="button"
            className="focus-outline h-10 w-10 rounded-full text-lg text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            disabled={quantity >= 20}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-primary"
          checked={shippingProtection}
          onChange={(event) => setShippingProtection(event.target.checked)}
        />
        <span className="flex-1">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Shipping protection
            <span className="text-muted-foreground">
              ({formatPriceCents(SHIPPING_PROTECTION_CENTS)})
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Damaged glass on arrival? We reship it, free. Strongly recommended for glassware.
          </span>
        </span>
      </label>

      <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">{formatPriceCents(subtotalCents)}</span>
        </div>
        {savingsCents > 0 ? (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">You save</span>
            <span className="font-medium text-[#2f6d58]">
              {formatPriceCents(savingsCents)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting checkout…
            </>
          ) : (
            <>Buy now — {formatPriceCents(subtotalCents)}</>
          )}
        </Button>
        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
        <ul className="grid gap-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary" /> Ships in 24 hours from the USA
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary" /> Secure checkout powered by Stripe
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary" /> For research and laboratory use only
          </li>
        </ul>
      </div>
    </div>
  );
}
