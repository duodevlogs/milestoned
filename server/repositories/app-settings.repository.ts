import "server-only";

import { getDb } from "@/server/db";
import { appSettings } from "@/server/db/schema";

export const appSettingsRepository = {
  /** True until the founder flips app_settings.launched_at at actual launch. */
  async isPrelaunch(): Promise<boolean> {
    const db = getDb();
    const rows = await db.select().from(appSettings).limit(1);
    return (rows[0]?.launchedAt ?? null) === null;
  },
};
