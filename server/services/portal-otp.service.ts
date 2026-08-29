import "server-only";

import { randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { portalAccessRepository } from "@/server/repositories/portal-access.repository";
import { portalOtpRepository } from "@/server/repositories/portal-otp.repository";
import { resendService } from "@/server/services/resend.service";
import { createPortalSessionToken } from "@/lib/portal-session";
import { AppError } from "@/server/errors";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateCode(): string {
  // 6 digits, zero-padded — randomInt's upper bound is exclusive.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Keyed hash (not plain SHA-256) — a 6-digit space is only 1M values, trivially rainbow-tableable without the secret key. */
function hashCode(code: string): string {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error("PORTAL_SESSION_SECRET is not set");
  }
  return createHmac("sha256", secret).update(code).digest("hex");
}

function codesMatch(submitted: string, storedHash: string): boolean {
  const submittedHash = hashCode(submitted);
  const a = Buffer.from(submittedHash);
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const portalOtpService = {
  /**
   * Always resolves the same way regardless of whether the email is
   * actually invited — never reveals invite status to the caller, since
   * this is the one public-facing entry point of the whole feature.
   */
  async requestCode(projectId: string, rawEmail: string, projectName: string): Promise<void> {
    const email = normalizeEmail(rawEmail);
    const access = await portalAccessRepository.findActive(projectId, email);
    if (!access) return; // silently no-op — see doc comment above

    await portalOtpRepository.invalidateActive(projectId, email);
    const code = generateCode();
    await portalOtpRepository.create({
      projectId,
      email,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    // Deliberately NOT best-effort like the old founding-member confirmation
    // email — without this send succeeding, the client has no way in at all,
    // so a failure here must surface as a real error, not a silent no-op.
    await resendService.sendPortalOtpEmail(email, code, projectName);
  },

  /** Throws AppError on any failure (wrong code, expired, too many attempts, revoked access) — never returns a falsy "invalid" value. */
  async verifyCode(projectId: string, rawEmail: string, submittedCode: string): Promise<string> {
    const email = normalizeEmail(rawEmail);
    const access = await portalAccessRepository.findActive(projectId, email);
    if (!access) {
      throw AppError.badRequest("Incorrect code.", "invalid_otp");
    }

    const record = await portalOtpRepository.findLatestActive(projectId, email);
    if (!record) {
      throw AppError.badRequest("That code has expired. Request a new one.", "otp_expired");
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      await portalOtpRepository.markConsumed(record.id);
      throw AppError.badRequest("Too many attempts. Request a new code.", "otp_locked");
    }

    await portalOtpRepository.incrementAttempts(record.id);
    if (!codesMatch(submittedCode.trim(), record.codeHash)) {
      throw AppError.badRequest("Incorrect code.", "invalid_otp");
    }

    await portalOtpRepository.markConsumed(record.id);
    await portalAccessRepository.markVerified(projectId, email);
    return createPortalSessionToken(projectId, email);
  },
};
