import "server-only";

import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/server/errors";

/*
 * Authentication is Supabase's domain (sessions, tokens, email confirmation),
 * so this service wraps the Supabase auth client rather than Drizzle.
 * Supabase auth error messages are user-safe and are surfaced as AppErrors.
 */
export const authService = {
  async signInWithPassword(email: string, password: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new AppError(error.message, 401, "auth_failed");
    }
  },

  async signUpWithEmail(
    email: string,
    password: string,
    emailRedirectTo: string
  ): Promise<void> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (error) {
      throw new AppError(error.message, 400, "signup_failed");
    }
    // Supabase deliberately returns a fake "success" (no error) for an email
    // that already belongs to a confirmed account, to prevent attackers from
    // using signup to enumerate registered emails — the only client-visible
    // difference is an empty identities array, instead of the populated one
    // a genuinely new (or still-unconfirmed, legitimately retrying) signup
    // gets. Confirmed empirically against this project before relying on it.
    if (data.user && data.user.identities?.length === 0) {
      throw new AppError(
        "An account with this email already exists. Try signing in instead.",
        400,
        "account_exists"
      );
    }
  },

  async exchangeCodeForSession(code: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw new AppError(
        "Could not confirm your email. Try signing in, or sign up again.",
        400,
        "auth_callback_failed"
      );
    }
  },

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },

  /**
   * Supabase sends a confirmation link to the NEW address before the email
   * actually changes — this call succeeding means "confirmation sent", not
   * "email changed yet".
   */
  async updateEmail(email: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      throw new AppError(error.message, 400, "update_email_failed");
    }
  },

  async updatePassword(password: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new AppError(error.message, 400, "update_password_failed");
    }
  },

  /** The verified user for the current request, or null. */
  async getUser() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  /** The verified user, or throws 401. */
  async requireUser() {
    const user = await this.getUser();
    if (!user) throw AppError.unauthorized();
    return user;
  },
};
