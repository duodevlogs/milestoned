import "server-only";

import { templateRepository } from "@/server/repositories/template.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import { defaultClauseSelection } from "@/lib/contract-clauses";
import type { Template } from "@/server/db/schema";
import type { ClauseSelection } from "@/lib/contract-clauses";
import type { GeneratedDocumentContent } from "@/lib/document-generation";

export const templateService = {
  async listForUser(userId: string): Promise<Template[]> {
    return templateRepository.listByUserId(userId);
  },

  async getForUser(userId: string, id: string): Promise<Template> {
    const template = await templateRepository.getByIdForUser(id, userId);
    if (!template) {
      throw AppError.notFound("Template not found.", "template_not_found");
    }
    return template;
  },

  async createFromWizard(
    userId: string,
    input: {
      name: string;
      docType: Template["docType"];
      scope: string;
      deliverables: string;
      clauses: ClauseSelection;
    }
  ): Promise<Template> {
    return templateRepository.create({
      userId,
      name: input.name,
      docType: input.docType,
      scope: input.scope,
      deliverables: input.deliverables,
      clauseSelection: input.clauses,
      sourceDocumentId: null,
    });
  },

  /**
   * Clones an existing document's scope/deliverables/clauses into a new
   * template. Documents generated before `content.clauses` existed fall
   * back to that doc type's smart defaults rather than blocking cloning.
   */
  async createFromDocument(userId: string, name: string, documentId: string): Promise<Template> {
    const document = await documentRepository.getByIdForUser(documentId, userId);
    if (!document) {
      throw AppError.notFound("Document not found.", "document_not_found");
    }
    const content = document.content as GeneratedDocumentContent;
    return templateRepository.create({
      userId,
      name,
      docType: content.docType,
      scope: content.scope,
      deliverables: content.deliverables,
      clauseSelection: content.clauses ?? defaultClauseSelection(content.docType),
      sourceDocumentId: documentId,
    });
  },

  async deleteForUser(userId: string, id: string): Promise<void> {
    const deleted = await templateRepository.deleteForUser(id, userId);
    if (!deleted) {
      throw AppError.notFound("Template not found.", "template_not_found");
    }
  },
};
