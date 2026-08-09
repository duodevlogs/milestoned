import "server-only";

import { sowGenerationService } from "@/server/services/sow-generation.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { generateSowSchema } from "@/server/validation/sow-generation.schema";
import type { Document } from "@/server/db/schema";

export const sowGenerationController = {
  async generate(
    userId: string,
    raw: unknown
  ): Promise<{ document: Document; creditsRemaining: number }> {
    await appSettingsService.requireLaunched();
    const input = generateSowSchema.parse(raw);
    return sowGenerationService.generate(userId, input);
  },
};
