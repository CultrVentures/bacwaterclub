import { NextResponse } from "next/server";

import {
  XeroNotConfiguredError,
  createXeroClient,
  readXeroEnv,
} from "@/lib/xero/client";

export const runtime = "nodejs";

/**
 * GET /api/xero/connect
 *
 * Starts the Xero OAuth2 authorization-code flow. Redirects the browser
 * to Xero's consent screen. After the user approves, Xero redirects back
 * to /api/xero/callback with a `code` query parameter.
 *
 * Visit this URL once per Xero organisation to wire up the integration.
 */
export async function GET() {
  try {
    const env = readXeroEnv();
    const client = createXeroClient(env);
    const consentUrl = await client.buildConsentUrl();
    return NextResponse.redirect(consentUrl);
  } catch (error) {
    if (error instanceof XeroNotConfiguredError) {
      return NextResponse.json(
        {
          error: "Xero is not configured.",
          detail: error.message,
          help: "Set XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_REDIRECT_URI in .env.local. See docs/xero-setup.md.",
        },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("[xero/connect] failed to build consent URL", error);
    return NextResponse.json(
      { error: "Failed to start Xero authorization.", detail: message },
      { status: 500 },
    );
  }
}
