/*
 * Shared between client (Zustand store, live preview) and server (generation
 * service) — pure types + formatting, no secrets, no "server-only" import.
 */
import type { ClauseSelection } from "@/lib/contract-clauses";

export type DocType = "sow" | "contract" | "proposal" | "invoice";

export interface MilestoneAmount {
  label: string;
  pct: number;
  amount: number;
}

export interface GeneratedDocumentContent {
  docType: DocType;
  docTypeLabel: string;
  clientName: string;
  projectName: string;
  budget: number;
  scope: string;
  deliverables: string;
  startDate: string | null;
  deliveryDate: string | null;
  milestones: MilestoneAmount[];
  /**
   * Plain titles, no leading "1 · " numbering — the clause count varies per
   * document (user-selected clauses), so numbering is computed at render
   * time (index + 1), not baked into the stored title strings.
   */
  sections: { title: string; body: string }[];
  /**
   * The clause selection used to generate `sections` (checkboxes + typed
   * inputs) — kept alongside the rendered {title,body} text so a document
   * can be cloned into a template with its original selection intact, not
   * just its rendered prose. Optional since documents generated before this
   * field existed won't have it.
   */
  clauses?: ClauseSelection;
  generatedAt: string;
}

export function computeMilestoneAmounts(
  milestones: { label: string; pct: number }[],
  budget: number
): MilestoneAmount[] {
  return milestones.map((m) => ({
    label: m.label || "Untitled milestone",
    pct: m.pct,
    amount: Math.round((budget * m.pct) / 100),
  }));
}

export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatDateLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTimelineLabel(
  startDate: string | null | undefined,
  deliveryDate: string | null | undefined
): string {
  const start = formatDateLabel(startDate);
  const delivery = formatDateLabel(deliveryDate);
  if (start && delivery) return `${start} → ${delivery}`;
  if (delivery) return `By ${delivery}`;
  if (start) return `From ${start}`;
  return "To be set";
}
