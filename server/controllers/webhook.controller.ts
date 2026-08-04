import "server-only";

import type Stripe from "stripe";
import { AppError } from "@/server/errors";
import { stripeService } from "@/server/services/stripe.service";
import { creditTopUpService } from "@/server/services/credit-topup.service";

export const webhookController = {
  /**
   * Verifies the Stripe signature BEFORE any payload field is trusted or
   * acted on. Unrecognized/irrelevant event types are acknowledged as
   * no-ops rather than errors, since Stripe sends many event types this
   * app doesn't care about.
   */
  async handleStripeEvent(rawBody: string, signature: string | null): Promise<void> {
    if (!signature) {
      throw AppError.badRequest("Missing Stripe signature.", "missing_signature");
    }

    let event: Stripe.Event;
    try {
      event = stripeService.constructWebhookEvent(rawBody, signature);
    } catch {
      throw AppError.badRequest("Invalid Stripe signature.", "invalid_signature");
    }

    if (event.type !== "checkout.session.completed") {
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return;
    }

    if (session.metadata?.kind === "credit_topup") {
      await handleCreditTopUp(session);
    }
  },
};

async function handleCreditTopUp(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits);

  if (!userId || !Number.isFinite(credits) || credits <= 0) {
    console.error("[webhook_missing_fields]", {
      sessionId: session.id,
      hasUserId: !!userId,
      credits: session.metadata?.credits,
    });
    return;
  }

  await creditTopUpService.recordPurchase(
    userId,
    session.id,
    credits,
    session.amount_total ?? 0
  );
}
