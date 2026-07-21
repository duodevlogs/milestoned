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
};
