import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/server/db";
import { portalAccess, type PortalAccess } from "@/server/db/schema";

export const portalAccessRepository = {
  async listByProjectId(projectId: string): Promise<PortalAccess[]> {
    const db = getDb();
    return db.select().from(portalAccess).where(eq(portalAccess.projectId, projectId));
  },

  /** Only returns a row that hasn't been revoked — a revoked invite is treated as "no access" everywhere. */
  async findActive(projectId: string, email: string): Promise<PortalAccess | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portalAccess)
      .where(
        and(
          eq(portalAccess.projectId, projectId),
          eq(portalAccess.email, email),
          isNull(portalAccess.revokedAt)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  /** Invites (or re-invites, clearing any prior revocation) — idempotent on the (projectId, email) unique constraint. */
  async upsertInvite(projectId: string, email: string): Promise<PortalAccess> {
    const db = getDb();
    const rows = await db
      .insert(portalAccess)
      .values({ projectId, email })
      .onConflictDoUpdate({
        target: [portalAccess.projectId, portalAccess.email],
        set: { revokedAt: null, invitedAt: new Date() },
      })
      .returning();
    return rows[0];
  },

  async revoke(projectId: string, email: string): Promise<void> {
    const db = getDb();
    await db
      .update(portalAccess)
      .set({ revokedAt: new Date() })
      .where(and(eq(portalAccess.projectId, projectId), eq(portalAccess.email, email)));
  },

  async markVerified(projectId: string, email: string): Promise<void> {
    const db = getDb();
    await db
      .update(portalAccess)
      .set({ lastVerifiedAt: new Date() })
      .where(and(eq(portalAccess.projectId, projectId), eq(portalAccess.email, email)));
  },
};
