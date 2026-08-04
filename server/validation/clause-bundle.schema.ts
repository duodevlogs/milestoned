import { z } from "zod";
import { clauseSelectionSchema } from "@/server/validation/document-generation.schema";

export const createClauseBundleSchema = z.object({
  name: z.string().trim().min(1, "Give this bundle a name."),
  clauses: clauseSelectionSchema,
});

export type CreateClauseBundleInput = z.infer<typeof createClauseBundleSchema>;
