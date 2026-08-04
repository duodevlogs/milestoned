import "server-only";

import { creditPurchaseRepository } from "@/server/repositories/credit-purchase.repository";
import type { CreditPurchase } from "@/server/db/schema";

export const billingService = {
  async listPurchases(userId: string): Promise<CreditPurchase[]> {
    return creditPurchaseRepository.listByUserId(userId);
  },
};
