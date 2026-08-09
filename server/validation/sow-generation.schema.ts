import { z } from "zod";
import { clauseSelectionSchema } from "@/server/validation/document-generation.schema";

export const sowDeliverableInputSchema = z.object({
  item: z.string().trim().min(1, "Every deliverable needs a description."),
  acceptanceCriteria: z.string().trim().min(1, "Describe how this deliverable is judged done."),
});

export const sowMilestoneInputSchema = z.object({
  label: z.string().trim().min(1, "Every milestone needs a name."),
  pct: z.number().min(0).max(100),
  targetDate: z.string().trim().optional().default(""),
});

export const generateSowSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required."),
  // Optional link to a saved client — set when picked from the client list, null when typed free-hand.
  clientId: z.uuid().optional().nullable(),
  clientCompany: z.string().trim().optional(),
  projectName: z.string().trim().min(1, "Project name is required."),
  version: z.string().trim().optional().default("1.0"),

  // Optional cross-references — must belong to the caller (verified in the service).
  relatedProposalId: z.uuid().optional().nullable(),
  relatedContractId: z.uuid().optional().nullable(),

  // Consultant's raw notes — polished into formal prose by the AI.
  overviewNotes: z.string().trim().min(1, "Describe what's being built and why."),
  scopeNotes: z.string().trim().min(1, "Describe the scope of work."),

  outOfScope: z.string().trim().optional().default(""),
  deliverables: z.array(sowDeliverableInputSchema).min(1, "At least one deliverable is required."),
  clientResponsibilities: z.string().trim().optional().default(""),
  assumptions: z.string().trim().optional().default(""),

  budget: z.number().positive("Total project value must be greater than 0."),
  milestones: z
    .array(sowMilestoneInputSchema)
    .min(1, "At least one milestone is required.")
    .refine(
      (milestones) => Math.round(milestones.reduce((sum, m) => sum + m.pct, 0)) === 100,
      { message: "Milestones must add up to 100%." }
    ),

  clauses: clauseSelectionSchema,
});

export type GenerateSowInput = z.infer<typeof generateSowSchema>;
