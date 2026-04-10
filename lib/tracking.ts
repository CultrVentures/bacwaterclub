import {
  attributionFieldNames,
  defaultLandingPageVariant,
  type LeadFormInput,
} from "@/lib/validation";

declare global {
  interface Window {
    rdt?: (...args: unknown[]) => void;
  }
}

export type AttributionFieldName = (typeof attributionFieldNames)[number];

export type AttributionPayload = Pick<LeadFormInput, AttributionFieldName>;

const storageKey = "cultr:hcp-attribution";
const redditPixelEventMap: Record<string, string> = {
  landing_page_view: "PageVisit",
  form_submit_success: "Lead",
};

const emptyAttribution: AttributionPayload = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  reddit_click_id: "",
  landing_page_variant: defaultLandingPageVariant,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getEmptyAttribution(): AttributionPayload {
  return { ...emptyAttribution };
}

export function extractAttributionFromSearchParams(
  searchParams: URLSearchParams,
): Partial<AttributionPayload> {
  return {
    utm_source: searchParams.get("utm_source") ?? undefined,
    utm_medium: searchParams.get("utm_medium") ?? undefined,
    utm_campaign: searchParams.get("utm_campaign") ?? undefined,
    utm_content: searchParams.get("utm_content") ?? undefined,
    utm_term: searchParams.get("utm_term") ?? undefined,
    reddit_click_id: searchParams.get("reddit_click_id") ?? undefined,
    landing_page_variant:
      searchParams.get("landing_page_variant") ?? defaultLandingPageVariant,
  };
}

export function readStoredAttribution(): AttributionPayload {
  if (!isBrowser()) {
    return getEmptyAttribution();
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return getEmptyAttribution();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AttributionPayload>;

    return {
      ...getEmptyAttribution(),
      ...parsed,
    };
  } catch {
    return getEmptyAttribution();
  }
}

export function persistAttribution(payload: Partial<AttributionPayload>) {
  if (!isBrowser()) {
    return getEmptyAttribution();
  }

  const current = readStoredAttribution();
  const nextValue = {
    ...current,
    ...Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== ""),
    ),
  } satisfies AttributionPayload;

  window.localStorage.setItem(storageKey, JSON.stringify(nextValue));

  return nextValue;
}

export function captureAttributionFromLocation(search: string) {
  const extracted = extractAttributionFromSearchParams(new URLSearchParams(search));
  return persistAttribution(extracted);
}

function getDeviceType() {
  if (!isBrowser()) {
    return "server";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1024) {
    return "tablet";
  }

  return "desktop";
}

export function trackClientEvent(
  eventName: string,
  payload: Record<string, unknown> = {},
) {
  const enrichedPayload = {
    ...readStoredAttribution(),
    deviceType: getDeviceType(),
    eventName,
    ...payload,
  };
  const redditPixelEvent = redditPixelEventMap[eventName];

  if (typeof window !== "undefined" && typeof window.rdt === "function") {
    // Keep Reddit Pixel usage limited to events that map cleanly to a standard
    // pixel verb. All richer event names are still captured through the CAPI stub.
    if (redditPixelEvent) {
      window.rdt("track", redditPixelEvent, enrichedPayload);
    }
  }

  if (typeof window !== "undefined") {
    void fetch("/api/reddit-capi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        eventTimestamp: new Date().toISOString(),
        redditClickId: enrichedPayload.reddit_click_id,
        metadata: enrichedPayload,
      }),
    }).catch(() => undefined);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[tracking] ${eventName}`, enrichedPayload);
  }
}
