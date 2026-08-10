import "server-only";

import { z } from "zod";
import { projectService, type ProjectWithDocumentCount } from "@/server/services/project.service";
import type { Project, Document } from "@/server/db/schema";

const projectIdSchema = z.uuid({ message: "Invalid project id." });

export const projectController = {
  async listForUser(userId: string): Promise<ProjectWithDocumentCount[]> {
    return projectService.listForUser(userId);
  },

  async getWithDocuments(
    userId: string,
    rawProjectId: unknown
  ): Promise<{ project: Project; documents: Document[] }> {
    const projectId = projectIdSchema.parse(rawProjectId);
    return projectService.getWithDocuments(userId, projectId);
  },
};
