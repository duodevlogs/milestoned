import "server-only";

import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users, type User } from "@/server/db/schema";

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  },

  /**
   * Atomically decrements credits only if the user currently has at least
   * one — the WHERE guard makes this safe against two concurrent
   * generations racing past a separate "check then write" step (which could
   * otherwise both pass a read of creditsRemaining=1 and both decrement,
   * going negative). Returns null (no row updated) when there's nothing to
   * spend, in which case the caller must not proceed to generate.
   */
  async decrementCreditsIfAvailable(id: string): Promise<User | null> {
    const db = getDb();
    const rows = await db
      .update(users)
      .set({ creditsRemaining: sql`${users.creditsRemaining} - 1` })
      .where(and(eq(users.id, id), gt(users.creditsRemaining, 0)))
      .returning();
    return rows[0] ?? null;
  },

  /**
   * Reverses a decrement after a failed generation. Deliberately does NOT
   * touch creditsTotalPurchased — this is undoing a charge that was never
   * really earned, not a new purchase (compare to a future top-up credit
   * grant, which should bump both fields).
   */
  async refundCredit(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({ creditsRemaining: sql`${users.creditsRemaining} + 1` })
      .where(eq(users.id, id));
  },
};
