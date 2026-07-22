import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  foundingMembers,
  type FoundingMember,
} from "@/server/db/schema";

export const foundingMemberRepository = {
  async findPaidByEmail(email: string): Promise<FoundingMember | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(foundingMembers)
      .where(
        and(
          eq(foundingMembers.email, email),
          eq(foundingMembers.paymentStatus, "paid")
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Marks an email as a paid founding member. Idempotent on `email` — safe
   * to call repeatedly for the same checkout (Stripe redelivers webhooks).
   */
  async upsertPaid(email: string, stripeCustomerId: string): Promise<void> {
    const db = getDb();
    await db
      .insert(foundingMembers)
      .values({ email, stripeCustomerId, paymentStatus: "paid" })
      .onConflictDoUpdate({
        target: foundingMembers.email,
        set: { stripeCustomerId, paymentStatus: "paid" },
      });
  },
};
