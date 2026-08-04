import { z } from "zod";

/** Internal redirect path — rejects absolute/protocol-relative URLs. */
export const nextPathSchema = z
  .unknown()
  .transform((v) =>
    typeof v === "string" && v.startsWith("/") && !v.startsWith("//")
      ? v
      : "/dashboard"
  );

const emailSchema = z
  .email({ message: "Enter a valid email address." })
  .trim();

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string({ message: "Enter your password." })
    .min(1, "Enter your password."),
  next: nextPathSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string({ message: "Choose a password." })
    .min(8, "Password must be at least 8 characters."),
  next: nextPathSchema,
});

export const updateEmailSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: z
    .string({ message: "Choose a password." })
    .min(8, "Password must be at least 8 characters."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
