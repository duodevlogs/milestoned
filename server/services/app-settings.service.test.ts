import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appSettingsService } from "./app-settings.service";
import { appSettingsRepository } from "@/server/repositories/app-settings.repository";

vi.mock("@/server/repositories/app-settings.repository", () => ({
  appSettingsRepository: { isPrelaunch: vi.fn() },
}));

const isPrelaunch = vi.mocked(appSettingsRepository.isPrelaunch);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("appSettingsService.isPrelaunch", () => {
  beforeEach(() => {
    isPrelaunch.mockReset();
  });

  it("defers to the real launched_at flag when NODE_ENV is production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    isPrelaunch.mockResolvedValue(true);
    expect(await appSettingsService.isPrelaunch()).toBe(true);

    isPrelaunch.mockResolvedValue(false);
    expect(await appSettingsService.isPrelaunch()).toBe(false);
  });

  it("bypasses the gate outside production without ever touching the repository — `next dev`'s NODE_ENV", async () => {
    vi.stubEnv("NODE_ENV", "development");
    isPrelaunch.mockResolvedValue(true); // even if the real flag says pre-launch...
    expect(await appSettingsService.isPrelaunch()).toBe(false); // ...localhost still gets through
    expect(isPrelaunch).not.toHaveBeenCalled();
  });

  it("also bypasses under Vitest's own NODE_ENV ('test'), not just 'development'", async () => {
    vi.stubEnv("NODE_ENV", "test");
    isPrelaunch.mockResolvedValue(true);
    expect(await appSettingsService.isPrelaunch()).toBe(false);
  });
});

describe("appSettingsService.requireLaunched", () => {
  beforeEach(() => {
    isPrelaunch.mockReset();
    // Every test below is about the real gate, not the localhost bypass —
    // pin NODE_ENV to production so isPrelaunch() defers to the mock.
    vi.stubEnv("NODE_ENV", "production");
  });

  it("throws a 403 'prelaunch' AppError while pre-launch", async () => {
    isPrelaunch.mockResolvedValue(true);
    await expect(appSettingsService.requireLaunched()).rejects.toMatchObject({
      status: 403,
      code: "prelaunch",
    });
  });

  it("resolves without throwing once launched", async () => {
    isPrelaunch.mockResolvedValue(false);
    await expect(appSettingsService.requireLaunched()).resolves.toBeUndefined();
  });
});
