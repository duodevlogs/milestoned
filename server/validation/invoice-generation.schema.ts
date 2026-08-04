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
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
