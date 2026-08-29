import "server-only";

import { cookies } from "next/headers";
import {
  verifyPortalSessionToken,
  PORTAL_SESSION_COOKIE,
  type PortalSessionPayload,
} from "@/lib/portal-session";
import { AppError } from "@/server/errors";

/** Wraps Next's request-scoped cookie jar, mirroring how auth.service.ts wraps Supabase's request-scoped client. */
export const portalSessionService = {
  async getSession(): Promise<PortalSessionPayload | null> {
    const jar = await cookies();
    const token = jar.get(PORTAL_SESSION_COOKIE)?.value;
    return verifyPortalSessionToken(token);
  },

  /** The verified session for this exact project, or throws 401 — also rejects a valid session for a DIFFERENT project. */
  async requireSession(projectId: string): Promise<PortalSessionPayload> {
    const session = await this.getSession();
    if (!session || session.projectId !== projectId) {
      throw AppError.unauthorized();
    }
    return session;
  },

  async setSessionCookie(token: string): Promise<void> {
    const jar = await cookies();
    jar.set(PORTAL_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days — matches the token's own expiry in lib/portal-session.ts
    });
  },

  async clearSessionCookie(): Promise<void> {
    const jar = await cookies();
    jar.delete(PORTAL_SESSION_COOKIE);
  },
};
