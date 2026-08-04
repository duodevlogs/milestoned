import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { templates, type Template } from "@/server/db/schema";

export const templateRepository = {
  async listByUserId(userId: string): Promise<Template[]> {
    const db = getDb();
    return db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.createdAt));
  },

  async getByIdForUser(id: string, userId: string): Promise<Template | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(input: {
    userId: string;
    name: string;
    docType: Template["docType"];
    scope: string;
    deliverables: string;
    clauseSelection: unknown;
    sourceDocumentId: string | null;
  }): Promise<Template> {
    const db = getDb();
    const rows = await db.insert(templates).values(input).returning();
    return rows[0];
  },

  /** Returns false if the template doesn't exist or isn't the caller's. */
  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .returning();
    return rows.length > 0;
  },
};
