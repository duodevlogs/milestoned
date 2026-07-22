import "server-only";

import { foundingMemberRepository } from "@/server/repositories/founding-member.repository";
import { emailService } from "@/server/services/email.service";

export const foundingMemberService = {
  /**
   * Records the payment (source of truth, must succeed) and sends the
   * confirmation email (best-effort — a Resend outage must not cause
   * Stripe to treat the webhook as failed and keep retrying it).
   */
  async recordPayment(email: string, stripeCustomerId: string): Promise<void> {
    await foundingMemberRepository.upsertPaid(email, stripeCustomerId);

    try {
      await emailService.sendFoundingMemberConfirmation(email);
    } catch (error) {
      console.error("[founding_member_email_failed]", error);
    }
  },
};
