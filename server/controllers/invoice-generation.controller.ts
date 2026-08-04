import "server-only";

import { invoiceGenerationService } from "@/server/services/invoice-generation.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { generateInvoiceSchema } from "@/server/validation/invoice-generation.schema";
import type { Document } from "@/server/db/schema";

export const invoiceGenerationController = {
  async generate(
    userId: string,
    raw: unknown
  ): Promise<{ document: Document; creditsRemaining: number }> {
    await appSettingsService.requireLaunched();
    const input = generateInvoiceSchema.parse(raw);
    return invoiceGenerationService.generate(userId, input);
  },
};
