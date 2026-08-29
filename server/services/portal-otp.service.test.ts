import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { portalOtpService } from "./portal-otp.service";
import { portalAccessRepository } from "@/server/repositories/portal-access.repository";
import { portalOtpRepository } from "@/server/repositories/portal-otp.repository";
import { resendService } from "@/server/services/resend.service";

vi.mock("@/server/repositories/portal-access.repository", () => ({
  portalAccessRepository: { findActive: vi.fn(), markVerified: vi.fn() },
}));
vi.mock("@/server/repositories/portal-otp.repository", () => ({
  portalOtpRepository: {
    invalidateActive: vi.fn(),
    create: vi.fn(),
    findLatestActive: vi.fn(),
    incrementAttempts: vi.fn(),
    markConsumed: vi.fn(),
  },
}));
vi.mock("@/server/services/resend.service", () => ({
  resendService: { sendPortalOtpEmail: vi.fn() },
}));

const findActive = vi.mocked(portalAccessRepository.findActive);
const markVerified = vi.mocked(portalAccessRepository.markVerified);
const invalidateActive = vi.mocked(portalOtpRepository.invalidateActive);
const create = vi.mocked(portalOtpRepository.create);
const findLatestActive = vi.mocked(portalOtpRepository.findLatestActive);
const incrementAttempts = vi.mocked(portalOtpRepository.incrementAttempts);
const markConsumed = vi.mocked(portalOtpRepository.markConsumed);
const sendPortalOtpEmail = vi.mocked(resendService.sendPortalOtpEmail);

function fakeAccess(overrides = {}) {
  return {
    id: "access-1",
    projectId: "project-1",
    email: "client@example.com",
    invitedAt: new Date(),
    revokedAt: null,
    lastVerifiedAt: null,
    ...overrides,
  };
}

function fakeOtpRecord(overrides = {}) {
  return {
    id: "otp-1",
    projectId: "project-1",
    email: "client@example.com",
    codeHash: "",
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
    consumedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv("PORTAL_SESSION_SECRET", "test-secret-do-not-use-in-prod");
  findActive.mockReset();
  markVerified.mockReset();
  invalidateActive.mockReset();
  create.mockReset();
  findLatestActive.mockReset();
  incrementAttempts.mockReset();
  markConsumed.mockReset();
  sendPortalOtpEmail.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("portalOtpService.requestCode", () => {
  it("silently no-ops for an email that isn't invited — never reveals invite status", async () => {
    findActive.mockResolvedValue(null);
    await portalOtpService.requestCode("project-1", "stranger@example.com", "Website redesign");
    expect(sendPortalOtpEmail).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("invalidates prior codes and sends a fresh one for an invited email", async () => {
    findActive.mockResolvedValue(fakeAccess());
    await portalOtpService.requestCode("project-1", "Client@Example.com", "Website redesign");
    expect(invalidateActive).toHaveBeenCalledWith("project-1", "client@example.com");
    expect(create).toHaveBeenCalledOnce();
    expect(sendPortalOtpEmail).toHaveBeenCalledWith(
      "client@example.com",
      expect.stringMatching(/^\d{6}$/),
      "Website redesign"
    );
  });
});

describe("portalOtpService.verifyCode", () => {
  it("rejects when the email isn't (or is no longer) invited", async () => {
    findActive.mockResolvedValue(null);
    await expect(
      portalOtpService.verifyCode("project-1", "client@example.com", "123456")
    ).rejects.toMatchObject({ code: "invalid_otp" });
  });

  it("rejects when there's no active code (expired or never requested)", async () => {
    findActive.mockResolvedValue(fakeAccess());
    findLatestActive.mockResolvedValue(null);
    await expect(
      portalOtpService.verifyCode("project-1", "client@example.com", "123456")
    ).rejects.toMatchObject({ code: "otp_expired" });
  });

  it("locks out after too many attempts and consumes the code", async () => {
    findActive.mockResolvedValue(fakeAccess());
    findLatestActive.mockResolvedValue(fakeOtpRecord({ attempts: 5 }));
    await expect(
      portalOtpService.verifyCode("project-1", "client@example.com", "123456")
    ).rejects.toMatchObject({ code: "otp_locked" });
    expect(markConsumed).toHaveBeenCalledWith("otp-1");
  });

  it("rejects an incorrect code and increments attempts", async () => {
    findActive.mockResolvedValue(fakeAccess());
    // A hash that will never match "654321" — verifyCode hashes the
    // submission itself, so any fixed placeholder hash proves a mismatch.
    findLatestActive.mockResolvedValue(fakeOtpRecord({ codeHash: "not-a-real-hash" }));
    await expect(
      portalOtpService.verifyCode("project-1", "client@example.com", "654321")
    ).rejects.toMatchObject({ code: "invalid_otp" });
    expect(incrementAttempts).toHaveBeenCalledWith("otp-1");
    expect(markConsumed).not.toHaveBeenCalled();
  });

  it("accepts the correct code, consumes it, marks the client verified, and returns a session token", async () => {
    // Derive the real hash the service would have produced for "654321"
    // under the stubbed secret, by round-tripping through requestCode's
    // own hashing path indirectly: request a code, capture what was hashed.
    findActive.mockResolvedValue(fakeAccess());
    let capturedHash = "";
    create.mockImplementation(async (input) => {
      capturedHash = input.codeHash;
      return fakeOtpRecord({ codeHash: input.codeHash });
    });
    sendPortalOtpEmail.mockImplementation(async (_to, code) => {
      // Re-run through requestCode to capture the hash for this exact code,
      // then verify with that same code below.
      expect(code).toMatch(/^\d{6}$/);
    });
    await portalOtpService.requestCode("project-1", "client@example.com", "Project");
    const sentCode = sendPortalOtpEmail.mock.calls[0][1];

    findLatestActive.mockResolvedValue(fakeOtpRecord({ codeHash: capturedHash }));
    const token = await portalOtpService.verifyCode("project-1", "client@example.com", sentCode);

    expect(typeof token).toBe("string");
    expect(markConsumed).toHaveBeenCalledWith("otp-1");
    expect(markVerified).toHaveBeenCalledWith("project-1", "client@example.com");
  });
});
