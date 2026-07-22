import "server-only";

import Stripe from "stripe";

/*
 * STRIPE_SECRET_KEY is server-only and read lazily so the app can boot
 * without Stripe configured (the key is validated on first use).
 */
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

export const stripeService = {
  /**
   * $7 one-time founding-member checkout. Uses the configured Price when
   * STRIPE_FOUNDING_MEMBER_PRICE_ID is set, otherwise inline price_data so
   * no dashboard product setup is needed to test.
   */
  async createFoundingMemberCheckout(origin: string): Promise<string> {
    const priceId = process.env.STRIPE_FOUNDING_MEMBER_PRICE_ID;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                unit_amount: 700,
                product_data: {
                  name: "Milestoned — Founding Member",
                  description:
                    "One-time founding member access. Locked-in price, guaranteed access at launch, generation credits included.",
                },
              },
              quantity: 1,
            },
      ],
      metadata: { kind: "founding_member" },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }
    return session.url;
  },

  /**
   * Verifies the Stripe-Signature header against the raw request body using
   * STRIPE_WEBHOOK_SECRET. Throws if the signature is missing or invalid —
   * callers must never process a webhook payload that fails this check.
   */
  constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    return getStripe().webhooks.constructEvent(rawBody, signature, secret);
  },
};
