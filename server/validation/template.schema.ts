import { z } from "zod";
import { clauseSelectionSchema } from "@/server/validation/document-generation.schema";

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Give this preset a name."),
  docType: z.enum(["sow", "contract", "proposal", "invoice"]),
  scope: z.string().trim().min(1, "Scope is required."),
  deliverables: z.string().trim().optional().default(""),
  clauses: clauseSelectionSchema,
});

export const cloneDocumentSchema = z.object({
  name: z.string().trim().min(1, "Give this template a name."),
  documentId: z.uuid({ message: "Invalid document id." }),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CloneDocumentInput = z.infer<typeof cloneDocumentSchema>;
