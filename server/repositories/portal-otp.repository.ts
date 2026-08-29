import "server-only";

import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { portalOtpCodes, type PortalOtpCode } from "@/server/db/schema";

export const portalOtpRepository = {
  async create(input: {
    projectId: string;
    email: string;
    codeHash: string;
    expiresAt: Date;
  }): Promise<PortalOtpCode> {
    const db = getDb();
    const rows = await db.insert(portalOtpCodes).values(input).returning();
    return rows[0];
  },

  /** The one code that's still eligible to be verified — unconsumed and unexpired, most recent wins. */
  async findLatestActive(projectId: string, email: string): Promise<PortalOtpCode | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portalOtpCodes)
      .where(
        and(
          eq(portalOtpCodes.projectId, projectId),
          eq(portalOtpCodes.email, email),
          isNull(portalOtpCodes.consumedAt),
          gt(portalOtpCodes.expiresAt, new Date())
        )
      )
      .orderBy(desc(portalOtpCodes.createdAt))
      .limit(1);
    return rows[0] ?? null;
  },

  /** Voids every still-active code for this pair — called before issuing a fresh one, so only the newest code ever works. */
  async invalidateActive(projectId: string, email: string): Promise<void> {
    const db = getDb();
    await db
      .update(portalOtpCodes)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(portalOtpCodes.projectId, projectId),
          eq(portalOtpCodes.email, email),
          isNull(portalOtpCodes.consumedAt)
        )
      );
  },

  async incrementAttempts(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(portalOtpCodes)
      .set({ attempts: sql`${portalOtpCodes.attempts} + 1` })
      .where(eq(portalOtpCodes.id, id));
  },

  async markConsumed(id: string): Promise<void> {
    const db = getDb();
    await db.update(portalOtpCodes).set({ consumedAt: new Date() }).where(eq(portalOtpCodes.id, id));
  },
};
