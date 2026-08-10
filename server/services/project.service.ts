import "server-only";

import { projectRepository } from "@/server/repositories/project.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { Project, Document } from "@/server/db/schema";

export interface ProjectWithDocumentCount extends Project {
  documentCount: number;
}

export const projectService = {
  /**
   * Groups the user's existing documents by projectId in memory rather than
   * a joined aggregate query — same reasoning as clientService.listForUser
   * (a freelancer's document list is small).
   */
  async listForUser(userId: string): Promise<ProjectWithDocumentCount[]> {
    const [projectRows, allDocuments] = await Promise.all([
      projectRepository.listByUserId(userId),
      documentRepository.listByUserId(userId),
    ]);
    const counts = new Map<string, number>();
    for (const doc of allDocuments) {
      if (doc.projectId) counts.set(doc.projectId, (counts.get(doc.projectId) ?? 0) + 1);
    }
    return projectRows.map((p) => ({ ...p, documentCount: counts.get(p.id) ?? 0 }));
  },

  async getWithDocuments(
    userId: string,
    projectId: string
  ): Promise<{ project: Project; documents: Document[] }> {
    const project = await projectRepository.getByIdForUser(projectId, userId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }
    const documents = await documentRepository.listByProjectIdForUser(projectId, userId);
    return { project, documents };
  },

  /**
   * Called by every generation service right before creating a document.
   * Reuses an existing project when this user already has one for the exact
   * same (clientName, projectName) pair — the consultant naturally types
   * the same project name across a Proposal → Contract → SOW → Invoice
   * chain for one engagement — otherwise creates a new one. Never a
   * separate step in any wizard.
   */
  async findOrCreateForDocument(
    userId: string,
    input: { clientId?: string | null; clientName: string; name: string }
  ): Promise<string> {
    const existing = await projectRepository.findByUserClientAndName(
      userId,
      input.clientName,
      input.name
    );
    if (existing) return existing.id;

    const created = await projectRepository.create({
      userId,
      name: input.name,
      clientId: input.clientId ?? null,
      clientName: input.clientName,
    });
    return created.id;
  },
};
