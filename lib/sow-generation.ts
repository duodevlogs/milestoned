/*
 * Shared between client (Zustand store, live preview) and server (generation
 * service) — pure types + formatting, no secrets, no "server-only" import.
 *
 * Deliberately NOT GeneratedDocumentContent — a SOW is the detailed, working
 * document that governs the engagement once a proposal's been accepted:
 * itemized scope, a deliverables/acceptance-criteria table, a dated
 * milestone schedule, and cross-references back to the proposal/contract
 * that preceded it. It reuses ClauseSelection/buildClauseSections for the
 * legal-adjacent sections (confidentiality, IP, warranty, termination,
 * change orders) since those are identical fixed templates to Contract's —
 * no reason to duplicate them — but nothing else about the shape matches
 * GeneratedDocumentContent.
 */
import type { ClauseSelection } from "@/lib/contract-clauses";

export interface SowDeliverable {
  item: string;
  acceptanceCriteria: string;
}

export interface SowMilestone {
  label: string;
  pct: number;
  amount: number;
  targetDate: string | null;
}

export interface SowContent {
  docType: "sow";
  docTypeLabel: string;

  // Header
  docNumber: string;
  version: string;
  /** Snapshot of the linked Proposal/Contract's own docNumber, kept even if the link is later removed. */
  linkedProposalNumber: string | null;
  linkedContractNumber: string | null;

  // Parties — structured, not AI prose (unlike Contract's combined Parties & Purpose paragraph).
  businessName: string;
  businessAddress: string | null;
  clientName: string;
  clientCompany: string | null;

  projectName: string;

  // AI-drafted, from the consultant's own raw notes (see
  // GenerateSowInput's overviewNotes/scopeNotes).
  purpose: string;
  projectOverview: string;
  scopeOfWork: string;

  // Consultant-authored, deliberately not AI-paraphrased — precision matters here.
  outOfScope: string;
  deliverables: SowDeliverable[];
  clientResponsibilities: string;
  assumptions: string;

  // Timeline & milestones doubles as the payment schedule — one list, two
  // views in the rendered document (dates vs. amounts), rather than asking
  // the consultant to enter the same milestones twice.
  budget: number;
  milestones: SowMilestone[];

  // Legal-adjacent sections — fixed templates, never AI-drafted, reused
  // verbatim from Contract's clause engine.
  clauses: ClauseSelection;
  clauseSections: { title: string; body: string }[];

  /** Deterministic pointer back to the governing contract — not the same as the optional governingLaw jurisdiction clause. */
  governingTermsNote: string;

  generatedAt: string;
}

export function computeSowMilestones(
  milestones: { label: string; pct: number; targetDate: string }[],
  budget: number
): SowMilestone[] {
  return milestones.map((m) => ({
    label: m.label || "Untitled milestone",
    pct: m.pct,
    amount: Math.round((budget * m.pct) / 100),
    targetDate: m.targetDate || null,
  }));
}

export function buildGoverningTermsNote(linkedContractNumber: string | null): string {
  return linkedContractNumber
    ? `Legal terms not otherwise addressed in this Scope of Work — including liability, dispute resolution, and general terms — are governed by the terms of Contract ${linkedContractNumber} between the parties.`
    : "Legal terms not otherwise addressed in this Scope of Work are governed by the separate contract between the parties.";
}
