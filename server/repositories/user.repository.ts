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

  /** Only touches the fields actually provided — omit a field to leave it unchanged. */
  async updateBranding(
    id: string,
    input: { businessName?: string; logoUrl?: string }
  ): Promise<void> {
    const set: Partial<{ businessName: string; logoUrl: string }> = {};
    if (input.businessName !== undefined) set.businessName = input.businessName;
    if (input.logoUrl !== undefined) set.logoUrl = input.logoUrl;
    if (Object.keys(set).length === 0) return;

    const db = getDb();
    await db.update(users).set(set).where(eq(users.id, id));
  },

  /** Only touches the fields actually provided — omit a field to leave it unchanged. */
  async updateBusinessDetails(
    id: string,
    input: {
      businessAddress?: string;
      taxId?: string;
      companyRegistration?: string;
      paymentInstructions?: string;
    }
  ): Promise<void> {
    const set: Partial<{
      businessAddress: string;
      taxId: string;
      companyRegistration: string;
      paymentInstructions: string;
    }> = {};
    if (input.businessAddress !== undefined) set.businessAddress = input.businessAddress;
    if (input.taxId !== undefined) set.taxId = input.taxId;
    if (input.companyRegistration !== undefined) set.companyRegistration = input.companyRegistration;
    if (input.paymentInstructions !== undefined) set.paymentInstructions = input.paymentInstructions;
    if (Object.keys(set).length === 0) return;

    const db = getDb();
    await db.update(users).set(set).where(eq(users.id, id));
  },
};
