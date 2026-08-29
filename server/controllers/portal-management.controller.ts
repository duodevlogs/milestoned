import "server-only";

import { z } from "zod";
import { portalManagementService } from "@/server/services/portal-management.service";
import {
  inviteClientSchema,
  revokeClientSchema,
  setDocumentSharedSchema,
} from "@/server/validation/portal-management.schema";
import type { PortalAccess, Document } from "@/server/db/schema";

const projectIdSchema = z.uuid({ message: "Invalid project id." });

export const portalManagementController = {
  async listInvitedClients(userId: string, rawProjectId: unknown): Promise<PortalAccess[]> {
    const projectId = projectIdSchema.parse(rawProjectId);
    return portalManagementService.listInvitedClients(userId, projectId);
  },

  async inviteClient(userId: string, rawProjectId: unknown, raw: unknown): Promise<PortalAccess> {
    const projectId = projectIdSchema.parse(rawProjectId);
    const { email } = inviteClientSchema.parse(raw);
    return portalManagementService.inviteClient(userId, projectId, email);
  },

  async revokeClient(userId: string, rawProjectId: unknown, raw: unknown): Promise<void> {
    const projectId = projectIdSchema.parse(rawProjectId);
    const { email } = revokeClientSchema.parse(raw);
    await portalManagementService.revokeClient(userId, projectId, email);
  },

  async setDocumentShared(userId: string, raw: unknown): Promise<Document> {
    const { documentId, shared } = setDocumentSharedSchema.parse(raw);
    return portalManagementService.setDocumentShared(userId, documentId, shared);
  },
};
