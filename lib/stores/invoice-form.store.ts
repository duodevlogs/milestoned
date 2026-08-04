import { create } from "zustand";
import type { InvoiceContent, InvoiceCurrency } from "@/lib/invoice-generation";

export interface InvoiceLineItemInput {
  description: string;
  milestoneLabel: string;
  amount: string;
}

const DEFAULT_LINE_ITEM: InvoiceLineItemInput = { description: "", milestoneLabel: "", amount: "" };

const TOTAL_STEPS = 3; // Client & link, Billing & payment terms, Line items & review

interface InvoiceFormState {
  step: number;

  clientName: string;
  clientId: string | null;
  clientCompany: string;
  clientBillingAddress: string;
  projectName: string;
  relatedDocumentId: string | null;

  invoiceDate: string;
  dueDate: string;
  paymentTermsLabel: string;
  poNumber: string;
  currency: InvoiceCurrency;
  taxRatePct: string;

  lineItems: InvoiceLineItemInput[];
  milestoneCurrent: string;
  milestoneTotal: string;
  thankYouNote: string;

  generated: InvoiceContent | null;
  generatedDocumentId: string | null;

  setClientName: (value: string) => void;
  selectClient: (client: { id: string; name: string } | null) => void;
  setField: (
    field:
      | "clientCompany"
      | "clientBillingAddress"
      | "projectName"
      | "invoiceDate"
      | "dueDate"
      | "paymentTermsLabel"
      | "poNumber"
      | "taxRatePct"
      | "thankYouNote"
      | "milestoneCurrent"
      | "milestoneTotal",
    value: string
  ) => void;
  setCurrency: (currency: InvoiceCurrency) => void;
  selectRelatedDocument: (documentId: string | null) => void;
  addMilestoneAsLineItem: (milestone: {
    label: string;
    amount: number;
    index: number;
    total: number;
  }) => void;
  setLineItemDescription: (index: number, value: string) => void;
  setLineItemAmount: (index: number, value: string) => void;
  addLineItem: () => void;
  removeLineItem: (index: number) => void;
  goToStep: (step: number) => void;
  next: () => void;
  back: () => void;
  setGenerated: (content: InvoiceContent, documentId: string) => void;
}

export const useInvoiceFormStore = create<InvoiceFormState>((set) => ({
  step: 0,

  clientName: "",
  clientId: null,
  clientCompany: "",
  clientBillingAddress: "",
  projectName: "",
  relatedDocumentId: null,

  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentTermsLabel: "Net 14",
  poNumber: "",
  currency: "USD",
  taxRatePct: "0",

  lineItems: [{ ...DEFAULT_LINE_ITEM }],
  milestoneCurrent: "",
  milestoneTotal: "",
  thankYouNote: "",

  generated: null,
  generatedDocumentId: null,

  setClientName: (value) => set({ clientName: value, clientId: null, generated: null }),
  selectClient: (client) =>
    set({ clientId: client?.id ?? null, clientName: client?.name ?? "", generated: null }),
  setField: (field, value) => set({ [field]: value, generated: null }),
  setCurrency: (currency) => set({ currency, generated: null }),
  selectRelatedDocument: (documentId) => set({ relatedDocumentId: documentId, generated: null }),
  addMilestoneAsLineItem: ({ label, amount, index, total }) =>
    set((s) => {
      // A fresh, still-empty first row gets replaced rather than left dangling.
      const isBlankOnly =
        s.lineItems.length === 1 && !s.lineItems[0].description && !s.lineItems[0].amount;
      const milestoneLabel = `Milestone ${index} of ${total} — ${label}`;
      const newItem: InvoiceLineItemInput = {
        description: label,
        milestoneLabel,
        amount: String(amount),
      };
      return {
        lineItems: isBlankOnly ? [newItem] : [...s.lineItems, newItem],
        milestoneCurrent: String(index),
        milestoneTotal: String(total),
        generated: null,
      };
    }),
  setLineItemDescription: (index, value) =>
    set((s) => ({
      lineItems: s.lineItems.map((item, i) => (i === index ? { ...item, description: value } : item)),
      generated: null,
    })),
  setLineItemAmount: (index, value) =>
    set((s) => ({
      lineItems: s.lineItems.map((item, i) => (i === index ? { ...item, amount: value } : item)),
      generated: null,
    })),
  addLineItem: () =>
    set((s) => ({ lineItems: [...s.lineItems, { ...DEFAULT_LINE_ITEM }], generated: null })),
  removeLineItem: (index) =>
    set((s) => ({ lineItems: s.lineItems.filter((_, i) => i !== index), generated: null })),
  goToStep: (step) => set({ step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
  next: () => set((s) => ({ step: Math.min(TOTAL_STEPS - 1, s.step + 1) })),
  back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setGenerated: (content, documentId) => set({ generated: content, generatedDocumentId: documentId }),
}));
