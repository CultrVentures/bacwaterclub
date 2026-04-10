import {
  Address,
  Contact,
  CurrencyCode,
  Invoice,
  LineAmountTypes,
  Phone,
  type LineItem,
  type Payment,
  type XeroClient,
} from "xero-node";
import type Stripe from "stripe";

import { getAuthenticatedXeroClient, readXeroEnv } from "./client";

/**
 * Public API: given a Stripe Checkout Session that has just completed,
 * push a Contact + Invoice + Payment trio into Xero.
 *
 * Resilience strategy (handles every Stripe webhook retry path):
 *
 *   1. **Reference lookup**: We search Xero for an existing invoice
 *      whose `Reference` equals `session.id`. If found, we reuse it.
 *      This protects against manual replays from the Stripe Dashboard
 *      after Xero's 24h native idempotency window has expired.
 *
 *   2. **Xero idempotency keys**: Every write call passes an idempotency
 *      key derived from `session.id`, so a retry within Xero's 24h
 *      cache window returns the cached response instead of creating a
 *      duplicate. This protects against double-charge between API
 *      calls (e.g. invoice succeeded, payment failed).
 *
 *   3. **amountDue gate**: Before creating a payment we check the
 *      invoice's remaining `amountDue`. If it's already zero, the
 *      payment was recorded by a prior attempt and we skip. This
 *      protects the partial-failure window after the 24h Xero cache
 *      has expired.
 *
 * Pure mapping logic is split into `buildLineItems` and
 * `buildContactPayload` so they can be unit-tested without hitting any
 * real API.
 */
export async function recordCheckoutInXero(
  session: Stripe.Checkout.Session,
): Promise<{
  status: "created" | "completed_partial" | "skipped_duplicate" | "skipped_unpaid";
  invoiceId?: string;
  invoiceNumber?: string;
}> {
  if (session.payment_status !== "paid") {
    return { status: "skipped_unpaid" };
  }

  const env = readXeroEnv();
  const { client, tenantId } = await getAuthenticatedXeroClient();

  // Step 1 — look up an existing invoice by Reference.
  const existing = await client.accountingApi.getInvoices(
    tenantId,
    undefined,
    `Reference=="${session.id}"`,
  );
  let invoice: Invoice | undefined = existing.body.invoices?.[0];
  let createdNewInvoice = false;

  if (!invoice?.invoiceID) {
    // Step 2a — create the invoice (with Xero idempotency key).
    const contactPayload = buildContactPayload(session);
    const contactId = await upsertContact(client, tenantId, contactPayload);

    const lineItems = buildLineItems(session, env.salesAccountCode);
    const invoicePayload: Invoice = {
      type: Invoice.TypeEnum.ACCREC,
      contact: { contactID: contactId },
      date: toIsoDate(session.created),
      dueDate: toIsoDate(session.created),
      lineAmountTypes: LineAmountTypes.Inclusive,
      reference: session.id,
      currencyCode: resolveCurrency(session.currency),
      status: Invoice.StatusEnum.AUTHORISED,
      lineItems,
    };

    const created = await client.accountingApi.createInvoices(
      tenantId,
      { invoices: [invoicePayload] },
      undefined,
      undefined,
      buildIdempotencyKey(session.id, "invoice"),
    );
    invoice = created.body.invoices?.[0];
    if (!invoice?.invoiceID) {
      throw new Error("Xero createInvoices returned no invoiceID.");
    }
    createdNewInvoice = true;
  }

  // Step 2b — record the payment.
  //
  // Two cases:
  //   - We just created the invoice in this call → always record the
  //     payment, no need to consult amountDue (it'll be the full total).
  //   - We found an existing invoice → only record a payment if Xero
  //     reports a remaining balance. Default to "no payment needed"
  //     when amountDue is missing — that's the safer default; creating
  //     a duplicate is worse than skipping a missing one (the operator
  //     can always replay the Stripe event manually).
  const totalCents = session.amount_total ?? 0;
  let createdPayment = false;
  const shouldCreatePayment =
    totalCents > 0 &&
    (createdNewInvoice ? true : (invoice.amountDue ?? 0) > 0);
  if (shouldCreatePayment) {
    const payment: Payment = {
      invoice: { invoiceID: invoice.invoiceID },
      account: { code: env.paymentAccountCode },
      date: toIsoDate(session.created),
      amount: totalCents / 100,
      reference: extractPaymentReference(session),
    };
    await client.accountingApi.createPayments(
      tenantId,
      { payments: [payment] },
      undefined,
      buildIdempotencyKey(session.id, "payment"),
    );
    createdPayment = true;
  }

  let status: "created" | "completed_partial" | "skipped_duplicate";
  if (createdNewInvoice) {
    status = "created";
  } else if (createdPayment) {
    status = "completed_partial";
  } else {
    status = "skipped_duplicate";
  }

  return {
    status,
    invoiceId: invoice.invoiceID,
    invoiceNumber: invoice.invoiceNumber,
  };
}

/**
 * Builds a Xero idempotency key for a given session and action.
 *
 * Xero caps idempotency keys at 128 characters. Stripe session IDs are
 * ~70 chars, so a `:invoice` / `:payment` suffix fits comfortably.
 */
function buildIdempotencyKey(sessionId: string, action: "invoice" | "payment"): string {
  return `${sessionId}:${action}`.slice(0, 128);
}

/**
 * Resolves a stable payment reference from a Stripe session for the
 * Xero Payment.Reference field. Prefers the underlying PaymentIntent ID
 * (which Stripe also surfaces in payouts) and falls back to the session
 * ID so the field is never empty.
 */
function extractPaymentReference(session: Stripe.Checkout.Session): string {
  const pi = session.payment_intent;
  if (typeof pi === "string") {
    return pi;
  }
  if (pi?.id) {
    return pi.id;
  }
  return session.id;
}

/**
 * Resolves a Xero contact by email; creates a new one if no match.
 * Returns the contactID.
 */
async function upsertContact(
  client: XeroClient,
  tenantId: string,
  payload: Contact,
): Promise<string> {
  const email = payload.emailAddress;
  if (email) {
    const found = await client.accountingApi.getContacts(
      tenantId,
      undefined,
      `EmailAddress=="${email.replace(/"/g, '\\"')}"`,
    );
    const existing = found.body.contacts?.[0];
    if (existing?.contactID) {
      return existing.contactID;
    }
  }

  const created = await client.accountingApi.createContacts(tenantId, {
    contacts: [payload],
  });
  const contactId = created.body.contacts?.[0]?.contactID;
  if (!contactId) {
    throw new Error("Xero createContacts returned no contactID.");
  }
  return contactId;
}

/**
 * Pure function: maps a Stripe Checkout Session to a Xero Contact payload.
 * Falls back gracefully when optional fields are missing.
 *
 * Exported so unit tests can verify the mapping without an API.
 */
export function buildContactPayload(session: Stripe.Checkout.Session): Contact {
  const details = session.customer_details;
  const email = details?.email ?? undefined;
  const fullName =
    details?.name?.trim() ||
    (email ? email.split("@")[0] : undefined) ||
    "Bacwaterclub customer";

  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(" ") : undefined;

  const contact: Contact = {
    name: fullName,
    firstName,
    ...(lastName ? { lastName } : {}),
    ...(email ? { emailAddress: email } : {}),
  };

  if (details?.phone) {
    contact.phones = [
      {
        phoneType: Phone.PhoneTypeEnum.DEFAULT,
        phoneNumber: details.phone,
      },
    ];
  }

  const address = details?.address;
  if (address) {
    contact.addresses = [
      {
        addressType: Address.AddressTypeEnum.STREET,
        addressLine1: address.line1 ?? undefined,
        addressLine2: address.line2 ?? undefined,
        city: address.city ?? undefined,
        region: address.state ?? undefined,
        postalCode: address.postal_code ?? undefined,
        country: address.country ?? undefined,
      },
    ];
  }

  return contact;
}

/**
 * Pure function: maps Stripe Checkout line items to Xero LineItems.
 *
 * Uses `amount_total` (post-discount) divided by quantity to compute the
 * unit amount, so promo codes are reflected accurately. Falls back to
 * a synthesised single line if the session was retrieved without
 * line_items expanded.
 *
 * Exported so unit tests can verify the mapping without an API.
 */
export function buildLineItems(
  session: Stripe.Checkout.Session,
  salesAccountCode: string,
): LineItem[] {
  const items = session.line_items?.data ?? [];
  if (items.length === 0) {
    const total = (session.amount_total ?? 0) / 100;
    return [
      {
        description: "Bacwaterclub order",
        quantity: 1,
        unitAmount: total,
        accountCode: salesAccountCode,
        taxType: "NONE",
      },
    ];
  }

  return items.map((item) => {
    const quantity = item.quantity ?? 1;
    const totalDollars = (item.amount_total ?? 0) / 100;
    const unitAmount = quantity > 0 ? totalDollars / quantity : totalDollars;

    return {
      description: resolveLineDescription(item),
      quantity,
      unitAmount: roundTo4(unitAmount),
      accountCode: salesAccountCode,
      taxType: "NONE",
    };
  });
}

function resolveLineDescription(item: Stripe.LineItem): string {
  if (item.description) {
    return item.description;
  }
  const product = item.price?.product;
  if (product && typeof product !== "string" && "name" in product) {
    return (product as Stripe.Product).name;
  }
  return "Bacwaterclub item";
}

/**
 * Maps a 3-letter currency code from Stripe to the Xero CurrencyCode enum.
 * Defaults to USD if the input is missing or unrecognised — this storefront
 * is USD-only, but the fallback keeps the integration robust.
 */
function resolveCurrency(stripeCurrency: string | null | undefined): CurrencyCode {
  if (!stripeCurrency) {
    return CurrencyCode.USD;
  }
  const upper = stripeCurrency.toUpperCase() as keyof typeof CurrencyCode;
  const value = CurrencyCode[upper];
  return value ?? CurrencyCode.USD;
}

function roundTo4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function toIsoDate(unixSeconds: number | null | undefined): string {
  const ts = unixSeconds ? unixSeconds * 1000 : Date.now();
  return new Date(ts).toISOString().slice(0, 10);
}
