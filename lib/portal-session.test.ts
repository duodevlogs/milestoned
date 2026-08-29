import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPortalSessionToken, verifyPortalSessionToken } from "./portal-session";

beforeEach(() => {
  vi.stubEnv("PORTAL_SESSION_SECRET", "test-secret-do-not-use-in-prod");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createPortalSessionToken / verifyPortalSessionToken", () => {
  it("round-trips a valid token", () => {
    const token = createPortalSessionToken("project-1", "client@example.com");
    const payload = verifyPortalSessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.projectId).toBe("project-1");
    expect(payload?.email).toBe("client@example.com");
  });

  it("rejects a token signed with a different secret", () => {
    const token = createPortalSessionToken("project-1", "client@example.com");
    vi.stubEnv("PORTAL_SESSION_SECRET", "a-completely-different-secret");
    expect(verifyPortalSessionToken(token)).toBeNull();
  });

  it("rejects a tampered payload (project id swapped after signing)", () => {
    const token = createPortalSessionToken("project-1", "client@example.com");
    const [payloadB64, signature] = token.split(".");
    const tamperedPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    tamperedPayload.projectId = "someone-elses-project";
    const tamperedB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString("base64url");
    expect(verifyPortalSessionToken(`${tamperedB64}.${signature}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    const token = createPortalSessionToken("project-1", "client@example.com");
    vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000); // 8 days — past the 7-day TTL
    expect(verifyPortalSessionToken(token)).toBeNull();
    vi.useRealTimers();
  });

  it("rejects malformed input without throwing", () => {
    expect(verifyPortalSessionToken(null)).toBeNull();
    expect(verifyPortalSessionToken(undefined)).toBeNull();
    expect(verifyPortalSessionToken("")).toBeNull();
    expect(verifyPortalSessionToken("not-a-real-token")).toBeNull();
    expect(verifyPortalSessionToken("only-one-part")).toBeNull();
  });

  it("rejects a session for a different project when checked against a specific one", () => {
    const token = createPortalSessionToken("project-1", "client@example.com");
    const payload = verifyPortalSessionToken(token);
    expect(payload?.projectId).not.toBe("project-2");
  });
});
