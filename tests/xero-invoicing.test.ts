import { describe, expect, it } from "vitest";
import type Stripe from "stripe";

import { buildContactPayload, buildLineItems } from "@/lib/xero/invoicing";

/**
 * Pure-mapping tests. These exercise the Stripe → Xero translation logic
 * without touching any real API. The Xero client and the Stripe webhook
 * dispatcher have integration concerns that aren't covered here.
 */

function makeSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_session_1",
    object: "checkout.session",
    created: 1_700_000_000,
    currency: "usd",
    payment_status: "paid",
    amount_total: 12500,
    customer_details: {
      email: "buyer@example.com",
      name: "Jane Buyer",
      phone: "+15551234567",
      address: {
        line1: "123 Lab St",
        line2: "Suite 4",
        city: "Brooklyn",
        state: "NY",
        postal_code: "11201",
        country: "US",
      },
      tax_exempt: "none",
      tax_ids: [],
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

describe("buildContactPayload", () => {
  it("maps email, name, phone, and address from a complete session", () => {
    const contact = buildContactPayload(makeSession());

    expect(contact.name).toBe("Jane Buyer");
    expect(contact.firstName).toBe("Jane");
    expect(contact.lastName).toBe("Buyer");
    expect(contact.emailAddress).toBe("buyer@example.com");
    expect(contact.phones?.[0]?.phoneNumber).toBe("+15551234567");
    expect(contact.addresses?.[0]?.addressLine1).toBe("123 Lab St");
    expect(contact.addresses?.[0]?.city).toBe("Brooklyn");
    expect(contact.addresses?.[0]?.region).toBe("NY");
    expect(contact.addresses?.[0]?.postalCode).toBe("11201");
    expect(contact.addresses?.[0]?.country).toBe("US");
  });

  it("falls back to the email local-part when no name is provided", () => {
    const contact = buildContactPayload(
      makeSession({
        customer_details: {
          email: "lab.tech@example.com",
          name: null,
          phone: null,
          address: null,
          tax_exempt: "none",
          tax_ids: [],
        } as unknown as Stripe.Checkout.Session["customer_details"],
      }),
    );

    expect(contact.name).toBe("lab.tech");
    expect(contact.firstName).toBe("lab.tech");
    expect(contact.lastName).toBeUndefined();
    expect(contact.emailAddress).toBe("lab.tech@example.com");
    expect(contact.phones).toBeUndefined();
    expect(contact.addresses).toBeUndefined();
  });

  it("uses a generic placeholder name when both name and email are missing", () => {
    const contact = buildContactPayload(
      makeSession({
        customer_details: {
          email: null,
          name: null,
          phone: null,
          address: null,
          tax_exempt: "none",
          tax_ids: [],
        } as unknown as Stripe.Checkout.Session["customer_details"],
      }),
    );

    expect(contact.name).toBe("Bacwaterclub customer");
    expect(contact.emailAddress).toBeUndefined();
  });

  it("preserves multi-word last names", () => {
    const contact = buildContactPayload(
      makeSession({
        customer_details: {
          email: "j@example.com",
          name: "Jane Van Der Heim",
          phone: null,
          address: null,
          tax_exempt: "none",
          tax_ids: [],
        } as unknown as Stripe.Checkout.Session["customer_details"],
      }),
    );

    expect(contact.firstName).toBe("Jane");
    expect(contact.lastName).toBe("Van Der Heim");
  });
});

describe("buildLineItems", () => {
  it("maps Stripe line items to Xero line items, computing per-unit price from amount_total", () => {
    const session = makeSession({
      line_items: {
        object: "list",
        url: "/v1/checkout/sessions/cs_test/line_items",
        has_more: false,
        data: [
          {
            id: "li_1",
            object: "item",
            description: "Hospira Bac Water — 4-pack",
            quantity: 2,
            amount_subtotal: 9000,
            amount_total: 9000,
            amount_tax: 0,
            amount_discount: 0,
            currency: "usd",
            price: {
              id: "price_1",
              object: "price",
              unit_amount: 4500,
              currency: "usd",
              product: { id: "prod_1", object: "product", name: "Hospira Bac Water" },
            },
          },
          {
            id: "li_2",
            object: "item",
            description: "Shipping protection",
            quantity: 1,
            amount_subtotal: 500,
            amount_total: 500,
            amount_tax: 0,
            amount_discount: 0,
            currency: "usd",
            price: { id: "price_ship", object: "price", unit_amount: 500, currency: "usd" },
          },
        ],
      },
    } as Partial<Stripe.Checkout.Session>);

    const lineItems = buildLineItems(session, "200");

    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].description).toBe("Hospira Bac Water — 4-pack");
    expect(lineItems[0].quantity).toBe(2);
    expect(lineItems[0].unitAmount).toBe(45);
    expect(lineItems[0].accountCode).toBe("200");
    expect(lineItems[0].taxType).toBe("NONE");
    expect(lineItems[1].description).toBe("Shipping protection");
    expect(lineItems[1].unitAmount).toBe(5);
  });

  it("reflects promo discounts via amount_total", () => {
    const session = makeSession({
      line_items: {
        object: "list",
        url: "/v1/checkout/sessions/cs_test/line_items",
        has_more: false,
        data: [
          {
            id: "li_1",
            object: "item",
            description: "Discounted pack",
            quantity: 2,
            amount_subtotal: 10000,
            amount_total: 8000, // 20% off applied
            amount_tax: 0,
            amount_discount: 2000,
            currency: "usd",
            price: { id: "price_1", object: "price", unit_amount: 5000, currency: "usd" },
          },
        ],
      },
    } as Partial<Stripe.Checkout.Session>);

    const lineItems = buildLineItems(session, "200");
    expect(lineItems[0].quantity).toBe(2);
    // 8000 cents / 2 units = 40 dollars per unit (the post-discount unit price).
    expect(lineItems[0].unitAmount).toBe(40);
  });

  it("rounds fractional unit amounts to 4 decimal places", () => {
    const session = makeSession({
      line_items: {
        object: "list",
        url: "/v1/checkout/sessions/cs_test/line_items",
        has_more: false,
        data: [
          {
            id: "li_1",
            object: "item",
            description: "Odd discount",
            quantity: 3,
            amount_subtotal: 1000,
            amount_total: 1000,
            amount_tax: 0,
            amount_discount: 0,
            currency: "usd",
            price: null,
          },
        ],
      },
    } as Partial<Stripe.Checkout.Session>);

    const lineItems = buildLineItems(session, "200");
    // 1000 / 3 / 100 = 3.333333... → rounds to 3.3333
    expect(lineItems[0].unitAmount).toBe(3.3333);
  });

  it("synthesises a single catch-all line when line_items is missing", () => {
    const session = makeSession({ amount_total: 12500 });
    const lineItems = buildLineItems(session, "200");
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0].description).toBe("Bacwaterclub order");
    expect(lineItems[0].unitAmount).toBe(125);
    expect(lineItems[0].quantity).toBe(1);
    expect(lineItems[0].accountCode).toBe("200");
  });

  it("falls back to the product name when line item description is missing", () => {
    const session = makeSession({
      line_items: {
        object: "list",
        url: "/v1/checkout/sessions/cs_test/line_items",
        has_more: false,
        data: [
          {
            id: "li_1",
            object: "item",
            description: null,
            quantity: 1,
            amount_subtotal: 4500,
            amount_total: 4500,
            amount_tax: 0,
            amount_discount: 0,
            currency: "usd",
            price: {
              id: "price_1",
              object: "price",
              unit_amount: 4500,
              currency: "usd",
              product: {
                id: "prod_1",
                object: "product",
                name: "Hospira Bac Water — 4-pack",
              },
            },
          },
        ],
      },
    } as Partial<Stripe.Checkout.Session>);

    const lineItems = buildLineItems(session, "200");
    expect(lineItems[0].description).toBe("Hospira Bac Water — 4-pack");
  });
});
