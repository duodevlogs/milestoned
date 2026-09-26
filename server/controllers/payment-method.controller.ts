import "server-only";

import { paymentMethodService } from "@/server/services/payment-method.service";
import { removePaymentMethodSchema, savePaymentMethodSchema } from "@/server/validation/payment-method.schema";
import type { SavedPaymentMethod } from "@/lib/payment-methods";

export const paymentMethodController = {
  async save(userId: string, raw: unknown): Promise<SavedPaymentMethod> {
    return paymentMethodService.save(userId, savePaymentMethodSchema.parse(raw));
  },

  async remove(userId: string, raw: unknown): Promise<void> {
    const { id } = removePaymentMethodSchema.parse(raw);
    await paymentMethodService.remove(userId, id);
  },
};
