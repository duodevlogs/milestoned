import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  // trim() before the email check — see server/validation/auth.schema.ts's emailSchema comment.
  email: z
    .string()
    .trim()
    .pipe(z.email({ message: "Enter a valid email address." }))
    .optional()
    .or(z.literal(""))
    .default(""),
  company: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
