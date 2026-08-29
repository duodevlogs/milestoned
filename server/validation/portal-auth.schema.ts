import { z } from "zod";

export const requestPortalOtpSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
});

export const verifyPortalOtpSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type RequestPortalOtpInput = z.infer<typeof requestPortalOtpSchema>;
export type VerifyPortalOtpInput = z.infer<typeof verifyPortalOtpSchema>;
