import { z } from "zod";

export const invoiceLineItemInputSchema = z.object({
  description: z.string().trim().min(1, "Every line item needs a description."),
  milestoneLabel: z.string().trim().optional(),
  amount: z.number().positive("Amount must be greater than 0."),
});

export const generateInvoiceSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required."),
  // Optional link to a saved client — set when picked from the client list, null when typed free-hand.
  clientId: z.uuid().optional().nullable(),
  clientCompany: z.string().trim().optional(),
  clientBillingAddress: z.string().trim().optional(),
  projectName: z.string().trim().min(1, "Project name is required."),
  // Optional link to the SOW/Contract this invoice bills against — must belong to the caller (verified in the service).
  relatedDocumentId: z.uuid().optional().nullable(),
  invoiceDate: z.string().trim().min(1, "Invoice date is required."),
  dueDate: z.string().trim().optional(),
  paymentTermsLabel: z.string().trim().min(1, "Payment terms are required."),
  lineItems: z.array(invoiceLineItemInputSchema).min(1, "At least one line item is required."),
  milestoneProgress: z
    .object({ current: z.number().int().min(1), total: z.number().int().min(1) })
    .optional()
    .nullable(),
  taxRatePct: z.number().min(0).max(100).default(0),
  currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
  poNumber: z.string().trim().optional(),
  thankYouNote: z.string().trim().optional(),
  discountAmount: z.number().min(0).default(0),
  taxExemptionNote: z.string().trim().max(400, "Keep the tax note under 400 characters.").optional(),
  lateFeeNote: z.string().trim().max(400, "Keep the late-fee note under 400 characters.").optional(),
  serviceDate: z.string().trim().max(100, "Keep the service date under 100 characters.").optional(),
  clientTaxId: z.string().trim().max(60, "Keep the client tax ID under 60 characters.").optional(),
  // Ids of the account's saved payment methods to show; resolved server-side,
  // never trusted as content.
  paymentMethodIds: z.array(z.string()).max(15).default([]),
  customPaymentDetails: z.string().trim().max(800, "Keep custom payment details under 800 characters.").optional(),
  additionalDetails: z.string().trim().max(1500, "Keep additional details under 1500 characters.").optional(),
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
