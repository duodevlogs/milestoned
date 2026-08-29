import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { projects, type Project } from "@/server/db/schema";

export const projectRepository = {
  async listByUserId(userId: string): Promise<Project[]> {
    const db = getDb();
    return db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  },

  /** Scoped to (id, userId) — returns null if the project doesn't exist or isn't the caller's. */
  async getByIdForUser(id: string, userId: string): Promise<Project | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Deliberately unscoped by userId — used only by the Client Portal's own
   * read path, where authorization comes from a verified OTP session +
   * active portalAccess row, not from a Milestoned user session at all.
   * Never call this from anywhere in the authenticated provider-side app.
   */
  async getById(id: string): Promise<Project | null> {
    const db = getDb();
    const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ?? null;
  },

  /**
   * Matches an existing project for this exact (clientName, name) pair —
   * the grouping heuristic used by findOrCreateForDocument. clientName
   * rather than clientId, since clientId is optional on both projects and
   * documents but clientName is always present.
   */
  async findByUserClientAndName(
    userId: string,
    clientName: string,
    name: string
  ): Promise<Project | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          eq(projects.clientName, clientName),
          eq(projects.name, name)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async create(input: {
    userId: string;
    name: string;
    clientId?: string | null;
    clientName: string;
  }): Promise<Project> {
    const db = getDb();
    const rows = await db
      .insert(projects)
      .values({
        userId: input.userId,
        name: input.name,
        clientId: input.clientId ?? null,
        clientName: input.clientName,
      })
      .returning();
    return rows[0];
  },
};
