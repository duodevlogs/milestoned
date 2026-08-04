import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  documents,
  type Document,
  type DocumentStatus,
} from "@/server/db/schema";

export const documentRepository = {
  async listByUserId(userId: string): Promise<Document[]> {
    const db = getDb();
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  },

  /** Used by the Invoice flow's "link to a SOW/Contract" picker. */
  async listByDocTypesForUser(
    userId: string,
    docTypes: Document["docType"][]
  ): Promise<Document[]> {
    const db = getDb();
    return db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), inArray(documents.docType, docTypes)))
      .orderBy(desc(documents.createdAt));
  },

  async create(input: {
    userId: string;
    docType: Document["docType"];
    clientName: string;
    clientId?: string | null;
    projectName: string;
    content: unknown;
    docNumber?: string | null;
    relatedDocumentId?: string | null;
  }): Promise<Document> {
    const db = getDb();
    const rows = await db
      .insert(documents)
      .values({
        userId: input.userId,
        docType: input.docType,
        clientName: input.clientName,
        clientId: input.clientId ?? null,
        projectName: input.projectName,
        content: input.content,
        docNumber: input.docNumber ?? null,
        relatedDocumentId: input.relatedDocumentId ?? null,
      })
      .returning();
    return rows[0];
  },

  /** Scoped to (clientId, userId) — for the client detail page's document history. */
  async listByClientIdForUser(clientId: string, userId: string): Promise<Document[]> {
    const db = getDb();
    return db
      .select()
      .from(documents)
      .where(and(eq(documents.clientId, clientId), eq(documents.userId, userId)))
      .orderBy(desc(documents.createdAt));
  },

  /**
   * Scoped to (id, userId) — same ownership rule as updateStatus below.
   * Returns null if the document doesn't exist or isn't the caller's.
   */
  async getByIdForUser(id: string, userId: string): Promise<Document | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Scoped to (id, userId) — Drizzle connects with a privileged role that
   * bypasses RLS, so ownership must be enforced here in the WHERE clause,
   * not assumed. Returns null if the document doesn't exist or isn't the
   * caller's, without distinguishing the two (avoids leaking existence).
   */
  async updateStatus(
    id: string,
    userId: string,
    status: DocumentStatus
  ): Promise<Document | null> {
    const db = getDb();
    const rows = await db
      .update(documents)
      .set({ status })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return rows[0] ?? null;
  },
};
