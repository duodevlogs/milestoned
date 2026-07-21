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
};
