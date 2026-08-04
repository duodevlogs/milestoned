import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { clauseBundles, type ClauseBundle } from "@/server/db/schema";

export const clauseBundleRepository = {
  async listByUserId(userId: string): Promise<ClauseBundle[]> {
    const db = getDb();
    return db
      .select()
      .from(clauseBundles)
      .where(eq(clauseBundles.userId, userId))
      .orderBy(desc(clauseBundles.createdAt));
  },

  async getByIdForUser(id: string, userId: string): Promise<ClauseBundle | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(clauseBundles)
      .where(and(eq(clauseBundles.id, id), eq(clauseBundles.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(input: {
    userId: string;
    name: string;
    clauseSelection: unknown;
  }): Promise<ClauseBundle> {
    const db = getDb();
    const rows = await db.insert(clauseBundles).values(input).returning();
    return rows[0];
  },

  /** Returns false if the bundle doesn't exist or isn't the caller's. */
  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(clauseBundles)
      .where(and(eq(clauseBundles.id, id), eq(clauseBundles.userId, userId)))
      .returning();
    return rows.length > 0;
  },
};
