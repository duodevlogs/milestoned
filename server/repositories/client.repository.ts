import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { clients, type Client } from "@/server/db/schema";

export const clientRepository = {
  async listByUserId(userId: string): Promise<Client[]> {
    const db = getDb();
    return db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));
  },

  /** Scoped to (id, userId) — returns null if the client doesn't exist or isn't the caller's. */
  async getByIdForUser(id: string, userId: string): Promise<Client | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(input: {
    userId: string;
    name: string;
    email: string;
    company: string;
    notes: string;
  }): Promise<Client> {
    const db = getDb();
    const rows = await db.insert(clients).values(input).returning();
    return rows[0];
  },
};
