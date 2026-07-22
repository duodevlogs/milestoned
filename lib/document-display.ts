import type { Document, DocumentStatus } from "@/server/db/schema";

/*
 * Class names here are complete literal strings (even though referenced via
 * object lookup) so Tailwind's static scanner picks them up — never build a
 * Tailwind class name at runtime via string concatenation/replace, it won't
 * be generated.
 */
export const DOC_TYPE_META: Record<
  Document["docType"],
  { abbr: string; label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  sow: {
    abbr: "SOW",
    label: "Scope of Work",
    textClass: "text-sow",
    bgClass: "bg-sow-soft",
    borderClass: "border-sow-soft",
  },
  contract: {
    abbr: "CTR",
    label: "Contract",
    textClass: "text-gold",
    bgClass: "bg-gold-soft",
    borderClass: "border-gold-soft",
  },
  proposal: {
    abbr: "PRO",
    label: "Proposal",
    textClass: "text-pro",
    bgClass: "bg-pro-soft",
    borderClass: "border-pro-soft",
  },
  invoice: {
    abbr: "INV",
    label: "Invoice",
    textClass: "text-inv",
    bgClass: "bg-inv-soft",
    borderClass: "border-inv-soft",
  },
};

export const DOC_STATUS_META: Record<
  DocumentStatus,
  { label: string; textClass: string; bgClass: string; dotClass: string }
> = {
  draft: {
    label: "Draft",
    textClass: "text-status-draft",
    bgClass: "bg-status-draft-bg",
    dotClass: "bg-status-draft",
  },
  sent: {
    label: "Sent",
    textClass: "text-status-sent",
    bgClass: "bg-status-sent-bg",
    dotClass: "bg-status-sent",
  },
  signed: {
    label: "Signed",
    textClass: "text-status-signed",
    bgClass: "bg-status-signed-bg",
    dotClass: "bg-status-signed",
  },
  paid: {
    label: "Paid",
    textClass: "text-gold",
    bgClass: "bg-gold-soft",
    dotClass: "bg-gold",
  },
};

export const ALL_DOCUMENT_STATUSES: DocumentStatus[] = ["draft", "sent", "signed", "paid"];

export function formatDocDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
