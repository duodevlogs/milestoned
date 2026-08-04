import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required."),
  email: z
    .email({ message: "Enter a valid email address." })
    .trim()
    .optional()
    .or(z.literal(""))
    .default(""),
  company: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
