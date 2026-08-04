import "server-only";

import { stripeService } from "@/server/services/stripe.service";
import { userService } from "@/server/services/user.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { creditPackageIdSchema } from "@/server/validation/checkout.schema";

export const checkoutController = {
  /**
   * isFoundingMember is resolved here from the caller's own verified
   * profile — the client never gets to say which price it wants.
   */
  async createTopUpSession(
    userId: string,
    origin: string,
    rawPackageId: unknown
  ): Promise<{ url: string }> {
    await appSettingsService.requireLaunched();
    const packageId = creditPackageIdSchema.parse(rawPackageId);
    const profile = await userService.getProfile(userId);
    const isFoundingMember = profile?.isFoundingMember ?? false;
    const url = await stripeService.createTopUpCheckout(
      origin,
      userId,
      packageId,
      isFoundingMember
    );
    return { url };
  },
};
