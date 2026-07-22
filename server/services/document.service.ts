import "server-only";

import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { Document, DocumentStatus } from "@/server/db/schema";

export const documentService = {
  async listForUser(userId: string): Promise<Document[]> {
    return documentRepository.listByUserId(userId);
  },

  async getForUser(userId: string, documentId: string): Promise<Document> {
    const found = await documentRepository.getByIdForUser(documentId, userId);
    if (!found) {
      throw AppError.notFound("Document not found.", "document_not_found");
    }
    return found;
  },

  async updateStatus(
    userId: string,
    documentId: string,
    status: DocumentStatus
  ): Promise<Document> {
    const updated = await documentRepository.updateStatus(documentId, userId, status);
    if (!updated) {
      throw AppError.notFound("Document not found.", "document_not_found");
    }
    return updated;
  },
};
