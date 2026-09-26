import { create } from "zustand";
import { INVOICE_LATE_FEE_NOTE, type InvoiceContent, type InvoiceCurrency } from "@/lib/invoice-generation";
import { DEFAULT_TAX_EXEMPTION_NOTE } from "@/lib/tax-rates";

/*
 * Everything that isn't on every invoice is behind a checkbox, off by
 * default — nothing uncommon appears on an invoice unless it's ticked.
 * Unticked fields are simply not sent, whatever text they hold.
 */
export type OptionalKey =
  | "tax"
  | "taxNote"
  | "lateFee"
  | "serviceDate"
  | "clientTaxId"
  | "poNumber"
  | "discount"
  | "milestoneProgress"
  | "thankYou"
  | "additionalDetails"
  | "customPayment";

const NO_OPTIONALS: Record<OptionalKey, boolean> = {
  tax: false,
  taxNote: false,
  lateFee: false,
  serviceDate: false,
  clientTaxId: false,
  poNumber: false,
  discount: false,
  milestoneProgress: false,
  thankYou: false,
  additionalDetails: false,
  customPayment: false,
};

export interface InvoiceLineItemInput {
  description: string;
  milestoneLabel: string;
  amount: string;
}

const DEFAULT_LINE_ITEM: InvoiceLineItemInput = { description: "", milestoneLabel: "", amount: "" };

const TOTAL_STEPS = 3; // Client & link, Billing & payment terms, Line items & review

/** Every user-editable field of the wizard — what an existing invoice is loaded into when editing. */
export interface InvoiceFormValues {
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
  taxNote: string;
  lateFeeNote: string;
  serviceDate: string;
  clientTaxId: string;
  discountAmount: string;
  enabled: Record<OptionalKey, boolean>;
  /** Ids of the saved payment methods ticked for this invoice. */
  paymentMethodIds: string[];
  customPaymentDetails: string;
  lineItems: InvoiceLineItemInput[];
  milestoneCurrent: string;
  milestoneTotal: string;
  thankYouNote: string;
  additionalDetails: string;
}

function freshInvoiceValues(): InvoiceFormValues {
  return {
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
    taxNote: DEFAULT_TAX_EXEMPTION_NOTE,
    lateFeeNote: INVOICE_LATE_FEE_NOTE,
    serviceDate: "",
    clientTaxId: "",
    discountAmount: "",
    enabled: { ...NO_OPTIONALS },
    paymentMethodIds: [],
    customPaymentDetails: "",
    lineItems: [{ ...DEFAULT_LINE_ITEM }],
    milestoneCurrent: "",
    milestoneTotal: "",
    thankYouNote: "",
    additionalDetails: "",
  };
}

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
  taxNote: string;
  lateFeeNote: string;
  serviceDate: string;
  clientTaxId: string;
  discountAmount: string;
  enabled: Record<OptionalKey, boolean>;
  paymentMethodIds: string[];
  customPaymentDetails: string;

  lineItems: InvoiceLineItemInput[];
  milestoneCurrent: string;
  milestoneTotal: string;
  thankYouNote: string;
  additionalDetails: string;

  generated: InvoiceContent | null;
  generatedDocumentId: string | null;
  /** Set while editing an already-generated invoice — saving updates that document instead of creating one. */
  editingDocumentId: string | null;

  hydrateForEdit: (values: InvoiceFormValues, documentId: string) => void;
  resetForNew: () => void;
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
      | "additionalDetails"
      | "customPaymentDetails"
      | "taxNote"
      | "lateFeeNote"
      | "serviceDate"
      | "clientTaxId"
      | "discountAmount"
      | "milestoneCurrent"
      | "milestoneTotal",
    value: string
  ) => void;
  setCurrency: (currency: InvoiceCurrency) => void;
  toggleOptional: (key: OptionalKey) => void;
  togglePaymentMethod: (id: string) => void;
  setPaymentMethodIds: (ids: string[]) => void;
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

  ...freshInvoiceValues(),

  generated: null,
  generatedDocumentId: null,
  editingDocumentId: null,

  hydrateForEdit: (values, documentId) =>
    set({ ...values, editingDocumentId: documentId, step: 0, generated: null, generatedDocumentId: null }),
  resetForNew: () =>
    set({ ...freshInvoiceValues(), editingDocumentId: null, step: 0, generated: null, generatedDocumentId: null }),
  setClientName: (value) => set({ clientName: value, clientId: null, generated: null }),
  selectClient: (client) =>
    set({ clientId: client?.id ?? null, clientName: client?.name ?? "", generated: null }),
  setField: (field, value) => set({ [field]: value, generated: null }),
  setCurrency: (currency) => set({ currency, generated: null }),
  togglePaymentMethod: (id) =>
    set((s) => ({
      paymentMethodIds: s.paymentMethodIds.includes(id)
        ? s.paymentMethodIds.filter((x) => x !== id)
        : [...s.paymentMethodIds, id],
      generated: null,
    })),
  setPaymentMethodIds: (ids) => set({ paymentMethodIds: ids, generated: null }),
  toggleOptional: (key) =>
    set((s) => ({ enabled: { ...s.enabled, [key]: !s.enabled[key] }, generated: null })),
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
        // Picking a milestone from a linked SOW/Contract is an explicit ask for the progress line.
        enabled: { ...s.enabled, milestoneProgress: true },
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
