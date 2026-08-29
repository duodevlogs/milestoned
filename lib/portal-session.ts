import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * A minimal signed-cookie session for the Client Portal — deliberately not a
 * JWT library (no new dependency needed for a single HMAC-signed payload).
 * NOT a Supabase Auth session — the portal is a genuinely different trust
 * boundary: an OTP-verified client, not a Milestoned account holder.
 */

export interface PortalSessionPayload {
  projectId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — re-verify via OTP to extend

function getSecret(): string {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error("PORTAL_SESSION_SECRET is not set");
  }
  return secret;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

export function createPortalSessionToken(projectId: string, email: string): string {
  const now = Date.now();
  const payload: PortalSessionPayload = {
    projectId,
    email,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Returns null on any failure (bad shape, bad signature, expired) — never throws, since a forged/expired cookie is an expected input, not a bug. */
export function verifyPortalSessionToken(token: string | undefined | null): PortalSessionPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = sign(payloadB64);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  // timingSafeEqual throws on a length mismatch rather than returning false —
  // check lengths first so a malformed/tampered token can't shortcut the
  // constant-time comparison, and can't crash the caller either.
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  let payload: PortalSessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof payload.projectId !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.expiresAt !== "number"
  ) {
    return null;
  }
  if (Date.now() > payload.expiresAt) return null;

  return payload;
}

export const PORTAL_SESSION_COOKIE = "milestoned_portal_session";
