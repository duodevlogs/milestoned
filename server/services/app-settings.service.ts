import "server-only";

import { appSettingsRepository } from "@/server/repositories/app-settings.repository";
import { AppError } from "@/server/errors";

export const appSettingsService = {
  /**
   * Localhost-only escape hatch: `next dev` always sets NODE_ENV to
   * "development", regardless of anything in .env.local, while a
   * production build (`next build && next start`) and every Vercel
   * deployment always set it to "production" — this is Next's own
   * convention, not a value this app sets itself, so there's no config
   * this could accidentally flip in a real deployment. On localhost this
   * bypasses the /welcome redirect on every page without ever touching
   * app_settings.launched_at, so the real prelaunch state for actual users
   * is completely unaffected.
   */
  async isPrelaunch(): Promise<boolean> {
    if (process.env.NODE_ENV !== "production") {
      return false;
    }
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
