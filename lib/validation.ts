import { z } from "zod";

export const variantIdValues = ["2pack", "4pack"] as const;

export const checkoutRequestSchema = z.object({
  variantId: z.enum(variantIdValues, {
    error: "Please choose a pack size.",
  }),
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(20, "For orders larger than 20 packs, please contact us."),
  shippingProtection: z.boolean().default(false),
});

export type CheckoutRequest = z.output<typeof checkoutRequestSchema>;
export type CheckoutRequestInput = z.input<typeof checkoutRequestSchema>;
