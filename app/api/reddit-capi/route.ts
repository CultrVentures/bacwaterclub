import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const redditCapiEventSchema = z.object({
  eventName: z.string().trim().min(1, "eventName is required."),
  eventTimestamp: z.string().trim().optional(),
  redditClickId: z.string().trim().optional(),
  emailHash: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsedEvent = redditCapiEventSchema.safeParse(body);

    if (!parsedEvent.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Reddit conversion payload.",
          fieldErrors: parsedEvent.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (!process.env.REDDIT_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: true,
          message: "Reddit CAPI stub accepted the event payload.",
        },
        { status: 202 },
      );
    }

    // Production placeholder:
    // Forward the normalized event to Reddit's Conversions API with the access
    // token, ad account ID, click identifier, and hashed user data required by
    // the final implementation. This scaffold returns an accepted response so the
    // landing page remains deployable before the server-side measurement layer is finalized.

    return NextResponse.json(
      {
        success: true,
        message: "Reddit CAPI stub accepted the event payload.",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Reddit CAPI route failed.", error);
    return NextResponse.json(
      {
        success: false,
        message: "Reddit CAPI route failed unexpectedly.",
      },
      { status: 500 },
    );
  }
}
