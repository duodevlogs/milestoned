import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users, type User } from "@/server/db/schema";

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  },
};
