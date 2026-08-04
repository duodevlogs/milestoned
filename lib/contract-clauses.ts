import type { DocType } from "@/lib/document-generation";

/*
 * Deterministic, fixed clause templates — NOT AI-generated. The model never
 * drafts legal substance; it only writes the Parties & Purpose / Scope of
 * Work paragraphs, which are inherently project-specific. Everything here
 * is reviewed, reusable boilerplate the user opts into per clause, so the
 * wording is identical and predictable every time it's included.
 *
 * This is deliberately NOT jurisdiction-specific — no clause here asserts
 * anything about German, US, or any other country's law. The one place a
 * jurisdiction is named (Governing Law) is filled in by the user themselves
 * (see governingLawJurisdiction below), never synthesized by the model.
 */

export interface ClauseSelection {
  ip: boolean;
  confidentiality: boolean;
  liability: boolean;
  termination: boolean;
  terminationNoticeDays: string;
  latePayment: boolean;
  latePaymentGraceDays: string;
  latePaymentFeePct: string;
  warranty: boolean;
  revisions: boolean;
  governingLaw: boolean;
  governingLawJurisdiction: string;
  customClause: boolean;
  customClauseTitle: string;
  customClauseText: string;
}

export function defaultClauseSelection(docType: DocType): ClauseSelection {
  const base: ClauseSelection = {
    ip: false,
    confidentiality: false,
    liability: false,
    termination: false,
    terminationNoticeDays: "14",
    latePayment: false,
    latePaymentGraceDays: "14",
    latePaymentFeePct: "1.5",
    warranty: false,
    revisions: false,
    governingLaw: false,
    governingLawJurisdiction: "",
    customClause: false,
    customClauseTitle: "",
    customClauseText: "",
  };

  // Sensible starting points per document type — all visible and
  // uncheckable before generating, nothing is included silently.
  if (docType === "contract") {
    return {
      ...base,
      ip: true,
      confidentiality: true,
      liability: true,
      termination: true,
      latePayment: true,
      warranty: true,
      revisions: true,
      governingLaw: true,
    };
  }
  if (docType === "sow") {
    return { ...base, revisions: true };
  }
  if (docType === "invoice") {
    return { ...base, latePayment: true };
  }
  return base; // proposal
}

export interface ClauseFieldMeta {
  id: keyof ClauseSelection;
  label: string;
  description: string;
  inputs?: {
    key: keyof ClauseSelection;
    label: string;
    placeholder: string;
    suffix?: string;
  }[];
}

export const CLAUSE_FIELDS: ClauseFieldMeta[] = [
  {
    id: "ip",
    label: "Intellectual property assignment",
    description: "Deliverables transfer to the client on payment; the consultant keeps their own tools and know-how.",
  },
  {
    id: "confidentiality",
    label: "Confidentiality",
    description: "Both parties keep shared business and technical information private.",
  },
  {
    id: "liability",
    label: "Limitation of liability",
    description: "Caps liability at fees paid; excludes indirect and consequential damages.",
  },
  {
    id: "termination",
    label: "Termination",
    description: "Either party can end the engagement with notice; completed work is paid for.",
    inputs: [
      { key: "terminationNoticeDays", label: "Notice period", placeholder: "14", suffix: "days" },
    ],
  },
  {
    id: "latePayment",
    label: "Late payment fee",
    description: "A fee applies only if a milestone payment becomes overdue — the milestone plan itself stays interest-free.",
    inputs: [
      { key: "latePaymentGraceDays", label: "Grace period", placeholder: "14", suffix: "days" },
      { key: "latePaymentFeePct", label: "Late fee", placeholder: "1.5", suffix: "% / month" },
    ],
  },
  {
    id: "warranty",
    label: "Warranty disclaimer",
    description: "Work meets professional standards; no further warranty is implied.",
  },
  {
    id: "revisions",
    label: "Revisions & change requests",
    description: "Work beyond the agreed scope is quoted separately and confirmed in writing.",
  },
  {
    id: "governingLaw",
    label: "Governing law & jurisdiction",
    description: "You choose the jurisdiction — never AI-generated. Pick the law that governs this agreement.",
    inputs: [
      { key: "governingLawJurisdiction", label: "Jurisdiction", placeholder: "e.g. Germany, or State of Delaware, USA" },
    ],
  },
];

function ipBody(): string {
  return "Upon receipt of full payment for the applicable milestone, all custom deliverables created specifically for this project transfer to the Client. The Consultant retains ownership of pre-existing tools, frameworks, libraries, and general know-how used to build the deliverables, and grants the Client a perpetual license to use them as part of the delivered work.";
}

function confidentialityBody(): string {
  return "Each party agrees to keep confidential any non-public business, technical, or financial information disclosed by the other party in connection with this project, and to use it only for the purposes of this engagement. This obligation survives the completion or termination of this Agreement.";
}

function liabilityBody(): string {
  return "Neither party's total liability under this Agreement will exceed the total fees paid or payable under this Agreement. Neither party is liable for indirect, incidental, or consequential damages, including lost profits or lost data, arising from this engagement.";
}

function terminationBody(noticeDays: string): string {
  const days = noticeDays.trim() || "14";
  return `Either party may terminate this Agreement with ${days} days' written notice. The Client will pay for all work completed and accepted up to the termination date, including the milestone in progress, prorated based on the work completed.`;
}

function latePaymentBody(graceDays: string, feePct: string): string {
  const grace = graceDays.trim() || "14";
  const fee = feePct.trim() || "1.5";
  return `Milestone payments are due within ${grace} days of invoicing. Payments received after this period may incur a late fee of ${fee}% per month on the outstanding balance. This does not affect the interest-free structure of the milestone schedule itself — it applies only to payments that become overdue.`;
}

function warrantyBody(): string {
  return "Services are provided in accordance with generally accepted industry standards. Except as expressly stated in this Agreement, the Consultant makes no other warranties, express or implied, including any warranty of merchantability or fitness for a particular purpose.";
}

function revisionsBody(): string {
  return "The scope above reflects the agreed work at the time of signing. Any request that adds features, pages, or work beyond this scope will be treated as a change request, quoted separately, and confirmed in writing before work begins.";
}

function governingLawBody(jurisdiction: string): string {
  return `This Agreement is governed by the laws of ${jurisdiction}, without regard to its conflict-of-law principles. Both parties agree that any dispute arising from this Agreement will be resolved in the courts of ${jurisdiction}.`;
}

export const ACCEPTANCE_CLAUSE = {
  title: "Acceptance",
  body: "By signing below, both parties agree to the scope, schedule, and milestone-based payment terms set out in this document. This agreement takes effect on the date of the last signature.",
};

export const LEGAL_DISCLAIMER =
  "This document is a drafting aid, not legal advice. It has not been reviewed by a licensed attorney. For cross-border engagements or higher-value contracts, have it reviewed by a qualified lawyer before signing.";

/** Short labels for the opted-in clauses — used to display a clause bundle without rendering full section text. */
export function summarizeClauseSelection(selection: ClauseSelection): string[] {
  const labels = CLAUSE_FIELDS.filter((field) => selection[field.id]).map((field) => field.label);
  if (selection.customClause && selection.customClauseText.trim()) {
    labels.push(selection.customClauseTitle.trim() || "Additional Terms");
  }
  return labels;
}

/** Builds the ordered list of opted-in clause sections. Fully deterministic — no AI call. */
export function buildClauseSections(selection: ClauseSelection): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];

  if (selection.ip) sections.push({ title: "Intellectual Property", body: ipBody() });
  if (selection.confidentiality)
    sections.push({ title: "Confidentiality", body: confidentialityBody() });
  if (selection.liability) sections.push({ title: "Limitation of Liability", body: liabilityBody() });
  if (selection.termination)
    sections.push({ title: "Termination", body: terminationBody(selection.terminationNoticeDays) });
  if (selection.latePayment)
    sections.push({
      title: "Late Payment",
      body: latePaymentBody(selection.latePaymentGraceDays, selection.latePaymentFeePct),
    });
  if (selection.warranty) sections.push({ title: "Warranty Disclaimer", body: warrantyBody() });
  if (selection.revisions) sections.push({ title: "Revisions & Change Requests", body: revisionsBody() });
  if (selection.governingLaw && selection.governingLawJurisdiction.trim())
    sections.push({
      title: "Governing Law & Jurisdiction",
      body: governingLawBody(selection.governingLawJurisdiction.trim()),
    });
  if (selection.customClause && selection.customClauseText.trim())
    sections.push({
      title: selection.customClauseTitle.trim() || "Additional Terms",
      body: selection.customClauseText.trim(),
    });

  return sections;
}
