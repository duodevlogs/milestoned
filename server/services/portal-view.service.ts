import "server-only";

import { projectRepository } from "@/server/repositories/project.repository";
import { portalAccessRepository } from "@/server/repositories/portal-access.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { Project, Document } from "@/server/db/schema";

/**
 * Client-facing read path — every call re-checks portalAccess is still
 * active (not revoked), not just that the session cookie's signature is
 * valid, since a provider's revoke must take effect immediately rather
 * than waiting for the session to expire on its own.
 */
export const portalViewService = {
  async getProjectView(
    projectId: string,
    email: string
  ): Promise<{ project: Project; documents: Document[] }> {
    const access = await portalAccessRepository.findActive(projectId, email);
    if (!access) {
      throw AppError.unauthorized();
    }
    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }
    const documents = await documentRepository.listSharedByProjectId(projectId);
    return { project, documents };
  },

  async getSharedDocument(projectId: string, email: string, documentId: string): Promise<Document> {
    const access = await portalAccessRepository.findActive(projectId, email);
    if (!access) {
      throw AppError.unauthorized();
    }
    const doc = await documentRepository.getSharedByIdAndProjectId(documentId, projectId);
    if (!doc) {
      throw AppError.notFound("Document not found.", "document_not_found");
    }
    return doc;
  },
};
