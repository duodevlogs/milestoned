import "server-only";

import { proposalGenerationService } from "@/server/services/proposal-generation.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { generateProposalSchema } from "@/server/validation/proposal-generation.schema";
import type { Document } from "@/server/db/schema";

export const proposalGenerationController = {
  async generate(
    userId: string,
    raw: unknown
  ): Promise<{ document: Document; creditsRemaining: number }> {
    await appSettingsService.requireLaunched();
    const input = generateProposalSchema.parse(raw);
    return proposalGenerationService.generate(userId, input);
  },
};
