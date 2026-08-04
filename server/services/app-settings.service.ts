import "server-only";

import { appSettingsRepository } from "@/server/repositories/app-settings.repository";
import { AppError } from "@/server/errors";

export const appSettingsService = {
  async isPrelaunch(): Promise<boolean> {
    return appSettingsRepository.isPrelaunch();
  },

  /**
   * Server-side guard for money/generation endpoints — pages already redirect
   * to /welcome pre-launch, but that's a UI convenience, not a security
   * boundary; this stops the same actions if called directly (fetch/curl),
   * same defense-in-depth principle as re-validating milestone sums server-side.
   */
  async requireLaunched(): Promise<void> {
    if (await this.isPrelaunch()) {
      throw AppError.forbidden(
        "Milestoned hasn't launched yet — we'll email you the moment it opens.",
        "prelaunch"
      );
    }
  },
};
