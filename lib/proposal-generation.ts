/*
 * Shared between client (Zustand store, live preview) and server (generation
 * service) — pure types + formatting, no secrets, no "server-only" import.
 *
 * Deliberately NOT GeneratedDocumentContent — a proposal is a sales document
 * sent before any agreement exists (cover block, persuasive prose, an
 * investment summary, no clauses), not a Parties & Purpose / Scope of Work /
 * clauses agreement. It shares MilestoneAmount/computeMilestoneAmounts with
 * that shape (same milestone-pricing model) but nothing else.
 */
import type { MilestoneAmount } from "@/lib/document-generation";

export interface ProposalAddOn {
  label: string;
  amount: number;
}

export interface ProposalContent {
  docType: "proposal";
  docTypeLabel: string;

  // Cover block
  docNumber: string;
  dateIssued: string; // ISO date
  validityDays: number;
  validUntil: string; // ISO date, dateIssued + validityDays

  // The consultant's own details, live from their profile at generation time.
  businessName: string;
  businessAddress: string | null;

  // Prepared for
  clientName: string;
  clientCompany: string | null;

  projectName: string;

  // AI-drafted prose, from the consultant's own raw notes (see
  // GenerateProposalInput's problemNotes/approachNotes/whyUsNotes).
  executiveSummary: string;
  understandingClientNeeds: string;
  proposedApproach: string;
  whyUs: string;

  // Consultant-authored, high-level (not itemized) — the SOW covers detail.
  scopeOverview: string;
  timelineOverview: string;

  // Investment summary
  budget: number;
  milestones: MilestoneAmount[];
  addOns: ProposalAddOn[];
  /** Always "Milestone-based" in this app's model — not user-editable. */
  paymentTermsLabel: string;

  assumptionsExclusions: string;
  /** Falls back to a sensible default when the consultant leaves it blank. */
  nextSteps: string;

  /** "Optional acceptance signature — informal, not a binding contract" per spec. */
  includeAcceptanceSignature: boolean;

  generatedAt: string;
}

export const DEFAULT_PROPOSAL_VALIDITY_DAYS = 30;

export const DEFAULT_PROPOSAL_NEXT_STEPS =
  "Reply to this proposal or reach out directly to move forward. Once confirmed, a contract and scope of work will follow, and work begins on the schedule outlined above.";

export function addDays(iso: string, days: number): string {
  // Parsed and mutated in UTC throughout — mixing local-time parsing
  // ("T00:00:00") with a UTC toISOString() output shifts the date by a day
  // in timezones behind UTC.
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeAddOnsTotal(addOns: { amount: number }[]): number {
  return addOns.reduce((sum, a) => sum + a.amount, 0);
}

/**
 * Pre-fill payloads for the "Draft Contract/SOW from this Proposal" action
 * on an accepted (status "signed") proposal — see DocumentView.tsx and
 * app/generate/page.tsx / app/generate/sow/page.tsx. clientId isn't part of
 * ProposalContent (it lives on the documents row, not the JSONB content),
 * so callers pass it in separately.
 */
export interface ContractDraftFromProposal {
  clientName: string;
  clientId: string | null;
  projectName: string;
  budget: number;
  scope: string;
  milestones: { label: string; pct: number }[];
}

export function toContractDraft(
  content: ProposalContent,
  clientId: string | null
): ContractDraftFromProposal {
  return {
    clientName: content.clientName,
    clientId,
    projectName: content.projectName,
    budget: content.budget,
    scope: [content.scopeOverview, content.proposedApproach].filter((s) => s.trim()).join("\n\n"),
    milestones: content.milestones.map((m) => ({ label: m.label, pct: m.pct })),
  };
}

export interface SowDraftFromProposal {
  clientName: string;
  clientId: string | null;
  clientCompany: string | null;
  projectName: string;
  relatedProposalId: string;
  overviewNotes: string;
  scopeNotes: string;
  budget: number;
  milestones: { label: string; pct: number }[];
}

export function toSowDraft(
  content: ProposalContent,
  clientId: string | null,
  proposalDocumentId: string
): SowDraftFromProposal {
  return {
    clientName: content.clientName,
    clientId,
    clientCompany: content.clientCompany,
    projectName: content.projectName,
    relatedProposalId: proposalDocumentId,
    overviewNotes: [content.executiveSummary, content.understandingClientNeeds]
      .filter((s) => s.trim())
      .join("\n\n"),
    scopeNotes: [content.scopeOverview, content.proposedApproach]
      .filter((s) => s.trim())
      .join("\n\n"),
    budget: content.budget,
    milestones: content.milestones.map((m) => ({ label: m.label, pct: m.pct })),
  };
}
