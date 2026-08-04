import "server-only";

import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { Document, DocumentStatus } from "@/server/db/schema";
import type { GeneratedDocumentContent } from "@/lib/document-generation";

export interface LinkableDocumentSummary {
  id: string;
  docType: Document["docType"];
  docNumber: string | null;
  projectName: string;
  clientName: string;
  milestones: { label: string; pct: number; amount: number }[];
}

export const documentService = {
  async listForUser(userId: string): Promise<Document[]> {
    return documentRepository.listByUserId(userId);
  },

  /**
   * SOW/Contract documents the Invoice flow can link against — used both to
   * stamp a relatedDocNumber and to let the user pick one of that
   * document's milestones as a line item, so an invoice can show
   * "Milestone 2 of 4" against the actual payment schedule it bills for.
   */
  async listLinkableForInvoice(userId: string): Promise<LinkableDocumentSummary[]> {
    const docs = await documentRepository.listByDocTypesForUser(userId, ["sow", "contract"]);
    return docs.map((doc) => {
      const content = doc.content as GeneratedDocumentContent;
      return {
        id: doc.id,
        docType: doc.docType,
        docNumber: doc.docNumber,
        projectName: doc.projectName,
        clientName: doc.clientName,
        milestones: content.milestones ?? [],
      };
    });
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
