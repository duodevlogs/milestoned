import { z } from "zod";

/** Internal redirect path — rejects absolute/protocol-relative URLs. */
export const nextPathSchema = z
  .unknown()
  .transform((v) =>
    typeof v === "string" && v.startsWith("/") && !v.startsWith("//")
      ? v
      : "/dashboard"
  );

// trim() must run BEFORE the email format check — validating the raw,
// still-padded string first means whitespace from autofill/copy-paste
// (which trim() would otherwise clean up) causes a valid email to be
// rejected. Piping into the top-level z.email() (rather than the
// deprecated chained .email() method) keeps that correct order.
const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ message: "Enter a valid email address." }));

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
