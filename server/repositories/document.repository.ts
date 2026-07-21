import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { documents, type Document } from "@/server/db/schema";

export const documentRepository = {
  async listByUserId(userId: string): Promise<Document[]> {
    const db = getDb();
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  },
};
