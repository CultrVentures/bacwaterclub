import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionsCreateMock = vi.fn();
const sessionsRetrieveMock = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripeClient: () => ({
    checkout: {
      sessions: {
        create: sessionsCreateMock,
        retrieve: sessionsRetrieveMock,
      },
    },
  }),
  __resetStripeClientForTests: () => {},
}));

// Import after the mock is set up.
import { POST } from "@/app/api/checkout/route";
import { SHIPPING_PROTECTION_CENTS, getVariant } from "@/lib/product";

type LineItem = {
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: { name: string };
  };
  quantity: number;
};

type CreateArgs = {
  mode: string;
  line_items: LineItem[];
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeRawRequest(body: string): Request {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

beforeEach(() => {
  sessionsCreateMock.mockReset();
  sessionsRetrieveMock.mockReset();
  sessionsCreateMock.mockResolvedValue({
    id: "cs_test_mock",
    url: "https://checkout.stripe.com/c/pay/cs_test_mock",
  });
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.NEXT_PUBLIC_SITE_URL = "https://bacwaterclub.com";
});

describe("POST /api/checkout", () => {
  it("rejects requests that aren't valid JSON", async () => {
    const response = await POST(makeRawRequest("not-json"));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/json/i);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });

  it("rejects unknown variant ids with 400", async () => {
    const response = await POST(makeRequest({ variantId: "999pack", quantity: 1 }));
    expect(response.status).toBe(400);
    expect(sessionsCreateMock).not.toHaveBeenCalled();
  });

  it("rejects quantities below 1", async () => {
    const response = await POST(makeRequest({ variantId: "2pack", quantity: 0 }));
    expect(response.status).toBe(400);
  });

  it("rejects quantities above 20", async () => {
    const response = await POST(makeRequest({ variantId: "2pack", quantity: 21 }));
    expect(response.status).toBe(400);
  });

  it("creates a session with the 2-pack line item at $25", async () => {
    const response = await POST(
      makeRequest({ variantId: "2pack", quantity: 1, shippingProtection: false }),
    );
    expect(response.status).toBe(200);
    expect(sessionsCreateMock).toHaveBeenCalledOnce();
    const args = sessionsCreateMock.mock.calls[0][0] as CreateArgs;
    expect(args.mode).toBe("payment");
    expect(args.line_items).toHaveLength(1);
    expect(args.line_items[0].price_data.unit_amount).toBe(2500);
    expect(args.line_items[0].quantity).toBe(1);
    expect(args.success_url).toContain("/checkout/success");
    expect(args.cancel_url).toContain("/checkout/cancel");
    expect(args.metadata?.variant_id).toBe("2pack");
    const body = (await response.json()) as { url: string };
    expect(body.url).toMatch(/checkout\.stripe\.com/);
  });

  it("creates a session with the 4-pack line item at $45", async () => {
    await POST(
      makeRequest({ variantId: "4pack", quantity: 2, shippingProtection: false }),
    );
    const args = sessionsCreateMock.mock.calls[0][0] as CreateArgs;
    expect(args.line_items).toHaveLength(1);
    expect(args.line_items[0].price_data.unit_amount).toBe(getVariant("4pack").priceCents);
    expect(args.line_items[0].quantity).toBe(2);
  });

  it("appends a shipping-protection line item when requested", async () => {
    await POST(
      makeRequest({ variantId: "4pack", quantity: 1, shippingProtection: true }),
    );
    const args = sessionsCreateMock.mock.calls[0][0] as CreateArgs;
    expect(args.line_items).toHaveLength(2);
    const protection = args.line_items[1];
    expect(protection.price_data.unit_amount).toBe(SHIPPING_PROTECTION_CENTS);
    expect(protection.price_data.product_data.name).toMatch(/shipping protection/i);
    expect(protection.quantity).toBe(1);
    expect(args.metadata?.shipping_protection).toBe("yes");
  });

  it("returns 500 when Stripe fails", async () => {
    sessionsCreateMock.mockRejectedValueOnce(new Error("stripe exploded"));
    const response = await POST(makeRequest({ variantId: "2pack", quantity: 1 }));
    expect(response.status).toBe(500);
    const body = (await response.json()) as { error: string; detail?: string };
    expect(body.error).toMatch(/unable to start checkout/i);
    expect(body.detail).toBe("stripe exploded");
  });

  it("returns 502 when Stripe returns no URL", async () => {
    sessionsCreateMock.mockResolvedValueOnce({ id: "cs_no_url", url: null });
    const response = await POST(makeRequest({ variantId: "2pack", quantity: 1 }));
    expect(response.status).toBe(502);
  });
});
