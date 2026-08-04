import "server-only";

import Stripe from "stripe";
import { CREDIT_PACKAGES, priceCentsFor, type CreditPackageId } from "@/lib/credit-packages";

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
   * One-time credit top-up checkout for an already-authenticated user. The
   * userId travels in Stripe metadata so the webhook can credit that exact
   * account directly. isFoundingMember must be resolved server-side by the
   * caller from the user's verified DB record — never trust client input
   * for which price to charge.
   */
  async createTopUpCheckout(
    origin: string,
    userId: string,
    packageId: CreditPackageId,
    isFoundingMember: boolean
  ): Promise<string> {
    const pkg = CREDIT_PACKAGES[packageId];
    const unitAmount = priceCentsFor(pkg, isFoundingMember);
    const priceId = isFoundingMember
      ? packageId === "small"
        ? process.env.STRIPE_TOPUP_SMALL_FOUNDING_PRICE_ID
        : process.env.STRIPE_TOPUP_LARGE_FOUNDING_PRICE_ID
      : packageId === "small"
        ? process.env.STRIPE_TOPUP_SMALL_PRICE_ID
        : process.env.STRIPE_TOPUP_LARGE_PRICE_ID;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                unit_amount: unitAmount,
                product_data: {
                  name: `Milestoned — ${pkg.label}`,
                  description: isFoundingMember
                    ? "Generation credits top-up — founding member pricing."
                    : "Generation credits top-up.",
                },
              },
              quantity: 1,
            },
      ],
      metadata: { kind: "credit_topup", userId, credits: String(pkg.credits) },
      success_url: `${origin}/dashboard?topup=success`,
      cancel_url: `${origin}/dashboard?topup=cancelled`,
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
