import "server-only";

import { userRepository } from "@/server/repositories/user.repository";
import type { User } from "@/server/db/schema";

export const userService = {
  /**
   * Profile for a verified user id (callers must pass an id taken from a
   * Supabase session, never from request input). Null when the signup
   * trigger hasn't provisioned the row yet.
   */
  async getProfile(userId: string): Promise<User | null> {
    return userRepository.findById(userId);
  },

  async updateBranding(
    userId: string,
    input: { businessName?: string; logoUrl?: string }
  ): Promise<void> {
    await userRepository.updateBranding(userId, input);
  },

  async updateBusinessDetails(
    userId: string,
    input: {
      businessAddress?: string;
      taxId?: string;
      companyRegistration?: string;
      paymentInstructions?: string;
    }
  ): Promise<void> {
    await userRepository.updateBusinessDetails(userId, input);
  },
};
