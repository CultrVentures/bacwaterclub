import { XeroClient } from "xero-node";

import { loadTokens, saveTokens, type StoredXeroTokens } from "./tokens";

/**
 * Scopes the storefront needs to push Contact + Invoice + Payment records.
 *  - openid / profile / email: standard OIDC
 *  - offline_access:           allows refresh tokens (no expiry without this)
 *  - accounting.contacts:      create/lookup customers
 *  - accounting.transactions:  create invoices and payments
 *  - accounting.settings:      read account codes (for validating sales/payment codes)
 */
export const XERO_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "accounting.contacts",
  "accounting.transactions",
  "accounting.settings",
];

/**
 * Skew (seconds) before token expiry that triggers a refresh.
 * Refreshing slightly early protects against clock drift and request latency.
 */
const REFRESH_SKEW_SECONDS = 60;

export class XeroNotConfiguredError extends Error {
  constructor(message = "Xero credentials are not configured.") {
    super(message);
    this.name = "XeroNotConfiguredError";
  }
}

export class XeroNotConnectedError extends Error {
  constructor(
    message = "Xero is not connected. Visit /api/xero/connect to authorize.",
  ) {
    super(message);
    this.name = "XeroNotConnectedError";
  }
}

export type XeroEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  salesAccountCode: string;
  paymentAccountCode: string;
  /** Optional: pin to a specific Xero organisation. */
  tenantId?: string;
};

/**
 * Reads and validates Xero env vars. Throws XeroNotConfiguredError if any
 * required value is missing — callers (e.g. the Stripe webhook) catch this
 * to no-op gracefully when the integration isn't set up yet.
 */
export function readXeroEnv(): XeroEnv {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  const salesAccountCode = process.env.XERO_SALES_ACCOUNT_CODE;
  const paymentAccountCode = process.env.XERO_PAYMENT_ACCOUNT_CODE;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new XeroNotConfiguredError(
      "XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI must all be set.",
    );
  }
  if (!salesAccountCode || !paymentAccountCode) {
    throw new XeroNotConfiguredError(
      "XERO_SALES_ACCOUNT_CODE and XERO_PAYMENT_ACCOUNT_CODE must both be set.",
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    salesAccountCode,
    paymentAccountCode,
    tenantId: process.env.XERO_TENANT_ID || undefined,
  };
}

/**
 * Creates a fresh XeroClient instance bound to the env credentials.
 * Each request gets its own client because XeroClient holds mutable token
 * state and we want to avoid concurrency races across requests.
 */
export function createXeroClient(env: XeroEnv = readXeroEnv()): XeroClient {
  return new XeroClient({
    clientId: env.clientId,
    clientSecret: env.clientSecret,
    redirectUris: [env.redirectUri],
    scopes: XERO_SCOPES,
  });
}

/**
 * Returns a XeroClient that is fully authenticated and ready to call the
 * accounting API. Loads stored tokens, refreshes them if expired, and
 * persists the rotated refresh token back to disk.
 *
 * Throws XeroNotConfiguredError if env vars are missing.
 * Throws XeroNotConnectedError if no tokens are stored yet.
 *
 * Concurrency note: this function does not lock the token file. Two
 * concurrent webhooks that both find the token expired will both call
 * `refreshToken()`, and only the second persisted write will be kept.
 * Xero's refresh-token rotation invalidates the older token, so the
 * losing webhook will fail its API call and Stripe will retry it. The
 * retry will pick up the newly-persisted token. Because every Xero
 * write call passes an idempotency key derived from the Stripe session
 * ID, the retry is safe (no duplicate invoices or payments).
 *
 * For high-throughput deploys, replace `loadTokens` / `saveTokens` with
 * a row-locked Postgres backend (or `proper-lockfile` for single-host).
 */
export async function getAuthenticatedXeroClient(): Promise<{
  client: XeroClient;
  tenantId: string;
}> {
  const env = readXeroEnv();
  const stored = await loadTokens();
  if (!stored) {
    throw new XeroNotConnectedError();
  }

  const client = createXeroClient(env);
  client.setTokenSet({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expires_at: stored.expiresAt,
    token_type: "Bearer",
  });

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (stored.expiresAt - REFRESH_SKEW_SECONDS <= nowSeconds) {
    const refreshed = await client.refreshToken();
    await persistTokenSet(refreshed, stored.tenantId, stored.tenantName);
  }

  // Honour XERO_TENANT_ID pin if present, otherwise use stored.
  const tenantId = env.tenantId ?? stored.tenantId;
  if (!tenantId) {
    throw new XeroNotConnectedError("Stored Xero tokens are missing a tenantId.");
  }

  return { client, tenantId };
}

type RawTokenSet = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
};

/**
 * Normalises a Xero TokenSet into the storage format and persists it.
 * Handles both `expires_at` (absolute) and `expires_in` (relative) fields,
 * since different SDK paths return one or the other.
 */
export async function persistTokenSet(
  tokenSet: RawTokenSet,
  tenantId: string,
  tenantName?: string,
): Promise<StoredXeroTokens> {
  const accessToken = tokenSet.access_token;
  const refreshToken = tokenSet.refresh_token;
  if (!accessToken || !refreshToken) {
    throw new Error("Xero token response is missing access_token or refresh_token.");
  }

  const expiresAt =
    tokenSet.expires_at ??
    Math.floor(Date.now() / 1000) + (tokenSet.expires_in ?? 1800);

  const stored: StoredXeroTokens = {
    accessToken,
    refreshToken,
    expiresAt,
    tenantId,
    tenantName,
    updatedAt: new Date().toISOString(),
  };

  await saveTokens(stored);
  return stored;
}
