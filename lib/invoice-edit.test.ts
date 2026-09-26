import { describe, it, expect } from "vitest";
import { invoiceToFormValues } from "./invoice-edit";
import { INVOICE_LATE_FEE_NOTE, type InvoiceContent } from "./invoice-generation";

function content(overrides: Partial<InvoiceContent> = {}): InvoiceContent {
  return {
    docType: "invoice",
    docTypeLabel: "Invoice",
    docNumber: "DDL-INV-2026-001",
    invoiceDate: "2026-09-26",
    dueDate: null,
    paymentTermsLabel: "Net 14",
    relatedDocNumber: null,
    businessName: "Duo Dev Logs",
    businessAddress: null,
    taxId: null,
    companyRegistration: null,
    clientName: "Acme",
    clientCompany: null,
    clientBillingAddress: null,
    projectName: "Website",
    lineItems: [{ description: "Milestone 1", milestoneLabel: null, amount: 150 }],
    milestoneProgress: null,
    subtotal: 150,
    taxRatePct: 0,
    taxAmount: 0,
    total: 150,
    currency: "EUR",
    paymentInstructions: null,
    poNumber: null,
    thankYouNote: null,
    generatedAt: "2026-09-26T00:00:00.000Z",
    ...overrides,
  };
}

const ROW = { clientId: "client-1", relatedDocumentId: null };

describe("invoiceToFormValues", () => {
  it("carries the saved fields over as wizard strings", () => {
    const v = invoiceToFormValues(content(), ROW);
    expect(v.clientName).toBe("Acme");
    expect(v.clientId).toBe("client-1");
    expect(v.currency).toBe("EUR");
    expect(v.lineItems).toEqual([{ description: "Milestone 1", milestoneLabel: "", amount: "150" }]);
  });

  it("leaves every optional checkbox unticked for a bare invoice", () => {
    const v = invoiceToFormValues(content({ lateFeeNote: null }), ROW);
    expect(Object.values(v.enabled).some(Boolean)).toBe(false);
  });

  it("ticks exactly the optional elements that are on the saved invoice", () => {
    const v = invoiceToFormValues(
      content({
        taxRatePct: 19,
        taxExemptionNote: "note",
        lateFeeNote: "late",
        serviceDate: "Sep 2026",
        clientTaxId: "HK1",
        poNumber: "PO-1",
        discountAmount: 20,
        milestoneProgress: { current: 2, total: 4 },
        thankYouNote: "thanks",
        additionalDetails: "bank",
      }),
      ROW
    );
    expect(Object.values(v.enabled).every(Boolean)).toBe(true);
    expect(v.milestoneCurrent).toBe("2");
    expect(v.discountAmount).toBe("20");
  });

  it("keeps the late-fee line ticked for an invoice from before it was optional", () => {
    const v = invoiceToFormValues(content(), ROW); // lateFeeNote undefined
    expect(v.enabled.lateFee).toBe(true);
    expect(v.lateFeeNote).toBe(INVOICE_LATE_FEE_NOTE);
  });
});
