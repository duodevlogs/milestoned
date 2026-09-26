import "server-only";

import { randomUUID } from "node:crypto";
import { userRepository } from "@/server/repositories/user.repository";
import { AppError } from "@/server/errors";
import { MAX_PAYMENT_METHODS, normalizePaymentFields, type SavedPaymentMethod } from "@/lib/payment-methods";
import type { SavePaymentMethodInput } from "@/server/validation/payment-method.schema";

export const paymentMethodService = {
  async list(userId: string): Promise<SavedPaymentMethod[]> {
    const profile = await userRepository.findById(userId);
    return profile?.paymentMethods ?? [];
  },

  /** Adds a method, or replaces one when input.id is set. Ids only ever come from here, never from the client. */
  async save(userId: string, input: SavePaymentMethodInput): Promise<SavedPaymentMethod> {
    const methods = await this.list(userId);
    const { fields, error } = normalizePaymentFields(input.type, input.fields);
    if (error) {
      throw AppError.badRequest(error, "invalid_payment_method");
    }

    if (input.id) {
      const existing = methods.find((m) => m.id === input.id);
      if (!existing) {
        throw AppError.notFound("Payment method not found.", "payment_method_not_found");
      }
      const updated: SavedPaymentMethod = {
        id: existing.id,
        type: input.type,
        label: input.label,
        fields,
        isDefault: input.isDefault,
      };
      await userRepository.updatePaymentMethods(
        userId,
        methods.map((m) => (m.id === existing.id ? updated : m))
      );
      return updated;
    }

    if (methods.length >= MAX_PAYMENT_METHODS) {
      throw AppError.badRequest(
        `You can save up to ${MAX_PAYMENT_METHODS} payment methods.`,
        "too_many_payment_methods"
      );
    }
    const created: SavedPaymentMethod = {
      id: randomUUID(),
      type: input.type,
      label: input.label,
      fields,
      isDefault: input.isDefault,
    };
    await userRepository.updatePaymentMethods(userId, [...methods, created]);
    return created;
  },

  async remove(userId: string, id: string): Promise<void> {
    const methods = await this.list(userId);
    if (!methods.some((m) => m.id === id)) {
      throw AppError.notFound("Payment method not found.", "payment_method_not_found");
    }
    await userRepository.updatePaymentMethods(
      userId,
      methods.filter((m) => m.id !== id)
    );
  },
};
