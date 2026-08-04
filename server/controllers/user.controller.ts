import "server-only";

import { userService } from "@/server/services/user.service";
import { updateBrandingSchema, updateBusinessDetailsSchema } from "@/server/validation/user.schema";

export const userController = {
  async updateBranding(userId: string, raw: unknown): Promise<void> {
    const input = updateBrandingSchema.parse(raw);
    await userService.updateBranding(userId, input);
  },

  async updateBusinessDetails(userId: string, raw: unknown): Promise<void> {
    const input = updateBusinessDetailsSchema.parse(raw);
    await userService.updateBusinessDetails(userId, input);
  },
};
