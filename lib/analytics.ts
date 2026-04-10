/**
 * Unified pixel/analytics helper for Meta (Facebook), TikTok, and Reddit.
 *
 * IDs are read from NEXT_PUBLIC_* env vars so they can be swapped without code
 * changes. Every public function is a no-op on the server and degrades
 * gracefully if a pixel isn't loaded yet, so it is always safe to call.
 *
 * Standard conversion events mapped across all three platforms:
 *   - view_content   -> fbq ViewContent     / ttq ViewContent   / rdt ViewContent
 *   - add_to_cart    -> fbq AddToCart       / ttq AddToCart     / rdt AddToCart
 *   - initiate_checkout -> fbq InitiateCheckout / ttq InitiateCheckout / rdt Custom
 *   - purchase       -> fbq Purchase        / ttq CompletePayment / rdt Purchase
 *   - lead           -> fbq Lead            / ttq SubmitForm    / rdt Lead
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "";
export const REDDIT_PIXEL_ID = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID ?? "";

export type ConversionPayload = {
  /** Unique identifier for the product or SKU being tracked. */
  contentId?: string;
  contentName?: string;
  contentType?: "product" | "product_group";
  contentCategory?: string;
  /** Revenue value in the target currency's major units (e.g. USD dollars). */
  value?: number;
  currency?: string;
  quantity?: number;
  /** Optional per-event deduplication id — shared across pixels + CAPI. */
  eventId?: string;
};

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead";

type TikTokEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "CompletePayment"
  | "SubmitForm";

type RedditEventName =
  | "PageVisit"
  | "ViewContent"
  | "AddToCart"
  | "Purchase"
  | "Lead"
  | "Custom";

type FbqFn = ((
  command: "init" | "track" | "trackCustom" | "consent",
  ...args: unknown[]
) => void) & { queue?: unknown[]; loaded?: boolean };

type TtqFn = {
  track: (name: TikTokEventName, props?: Record<string, unknown>) => void;
  page: () => void;
  load?: (id: string) => void;
};

type RdtFn = (
  command: "init" | "track",
  ...args: unknown[]
) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    ttq?: TtqFn;
    rdt?: RdtFn;
    dataLayer?: unknown[];
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Randomish event id so we can dedupe with server-side Conversions API later. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function metaPayload(p: ConversionPayload): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.contentId) {
    out.content_ids = [p.contentId];
    out.content_type = p.contentType ?? "product";
  }
  if (p.contentName) out.content_name = p.contentName;
  if (p.contentCategory) out.content_category = p.contentCategory;
  if (p.value != null) out.value = p.value;
  if (p.currency) out.currency = p.currency;
  if (p.quantity != null) out.num_items = p.quantity;
  return out;
}

function tiktokPayload(p: ConversionPayload): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.contentId || p.contentName) {
    out.contents = [
      {
        content_id: p.contentId,
        content_name: p.contentName,
        content_category: p.contentCategory,
        content_type: p.contentType ?? "product",
        quantity: p.quantity ?? 1,
        price: p.value,
      },
    ];
  }
  if (p.value != null) out.value = p.value;
  if (p.currency) out.currency = p.currency;
  return out;
}

function redditPayload(p: ConversionPayload): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.contentId) out.itemCount = p.quantity ?? 1;
  if (p.value != null) {
    out.value = p.value;
    out.currency = p.currency ?? "USD";
  }
  if (p.contentId) {
    out.products = [
      {
        id: p.contentId,
        name: p.contentName,
        category: p.contentCategory,
      },
    ];
  }
  return out;
}

function fbqTrack(name: MetaEventName, p: ConversionPayload): void {
  if (!isBrowser() || !window.fbq) return;
  const params = metaPayload(p);
  if (p.eventId) {
    window.fbq("track", name, params, { eventID: p.eventId });
  } else {
    window.fbq("track", name, params);
  }
}

function ttqTrack(name: TikTokEventName, p: ConversionPayload): void {
  if (!isBrowser() || !window.ttq) return;
  const params = tiktokPayload(p);
  if (p.eventId) (params as Record<string, unknown>).event_id = p.eventId;
  window.ttq.track(name, params);
}

function rdtTrack(name: RedditEventName, p: ConversionPayload): void {
  if (!isBrowser() || !window.rdt) return;
  window.rdt("track", name, redditPayload(p));
}

/** Called on every route change / initial load. */
export function trackPageView(): void {
  if (!isBrowser()) return;
  window.fbq?.("track", "PageView");
  window.ttq?.page();
  window.rdt?.("track", "PageVisit");
  window.dataLayer?.push({ event: "page_view" });
}

export function trackViewContent(p: ConversionPayload): void {
  fbqTrack("ViewContent", p);
  ttqTrack("ViewContent", p);
  rdtTrack("ViewContent", p);
  window.dataLayer?.push({ event: "view_item", ...p });
}

export function trackAddToCart(p: ConversionPayload): void {
  fbqTrack("AddToCart", p);
  ttqTrack("AddToCart", p);
  rdtTrack("AddToCart", p);
  window.dataLayer?.push({ event: "add_to_cart", ...p });
}

export function trackInitiateCheckout(p: ConversionPayload): void {
  fbqTrack("InitiateCheckout", p);
  ttqTrack("InitiateCheckout", p);
  // Reddit has no standard InitiateCheckout — use Custom.
  if (isBrowser() && window.rdt) {
    window.rdt("track", "Custom", { customEventName: "InitiateCheckout", ...redditPayload(p) });
  }
  window.dataLayer?.push({ event: "begin_checkout", ...p });
}

export function trackPurchase(p: ConversionPayload): void {
  fbqTrack("Purchase", p);
  ttqTrack("CompletePayment", p);
  rdtTrack("Purchase", p);
  window.dataLayer?.push({ event: "purchase", ...p });
}

export function trackLead(p: ConversionPayload = {}): void {
  fbqTrack("Lead", p);
  ttqTrack("SubmitForm", p);
  rdtTrack("Lead", p);
  window.dataLayer?.push({ event: "generate_lead", ...p });
}
