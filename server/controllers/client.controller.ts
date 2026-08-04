import "server-only";

import { z } from "zod";
import { clientService, type ClientWithDocumentCount } from "@/server/services/client.service";
import { createClientSchema } from "@/server/validation/client.schema";
import type { Client, Document } from "@/server/db/schema";

const clientIdSchema = z.uuid({ message: "Invalid client id." });

export const clientController = {
  async listForUser(userId: string): Promise<ClientWithDocumentCount[]> {
    return clientService.listForUser(userId);
  },

  async create(userId: string, raw: unknown): Promise<Client> {
    const input = createClientSchema.parse(raw);
    return clientService.create(userId, input);
  },

  async getWithDocuments(
    userId: string,
    rawClientId: unknown
  ): Promise<{ client: Client; documents: Document[] }> {
    const clientId = clientIdSchema.parse(rawClientId);
    return clientService.getWithDocuments(userId, clientId);
  },
};
