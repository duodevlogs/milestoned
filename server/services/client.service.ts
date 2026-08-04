import "server-only";

import { clientRepository } from "@/server/repositories/client.repository";
import { documentRepository } from "@/server/repositories/document.repository";
import { AppError } from "@/server/errors";
import type { Client, Document } from "@/server/db/schema";

export interface ClientWithDocumentCount extends Client {
  documentCount: number;
}

export const clientService = {
  /**
   * Groups the user's existing documents by clientId in memory rather than
   * a joined aggregate query — a freelancer's document list is small, and
   * this reuses documentRepository.listByUserId as-is instead of adding a
   * new SQL shape just for a count.
   */
  async listForUser(userId: string): Promise<ClientWithDocumentCount[]> {
    const [clientRows, allDocuments] = await Promise.all([
      clientRepository.listByUserId(userId),
      documentRepository.listByUserId(userId),
    ]);
    const counts = new Map<string, number>();
    for (const doc of allDocuments) {
      if (doc.clientId) counts.set(doc.clientId, (counts.get(doc.clientId) ?? 0) + 1);
    }
    return clientRows.map((c) => ({ ...c, documentCount: counts.get(c.id) ?? 0 }));
  },

  async create(
    userId: string,
    input: { name: string; email: string; company: string; notes: string }
  ): Promise<Client> {
    return clientRepository.create({ userId, ...input });
  },

  async getWithDocuments(
    userId: string,
    clientId: string
  ): Promise<{ client: Client; documents: Document[] }> {
    const client = await clientRepository.getByIdForUser(clientId, userId);
    if (!client) {
      throw AppError.notFound("Client not found.", "client_not_found");
    }
    const documents = await documentRepository.listByClientIdForUser(clientId, userId);
    return { client, documents };
  },

  /** Used by document-generation.service.ts to verify a submitted clientId is really the caller's. */
  async verifyOwnership(userId: string, clientId: string): Promise<Client | null> {
    return clientRepository.getByIdForUser(clientId, userId);
  },
};
