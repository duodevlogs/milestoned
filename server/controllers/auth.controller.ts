import "server-only";

import { AppError } from "@/server/errors";
import { authService } from "@/server/services/auth.service";
import {
  nextPathSchema,
  signInSchema,
  signUpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "@/server/validation/auth.schema";

/*
 * Controllers sit between the HTTP layer (server actions / route handlers)
 * and services: they validate raw input with Zod, delegate to services, and
 * shape the result. No database or external API calls happen here.
 */
export const authController = {
  async signIn(raw: unknown): Promise<{ next: string }> {
    const input = signInSchema.parse(raw);
    await authService.signInWithPassword(input.email, input.password);
    return { next: input.next };
  },

  async signUp(raw: unknown, origin: string): Promise<void> {
    const input = signUpSchema.parse(raw);
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(input.next)}`;
    await authService.signUpWithEmail(input.email, input.password, emailRedirectTo);
  },

  async handleCallback(rawCode: unknown, rawNext: unknown): Promise<{ next: string }> {
    const next = nextPathSchema.parse(rawNext);
    if (typeof rawCode !== "string" || rawCode.length === 0) {
      throw AppError.badRequest("Missing confirmation code.", "missing_code");
    }
    await authService.exchangeCodeForSession(rawCode);
    return { next };
  },

  async signOut(): Promise<void> {
    await authService.signOut();
  },

  async updateEmail(raw: unknown): Promise<void> {
    const input = updateEmailSchema.parse(raw);
    await authService.updateEmail(input.email);
  },

  async updatePassword(raw: unknown): Promise<void> {
    const input = updatePasswordSchema.parse(raw);
    await authService.updatePassword(input.password);
  },
};
