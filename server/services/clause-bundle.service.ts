import "server-only";

import { clauseBundleRepository } from "@/server/repositories/clause-bundle.repository";
import { AppError } from "@/server/errors";
import type { ClauseBundle } from "@/server/db/schema";
import type { ClauseSelection } from "@/lib/contract-clauses";

export const clauseBundleService = {
  async listForUser(userId: string): Promise<ClauseBundle[]> {
    return clauseBundleRepository.listByUserId(userId);
  },

  async create(userId: string, name: string, clauses: ClauseSelection): Promise<ClauseBundle> {
    return clauseBundleRepository.create({ userId, name, clauseSelection: clauses });
  },

  async getForUser(userId: string, id: string): Promise<ClauseBundle> {
    const bundle = await clauseBundleRepository.getByIdForUser(id, userId);
    if (!bundle) {
      throw AppError.notFound("Clause bundle not found.", "clause_bundle_not_found");
    }
    return bundle;
  },

  async deleteForUser(userId: string, id: string): Promise<void> {
    const deleted = await clauseBundleRepository.deleteForUser(id, userId);
    if (!deleted) {
      throw AppError.notFound("Clause bundle not found.", "clause_bundle_not_found");
    }
  },
};
