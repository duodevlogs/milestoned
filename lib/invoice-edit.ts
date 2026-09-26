import { INVOICE_LATE_FEE_NOTE, type InvoiceContent } from "@/lib/invoice-generation";
import { DEFAULT_TAX_EXEMPTION_NOTE } from "@/lib/tax-rates";
import type { InvoiceFormValues } from "@/lib/stores/invoice-form.store";

/**
 * Loads a generated invoice back into the wizard. Each optional checkbox is
 * ticked exactly when that element is on the saved invoice, so saving
 * without touching it reproduces the same document.
 */
export function invoiceToFormValues(
  content: InvoiceContent,
  row: { clientId: string | null; relatedDocumentId: string | null }
): InvoiceFormValues {
  // undefined = generated before the late-fee note was optional, when the
  // standard line was always printed — keep it ticked so an edit doesn't
  // silently drop it (the user can untick it).
  const lateFee = content.lateFeeNote === undefined ? INVOICE_LATE_FEE_NOTE : content.lateFeeNote;

  return {
    clientName: content.clientName,
    clientId: row.clientId,
    clientCompany: content.clientCompany ?? "",
    clientBillingAddress: content.clientBillingAddress ?? "",
    projectName: content.projectName,
    relatedDocumentId: row.relatedDocumentId,
    invoiceDate: content.invoiceDate,
    dueDate: content.dueDate ?? "",
    paymentTermsLabel: content.paymentTermsLabel,
    poNumber: content.poNumber ?? "",
    currency: content.currency,
    taxRatePct: String(content.taxRatePct),
    taxNote: content.taxExemptionNote || DEFAULT_TAX_EXEMPTION_NOTE,
    lateFeeNote: lateFee || INVOICE_LATE_FEE_NOTE,
    serviceDate: content.serviceDate ?? "",
    clientTaxId: content.clientTaxId ?? "",
    discountAmount: content.discountAmount ? String(content.discountAmount) : "",
    enabled: {
      tax: content.taxRatePct > 0,
      taxNote: Boolean(content.taxExemptionNote),
      lateFee: Boolean(lateFee),
      serviceDate: Boolean(content.serviceDate),
      clientTaxId: Boolean(content.clientTaxId),
      poNumber: Boolean(content.poNumber),
      discount: Boolean(content.discountAmount),
      milestoneProgress: Boolean(content.milestoneProgress),
      thankYou: Boolean(content.thankYouNote),
      additionalDetails: Boolean(content.additionalDetails),
    },
    lineItems: content.lineItems.map((item) => ({
      description: item.description,
      milestoneLabel: item.milestoneLabel ?? "",
      amount: String(item.amount),
    })),
    milestoneCurrent: content.milestoneProgress ? String(content.milestoneProgress.current) : "",
    milestoneTotal: content.milestoneProgress ? String(content.milestoneProgress.total) : "",
    thankYouNote: content.thankYouNote ?? "",
    additionalDetails: content.additionalDetails ?? "",
  };
}
