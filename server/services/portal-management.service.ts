import "server-only";

import { projectRepository } from "@/server/repositories/project.repository";
import { portalAccessRepository } from "@/server/repositories/portal-access.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { PortalAccess, Document } from "@/server/db/schema";

/** Provider-side: inviting/revoking clients and toggling document visibility. Every call verifies the project/document belongs to the caller first. */
export const portalManagementService = {
  async listInvitedClients(userId: string, projectId: string): Promise<PortalAccess[]> {
    const project = await projectRepository.getByIdForUser(projectId, userId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }
    return portalAccessRepository.listByProjectId(projectId);
  },

  async inviteClient(userId: string, projectId: string, email: string): Promise<PortalAccess> {
    const project = await projectRepository.getByIdForUser(projectId, userId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }
    return portalAccessRepository.upsertInvite(projectId, email.trim().toLowerCase());
  },

  async revokeClient(userId: string, projectId: string, email: string): Promise<void> {
    const project = await projectRepository.getByIdForUser(projectId, userId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }
    await portalAccessRepository.revoke(projectId, email.trim().toLowerCase());
  },

  async setDocumentShared(userId: string, documentId: string, shared: boolean): Promise<Document> {
    const updated = await documentRepository.setSharedAt(documentId, userId, shared ? new Date() : null);
    if (!updated) {
      throw AppError.notFound("Document not found.", "document_not_found");
    }
    return updated;
  },
};
