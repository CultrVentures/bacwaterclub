import { NextResponse } from "next/server";

import {
  XeroNotConfiguredError,
  createXeroClient,
  persistTokenSet,
  readXeroEnv,
} from "@/lib/xero/client";

export const runtime = "nodejs";

/**
 * GET /api/xero/callback
 *
 * OAuth2 redirect target. Xero sends the user back here with a `code`
 * query parameter (and any consent errors). We exchange the code for a
 * token set, fetch the connected tenants, and persist the first tenant's
 * tokens to disk so the Stripe webhook can use them.
 *
 * On success, returns a JSON status payload that includes the tenant ID
 * the operator should paste into XERO_TENANT_ID for production safety.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const errorParam = url.searchParams.get("error");
  if (errorParam) {
    return NextResponse.json(
      {
        error: "Xero authorization was denied or failed.",
        detail: errorParam,
        description: url.searchParams.get("error_description") ?? undefined,
      },
      { status: 400 },
    );
  }

  if (!url.searchParams.get("code")) {
    return NextResponse.json(
      { error: "Missing authorization code on Xero callback." },
      { status: 400 },
    );
  }

  try {
    const env = readXeroEnv();
    const client = createXeroClient(env);

    // Exchanges ?code=... for an access + refresh token set.
    const tokenSet = await client.apiCallback(request.url);

    // Asks Xero which organisations the access token is good for.
    await client.updateTenants(false);
    const firstTenant = client.tenants?.[0];
    if (!firstTenant?.tenantId) {
      return NextResponse.json(
        {
          error: "Xero authorization succeeded but no tenants were returned.",
          help: "Confirm the Xero user has access to at least one organisation.",
        },
        { status: 502 },
      );
    }

    const stored = await persistTokenSet(
      tokenSet,
      firstTenant.tenantId,
      firstTenant.tenantName,
    );

    return NextResponse.json({
      ok: true,
      message: "Xero connected successfully.",
      tenantId: stored.tenantId,
      tenantName: stored.tenantName,
      expiresAt: new Date(stored.expiresAt * 1000).toISOString(),
      nextSteps: [
        `Paste this tenantId into .env.local as XERO_TENANT_ID=${stored.tenantId} to pin the integration to this organisation.`,
        "Confirm XERO_SALES_ACCOUNT_CODE and XERO_PAYMENT_ACCOUNT_CODE point to real account codes in your Xero chart of accounts.",
        "Wire up the Stripe webhook (see docs/xero-setup.md) so checkout.session.completed events trigger Xero invoice creation.",
      ],
    });
  } catch (error) {
    if (error instanceof XeroNotConfiguredError) {
      return NextResponse.json(
        {
          error: "Xero is not configured.",
          detail: error.message,
        },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("[xero/callback] failed to exchange authorization code", error);
    return NextResponse.json(
      { error: "Failed to complete Xero authorization.", detail: message },
      { status: 500 },
    );
  }
}
