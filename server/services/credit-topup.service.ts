import "server-only";

import { creditPurchaseRepository } from "@/server/repositories/credit-purchase.repository";

export const creditTopUpService = {
  async recordPurchase(
    userId: string,
    stripeSessionId: string,
    credits: number,
    amountCents: number
  ): Promise<void> {
    await creditPurchaseRepository.grantIfNew(userId, stripeSessionId, credits, amountCents);
  },
};
