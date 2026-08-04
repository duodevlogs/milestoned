import "server-only";

import { z } from "zod";
import { clauseBundleService } from "@/server/services/clause-bundle.service";
import { createClauseBundleSchema } from "@/server/validation/clause-bundle.schema";
import type { ClauseBundle } from "@/server/db/schema";

const bundleIdSchema = z.uuid({ message: "Invalid clause bundle id." });

export const clauseBundleController = {
  async listForUser(userId: string): Promise<ClauseBundle[]> {
    return clauseBundleService.listForUser(userId);
  },

  async create(userId: string, raw: unknown): Promise<ClauseBundle> {
    const input = createClauseBundleSchema.parse(raw);
    return clauseBundleService.create(userId, input.name, input.clauses);
  },

  async getForUser(userId: string, rawId: unknown): Promise<ClauseBundle> {
    const id = bundleIdSchema.parse(rawId);
    return clauseBundleService.getForUser(userId, id);
  },

  async deleteForUser(userId: string, rawId: unknown): Promise<void> {
    const id = bundleIdSchema.parse(rawId);
    await clauseBundleService.deleteForUser(userId, id);
  },
};
