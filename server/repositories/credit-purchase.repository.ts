import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { creditPurchases, users, type CreditPurchase } from "@/server/db/schema";

/**
 * Drizzle wraps the underlying postgres.js error rather than surfacing it
 * directly — the real PostgresError (with the Postgres error `code`) lives
 * on `.cause`, not on the thrown error itself. Checked at both levels since
 * that wrapping isn't guaranteed to be identical across drizzle versions.
 */
function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === "23505") return true;
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause;
  return cause?.code === "23505";
}

export const creditPurchaseRepository = {
  async listByUserId(userId: string): Promise<CreditPurchase[]> {
    const db = getDb();
    return db
      .select()
      .from(creditPurchases)
      .where(eq(creditPurchases.userId, userId))
      .orderBy(desc(creditPurchases.createdAt));
  },

  /**
   * Idempotent credit grant: inserts a row keyed on the Stripe session id
   * (unique constraint) and bumps the user's balance in the same
   * transaction. Stripe can redeliver the same webhook event more than
   * once — a redelivery hits the unique constraint, the transaction rolls
   * back, and this returns false instead of granting credits twice.
   */
  async grantIfNew(
    userId: string,
    stripeSessionId: string,
    credits: number,
    amountCents: number
  ): Promise<boolean> {
    const db = getDb();
    try {
      await db.transaction(async (tx) => {
        await tx.insert(creditPurchases).values({
          userId,
          stripeSessionId,
          creditsPurchased: credits,
          amountCents,
        });
        await tx
          .update(users)
          .set({
            creditsRemaining: sql`${users.creditsRemaining} + ${credits}`,
            creditsTotalPurchased: sql`${users.creditsTotalPurchased} + ${credits}`,
          })
          .where(eq(users.id, userId));
      });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) return false;
      throw error;
    }
  },
};
