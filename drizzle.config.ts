import { defineConfig } from "drizzle-kit";

/*
 * Used for drizzle-kit introspection/studio only. Migrations are hand-written
 * SQL in supabase/migrations/ (source of truth) — do not use generate/push.
 */
export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
