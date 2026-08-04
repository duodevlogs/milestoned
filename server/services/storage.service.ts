import "server-only";

import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/server/errors";

const LOGOS_BUCKET = "logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
// react-pdf's <Image> only documents JPG/PNG support — restrict uploads to
// those so the same file works in both the browser preview and the PDF.
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

export const storageService = {
  /**
   * Uploads to the user's own folder in the public "logos" bucket (storage
   * RLS restricts writes to `{user_id}/...`) and returns its public URL.
   * Uses the per-request Supabase client (the user's own session) — logo
   * storage is Supabase Auth/Storage's domain, not Drizzle's, same as how
   * auth.service.ts wraps Supabase Auth directly instead of going through
   * the privileged Postgres connection.
   */
  async uploadLogo(userId: string, file: File): Promise<string> {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw AppError.badRequest("Logo must be a PNG or JPG image.", "invalid_logo_type");
    }
    if (file.size > MAX_LOGO_BYTES) {
      throw AppError.badRequest("Logo must be under 2MB.", "logo_too_large");
    }

    const supabase = await createClient();
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${userId}/logo.${ext}`;

    const { error } = await supabase.storage.from(LOGOS_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      throw new AppError(`Could not upload logo: ${error.message}`, 400, "logo_upload_failed");
    }

    const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    // Cache-bust so a replaced logo doesn't keep showing a stale cached
    // image at the same URL (the path is stable per user, upsert overwrites it).
    return `${data.publicUrl}?v=${Date.now()}`;
  },
};
