import "server-only";

import { z } from "zod";
import { templateService } from "@/server/services/template.service";
import { createTemplateSchema, cloneDocumentSchema } from "@/server/validation/template.schema";
import type { Template } from "@/server/db/schema";

const templateIdSchema = z.uuid({ message: "Invalid template id." });

export const templateController = {
  async listForUser(userId: string): Promise<Template[]> {
    return templateService.listForUser(userId);
  },

  async getForUser(userId: string, rawId: unknown): Promise<Template> {
    const id = templateIdSchema.parse(rawId);
    return templateService.getForUser(userId, id);
  },

  async createFromWizard(userId: string, raw: unknown): Promise<Template> {
    const input = createTemplateSchema.parse(raw);
    return templateService.createFromWizard(userId, input);
  },

  async createFromDocument(userId: string, raw: unknown): Promise<Template> {
    const input = cloneDocumentSchema.parse(raw);
    return templateService.createFromDocument(userId, input.name, input.documentId);
  },

  async deleteForUser(userId: string, rawId: unknown): Promise<void> {
    const id = templateIdSchema.parse(rawId);
    await templateService.deleteForUser(userId, id);
  },
};
