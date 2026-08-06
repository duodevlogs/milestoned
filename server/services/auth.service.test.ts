import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth.service";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

function fakeSupabaseClient(overrides: { signUp?: unknown; signInWithPassword?: unknown } = {}) {
  return {
    auth: {
      signUp: overrides.signUp ?? vi.fn(),
      signInWithPassword: overrides.signInWithPassword ?? vi.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("authService.signUpWithEmail", () => {
  beforeEach(() => {
    mockedCreateClient.mockReset();
  });

  it("succeeds for a genuinely new signup (populated identities array)", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [{ id: "1" }] } },
      error: null,
    });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signUp }));

    await expect(
      authService.signUpWithEmail("new@milestoned.local", "password123", "https://x/callback")
    ).resolves.toBeUndefined();
  });

  it("throws 'account already exists' when Supabase returns its fake-success empty-identities response", async () => {
    // This is the real, empirically-verified shape Supabase returns for an
    // email that already belongs to a confirmed account — see the comment
    // in auth.service.ts. No `error` is set; the empty array is the only tell.
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [] } },
      error: null,
    });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signUp }));

    await expect(
      authService.signUpWithEmail("existing@milestoned.local", "password123", "https://x/callback")
    ).rejects.toMatchObject({ code: "account_exists", status: 400 });
  });

  it("still throws the real Supabase error when signUp itself errors", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "Password should be at least 6 characters." },
    });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signUp }));

    await expect(
      authService.signUpWithEmail("new@milestoned.local", "short", "https://x/callback")
    ).rejects.toMatchObject({ code: "signup_failed", status: 400 });
  });

  it("doesn't misfire on a still-unconfirmed retry — identities stays populated", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [{ id: "1" }] } },
      error: null,
    });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signUp }));

    await expect(
      authService.signUpWithEmail(
        "still-unconfirmed@milestoned.local",
        "password123",
        "https://x/callback"
      )
    ).resolves.toBeUndefined();
  });
});

describe("authService.signInWithPassword", () => {
  beforeEach(() => {
    mockedCreateClient.mockReset();
  });

  it("throws a 401 AppError with Supabase's own message on invalid credentials", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signInWithPassword }));

    await expect(
      authService.signInWithPassword("test@milestoned.local", "wrong-password")
    ).rejects.toMatchObject({ status: 401, message: "Invalid login credentials" });
  });

  it("resolves on success", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    mockedCreateClient.mockResolvedValue(fakeSupabaseClient({ signInWithPassword }));

    await expect(
      authService.signInWithPassword("test@milestoned.local", "correct-password")
    ).resolves.toBeUndefined();
  });
});
