import "server-only";

import type Stripe from "stripe";
import { AppError } from "@/server/errors";
import { stripeService } from "@/server/services/stripe.service";
import { foundingMemberService } from "@/server/services/founding-member.service";

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
    if (session.metadata?.kind !== "founding_member") {
      return;
    }
    if (session.payment_status !== "paid") {
      return;
    }

    const email = session.customer_details?.email;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!email || !customerId) {
      console.error("[webhook_missing_fields]", {
        sessionId: session.id,
        hasEmail: !!email,
        hasCustomerId: !!customerId,
      });
      return;
    }

    await foundingMemberService.recordPayment(email, customerId);
  },
};
