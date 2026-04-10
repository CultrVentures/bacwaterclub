# Xero + Stripe Integration Setup

This guide walks through wiring the Stripe storefront to Xero so every
completed checkout creates a **Contact + Invoice + Payment** in your
Xero organisation automatically.

## How it works

```
Customer pays at checkout
       │
       ▼
Stripe Checkout completes ─────► /api/webhooks/stripe (signed)
                                          │
                                          ▼
                              recordCheckoutInXero()
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
        upsert Contact          create Invoice             create Payment
        (lookup by email,       (ACCREC, AUTHORISED,       (against the
         create if new)          Reference == session.id)   Stripe clearing
                                                            account in Xero)
```

The webhook handler is **idempotent** on `session.id` — Stripe retries
are safe and will not produce duplicate invoices.

## Prerequisites

- A Xero organisation you can administer.
- A Stripe account with the storefront's checkout already working.
- Local dev: the Stripe CLI for forwarding webhook events
  (`brew install stripe/stripe-cli/stripe`).

## 1. Register a Xero app

1. Go to <https://developer.xero.com/app/manage/> and click **New app**.
2. **App name**: e.g. `Bacwaterclub Storefront`.
3. **Integration type**: **Web app**.
4. **Company or application URL**: your production site URL
   (e.g. `https://bacwaterclub.com`).
5. **OAuth 2.0 redirect URI**: must match `XERO_REDIRECT_URI` exactly.
   - Local dev: `http://localhost:3000/api/xero/callback`
     (or whichever port `pnpm dev` reports — Next.js will pick `3001`/`3002`
     if `3000` is in use; whatever port you actually use must match here).
   - Production: `https://bacwaterclub.com/api/xero/callback`.
6. Save the app, then open it and copy the **Client ID** and
   **Client secret** into `.env.local`:
   ```bash
   XERO_CLIENT_ID=...
   XERO_CLIENT_SECRET=...
   XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback
   ```

## 2. Identify your Xero account codes

In Xero, go to **Accounting → Chart of accounts**.

- **Sales account** — the revenue account you want product sales posted
  to. Commonly `200` ("Sales"). Set:
  ```bash
  XERO_SALES_ACCOUNT_CODE=200
  ```
- **Stripe payment account** — a bank account in Xero that represents
  Stripe's clearing balance. If you don't have one yet:
  1. Click **Add bank account** → **Add it anyway** (skip the bank feed).
  2. Account type **Bank**, account name `Stripe`, code `090` (or any free code).
  3. Save.
  ```bash
  XERO_PAYMENT_ACCOUNT_CODE=090
  ```

## 3. Authorize the integration (one time)

With `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, and `XERO_REDIRECT_URI` set
in `.env.local`, start the dev server:

```bash
pnpm dev
```

Then visit:

```
http://localhost:3000/api/xero/connect
```

You'll be redirected to Xero's consent screen. Approve the requested
scopes, choose the organisation, and Xero will redirect you back to
`/api/xero/callback`. The callback returns JSON like:

```json
{
  "ok": true,
  "tenantId": "abc12345-...",
  "tenantName": "Bacwaterclub Pty Ltd",
  "nextSteps": [...]
}
```

**Copy the `tenantId`** into `.env.local`:

```bash
XERO_TENANT_ID=abc12345-...
```

This pins the integration to one organisation so a future re-auth on a
different Xero login can't accidentally write invoices to the wrong
company. The token set is persisted to `.data/xero-tokens.json`
(gitignored). The webhook handler refreshes the access token
automatically before every Xero call.

## 4. Set up the Stripe webhook

### Local development (with Stripe CLI)

```bash
stripe login                                  # one-time
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret like `whsec_...`. Paste it
into `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart `pnpm dev`. Trigger a test event in another terminal:

```bash
stripe trigger checkout.session.completed
```

Check the dev server logs — you should see:

```
[stripe-webhook] checkout cs_test_... → Xero created (invoice INV-0001)
```

And the new invoice should appear in Xero under **Business → Invoices**.

### Production (Stripe Dashboard)

1. Go to <https://dashboard.stripe.com/webhooks>.
2. Click **Add endpoint**.
3. **Endpoint URL**: `https://bacwaterclub.com/api/webhooks/stripe`.
4. **Events to send**: select **`checkout.session.completed`**.
5. Click **Add endpoint**, then click the new endpoint and reveal the
   **Signing secret**. Set it on your hosting platform as
   `STRIPE_WEBHOOK_SECRET`.

## 5. Test end-to-end

1. Run a real Stripe test purchase from the storefront using a card
   like `4242 4242 4242 4242`.
2. Watch the dev server logs for the
   `[stripe-webhook] ... → Xero created` line.
3. In Xero, the new invoice should be visible immediately under
   **Business → Invoices**, marked as **Paid** with the payment posted
   against your Stripe clearing account.
4. The contact should appear under **Contacts → All contacts**.

## Environment variable reference

| Variable | Required? | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | yes | Stripe API key (existing). |
| `STRIPE_WEBHOOK_SECRET` | yes (for Xero push) | Verifies webhook signatures. |
| `XERO_CLIENT_ID` | yes (for Xero push) | OAuth client ID from developer.xero.com. |
| `XERO_CLIENT_SECRET` | yes (for Xero push) | OAuth client secret. |
| `XERO_REDIRECT_URI` | yes (for Xero push) | Must match the Xero app config exactly. |
| `XERO_TENANT_ID` | recommended | Pins the integration to one organisation. |
| `XERO_SALES_ACCOUNT_CODE` | yes (for Xero push) | Sales revenue account. |
| `XERO_PAYMENT_ACCOUNT_CODE` | yes (for Xero push) | Stripe clearing bank account. |

If any required variable is missing, the webhook handler returns 200
and logs a warning — checkout itself keeps working, the Xero push just
becomes a no-op until you finish the setup.

## Token rotation and lifetime

- Access tokens last **30 minutes**. The client refreshes automatically
  with a 60-second skew.
- Refresh tokens rotate on every use and last **60 days** since last
  use. As long as the integration runs at least once every 60 days,
  the connection stays alive indefinitely.
- If the connection lapses, just re-visit `/api/xero/connect`.

## Re-running after a failure

The Stripe webhook handler returns **500** when the Xero push throws
(except for "not configured" / "not connected" cases, which return 200
to avoid retry storms). Stripe will redeliver the event automatically
with exponential backoff. Because `recordCheckoutInXero` looks up
existing invoices by `Reference == session.id` before creating a new
one, retries will not produce duplicates.

If you need to manually replay an event, find it in the Stripe
Dashboard webhook logs and click **Resend**.
