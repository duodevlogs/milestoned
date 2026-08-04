import { z } from "zod";

export const milestoneInputSchema = z.object({
  label: z.string().trim().min(1, "Every milestone needs a name."),
  pct: z.number().min(0).max(100),
});

/*
 * Mirrors lib/contract-clauses.ts's ClauseSelection. Every boolean here just
 * gates whether a FIXED template clause is included — the server never asks
 * an LLM to draft legal text from these fields. governingLawJurisdiction and
 * customClauseText are plain user-typed strings, validated below to be
 * present whenever their checkbox is on.
 */
export const clauseSelectionSchema = z
  .object({
    ip: z.boolean(),
    confidentiality: z.boolean(),
    liability: z.boolean(),
    termination: z.boolean(),
    terminationNoticeDays: z.string().trim(),
    latePayment: z.boolean(),
    latePaymentGraceDays: z.string().trim(),
    latePaymentFeePct: z.string().trim(),
    warranty: z.boolean(),
    revisions: z.boolean(),
    governingLaw: z.boolean(),
    governingLawJurisdiction: z.string().trim(),
    customClause: z.boolean(),
    customClauseTitle: z.string().trim(),
    customClauseText: z.string().trim(),
  })
  .refine((c) => !c.governingLaw || c.governingLawJurisdiction.length > 0, {
    message: "Enter a jurisdiction for the governing law clause, or uncheck it.",
    path: ["governingLawJurisdiction"],
  })
  .refine((c) => !c.customClause || c.customClauseText.length > 0, {
    message: "Enter your custom clause text, or uncheck it.",
    path: ["customClauseText"],
  });

export const generateDocumentSchema = z.object({
  docType: z.enum(["sow", "contract", "proposal", "invoice"]),
  clientName: z.string().trim().min(1, "Client name is required."),
  // Optional link to a saved client — set when picked from the client list
  // in the Project Details step, null when typed free-hand.
  clientId: z.uuid().optional().nullable(),
  projectName: z.string().trim().min(1, "Project name is required."),
  budget: z.number().positive("Total project value must be greater than 0."),
  scope: z.string().trim().min(1, "Project scope is required."),
  deliverables: z.string().trim().optional().default(""),
  milestones: z
    .array(milestoneInputSchema)
    .min(1, "At least one payment milestone is required.")
    .refine(
      (milestones) =>
        Math.round(milestones.reduce((sum, m) => sum + m.pct, 0)) === 100,
      { message: "Milestones must add up to 100%." }
    ),
  startDate: z.string().trim().optional(),
  deliveryDate: z.string().trim().optional(),
  clauses: clauseSelectionSchema,
});

export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
