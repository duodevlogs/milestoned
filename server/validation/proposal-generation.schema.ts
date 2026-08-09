import { z } from "zod";
import { milestoneInputSchema } from "@/server/validation/document-generation.schema";

export const proposalAddOnInputSchema = z.object({
  label: z.string().trim().min(1, "Every add-on needs a description."),
  amount: z.number().positive("Amount must be greater than 0."),
});

export const generateProposalSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required."),
  // Optional link to a saved client — set when picked from the client list, null when typed free-hand.
  clientId: z.uuid().optional().nullable(),
  clientCompany: z.string().trim().optional(),
  projectName: z.string().trim().min(1, "Project name is required."),

  // Consultant's raw notes — polished into persuasive prose by the AI.
  problemNotes: z.string().trim().min(1, "Describe the client's problem or what you heard on the discovery call."),
  approachNotes: z.string().trim().min(1, "Describe how you'll solve it."),
  whyUsNotes: z.string().trim().min(1, "Give at least one reason the client should pick you."),

  scopeOverview: z.string().trim().min(1, "A high-level scope overview is required."),
  timelineOverview: z.string().trim().min(1, "A timeline overview is required."),

  budget: z.number().positive("Total project value must be greater than 0."),
  milestones: z
    .array(milestoneInputSchema)
    .min(1, "At least one payment milestone is required.")
    .refine(
      (milestones) => Math.round(milestones.reduce((sum, m) => sum + m.pct, 0)) === 100,
      { message: "Milestones must add up to 100%." }
    ),
  addOns: z.array(proposalAddOnInputSchema).optional().default([]),

  assumptionsExclusions: z.string().trim().optional().default(""),
  nextSteps: z.string().trim().optional(),
  validityDays: z.number().int().positive().default(30),
  includeAcceptanceSignature: z.boolean().default(true),
});

export type GenerateProposalInput = z.infer<typeof generateProposalSchema>;
