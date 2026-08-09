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
