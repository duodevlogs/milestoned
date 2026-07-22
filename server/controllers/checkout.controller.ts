import "server-only";

import { stripeService } from "@/server/services/stripe.service";

export const checkoutController = {
  async createFoundingMemberSession(origin: string): Promise<{ url: string }> {
    const url = await stripeService.createFoundingMemberCheckout(origin);
    return { url };
  },
};
