import Stripe from "stripe";

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedClient) {
    return cachedClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local before calling Stripe.",
    );
  }

  cachedClient = new Stripe(secretKey, {
    typescript: true,
    appInfo: {
      name: "bacwaterclub.com",
    },
  });

  return cachedClient;
}

/** Reset the cached client. Only for tests. */
export function __resetStripeClientForTests(): void {
  cachedClient = null;
}
