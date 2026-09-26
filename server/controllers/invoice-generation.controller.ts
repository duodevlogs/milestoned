import "server-only";

import { invoiceGenerationService } from "@/server/services/invoice-generation.service";
import { appSettingsService } from "@/server/services/app-settings.service";
import { generateInvoiceSchema } from "@/server/validation/invoice-generation.schema";
import { z } from "zod";
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

  /** Edits an existing invoice in place — see invoiceGenerationService.update. */
  async update(userId: string, rawDocumentId: unknown, raw: unknown): Promise<{ document: Document }> {
    await appSettingsService.requireLaunched();
    const documentId = z.uuid({ message: "Invalid document id." }).parse(rawDocumentId);
    const input = generateInvoiceSchema.parse(raw);
    return invoiceGenerationService.update(userId, documentId, input);
  },
};
