/*
 * Shared between client (Zustand store, live preview) and server (generation
 * service) — pure types + formatting, no secrets, no "server-only" import.
 *
 * Deliberately NOT GeneratedDocumentContent — an invoice isn't a Parties &
 * Purpose / Scope of Work / clauses document, it's identification + parties
 * + a charge + payment terms. Forcing it into the contract-shaped type is
 * exactly the bug this rebuild is fixing.
 */

export type InvoiceCurrency = "USD" | "EUR" | "GBP";

export interface InvoiceLineItem {
  description: string;
  /** e.g. "Milestone 2 of 4 — Design sign-off", set when this line item was picked from a linked SOW/Contract's payment schedule. */
  milestoneLabel: string | null;
  amount: number;
}

export interface InvoiceContent {
  docType: "invoice";
  docTypeLabel: string;

  // Identification
  docNumber: string;
  invoiceDate: string; // ISO date
  dueDate: string | null;
  paymentTermsLabel: string; // e.g. "Net 14", or free text
  /** Snapshot of the linked SOW/Contract's own docNumber, kept even if the link is later removed. */
  relatedDocNumber: string | null;

  // The consultant's own details, live from their profile at generation time.
  businessName: string;
  businessAddress: string | null;
  taxId: string | null;
  companyRegistration: string | null;

  // The client being billed.
  clientName: string;
  clientCompany: string | null;
  clientBillingAddress: string | null;

  projectName: string;

  // The charge itself.
  lineItems: InvoiceLineItem[];
  /** "Milestone 2 of 4" progress against the whole engagement — null when this invoice isn't tied to a milestone plan. */
  milestoneProgress: { current: number; total: number } | null;
  subtotal: number;
  taxRatePct: number;
  taxAmount: number;
  total: number;
  currency: InvoiceCurrency;
  /** Set instead of a VAT line when the account is small-business exempt. Absent on invoices generated before this existed. */
  taxExemptionNote?: string | null;

  // Payment terms.
  paymentInstructions: string | null;
  poNumber: string | null;
  thankYouNote: string | null;
  /** Free multi-line block printed as its own section — e.g. the client's remittance/bank details or transfer-fee terms. */
  additionalDetails?: string | null;

  generatedAt: string;
}

export function computeInvoiceTotals(
  lineItems: { amount: number }[],
  taxRatePct: number
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round((subtotal * taxRatePct) / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

/** Standard, non-optional on every invoice — scopes the late fee to genuinely overdue payments only. */
export const INVOICE_LATE_FEE_NOTE =
  "A flat delay administration fee may apply only if payment is more than 30 days past due. No fee applies to payments made on time.";

const CURRENCY_SYMBOLS: Record<InvoiceCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatInvoiceAmount(n: number, currency: InvoiceCurrency): string {
  if (!Number.isFinite(n)) return `${CURRENCY_SYMBOLS[currency]}0`;
  return `${CURRENCY_SYMBOLS[currency]}${Math.round(n).toLocaleString("en-US")}`;
}

export function formatInvoiceDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
