import "server-only";

import { documentGenerationService } from "@/server/services/document-generation.service";
import { generateDocumentSchema } from "@/server/validation/document-generation.schema";
import type { Document } from "@/server/db/schema";

export const documentGenerationController = {
  async generate(
    userId: string,
    raw: unknown
  ): Promise<{ document: Document; creditsRemaining: number }> {
    const input = generateDocumentSchema.parse(raw);
    return documentGenerationService.generate(userId, input);
  },
};
