import "server-only";

import { documentSequenceRepository } from "@/server/repositories/document-sequence.repository";
import { DOC_TYPE_META } from "@/lib/document-display";
import type { DocType } from "@/lib/document-generation";

/** "Duo Dev Logs" → "DDL". Falls back to "DOC" when there's no business name yet. */
function deriveInitials(businessName: string | null | undefined): string {
  if (!businessName?.trim()) return "DOC";
  const initials = businessName
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return initials.slice(0, 4) || "DOC";
}

export const documentNumberService = {
  /** e.g. "DDL-INV-2026-014" — stable per user/type/year, never reused. */
  async generate(
    userId: string,
    docType: DocType,
    businessName: string | null | undefined
  ): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = await documentSequenceRepository.nextNumber(userId, docType, year);
    const initials = deriveInitials(businessName);
    const abbr = DOC_TYPE_META[docType].abbr;
    return `${initials}-${abbr}-${year}-${String(sequence).padStart(3, "0")}`;
  },
};
