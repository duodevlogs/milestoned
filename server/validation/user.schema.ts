import { z } from "zod";

export const updateBrandingSchema = z.object({
  businessName: z.string().trim().max(80, "Keep it under 80 characters.").optional(),
  // Server-generated (the storage upload URL) — not raw user input, but
  // still typed and validated for defense-in-depth.
  logoUrl: z.url({ message: "Invalid logo URL." }).optional(),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;

export const updateBusinessDetailsSchema = z.object({
  businessAddress: z.string().trim().max(300, "Keep it under 300 characters.").optional(),
  taxId: z.string().trim().max(60, "Keep it under 60 characters.").optional(),
  companyRegistration: z.string().trim().max(60, "Keep it under 60 characters.").optional(),
  paymentInstructions: z.string().trim().max(500, "Keep it under 500 characters.").optional(),
});

export type UpdateBusinessDetailsInput = z.infer<typeof updateBusinessDetailsSchema>;
