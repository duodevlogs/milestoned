import { describe, it, expect, vi, beforeEach } from "vitest";
import { appSettingsService } from "./app-settings.service";
import { appSettingsRepository } from "@/server/repositories/app-settings.repository";

vi.mock("@/server/repositories/app-settings.repository", () => ({
  appSettingsRepository: { isPrelaunch: vi.fn() },
}));

const isPrelaunch = vi.mocked(appSettingsRepository.isPrelaunch);

describe("appSettingsService.requireLaunched", () => {
  beforeEach(() => {
    isPrelaunch.mockReset();
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
