import "server-only";

import { z } from "zod";
import { documentService } from "@/server/services/document.service";
import { updateDocumentStatusSchema } from "@/server/validation/document.schema";
import type { Document } from "@/server/db/schema";

const documentIdSchema = z.uuid({ message: "Invalid document id." });

export const documentController = {
  async listForUser(userId: string): Promise<Document[]> {
    return documentService.listForUser(userId);
  },

  async getForUser(userId: string, rawDocumentId: unknown): Promise<Document> {
    const documentId = documentIdSchema.parse(rawDocumentId);
    return documentService.getForUser(userId, documentId);
  },

  async updateStatus(userId: string, raw: unknown): Promise<Document> {
    const input = updateDocumentStatusSchema.parse(raw);
    return documentService.updateStatus(userId, input.documentId, input.status);
  },
};
