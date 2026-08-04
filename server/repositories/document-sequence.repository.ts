import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { documentSequences } from "@/server/db/schema";
import type { DocType } from "@/lib/document-generation";

export const documentSequenceRepository = {
  /**
   * Atomically returns the next number in the (userId, docType, year)
   * sequence — an upsert-increment, same guarded-update principle as
   * users.creditsRemaining, so two concurrent generations can never
   * collide on the same document number.
   */
  async nextNumber(userId: string, docType: DocType, year: number): Promise<number> {
    const db = getDb();
    const rows = await db
      .insert(documentSequences)
      .values({ userId, docType, year, lastNumber: 1 })
      .onConflictDoUpdate({
        target: [documentSequences.userId, documentSequences.docType, documentSequences.year],
        set: { lastNumber: sql`${documentSequences.lastNumber} + 1` },
      })
      .returning({ lastNumber: documentSequences.lastNumber });
    return rows[0].lastNumber;
  },
};
