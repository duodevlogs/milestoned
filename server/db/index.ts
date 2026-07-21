import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/*
 * Drizzle connects straight to Postgres (Supabase's pooled connection
 * string), which runs as a privileged role and BYPASSES row-level security.
 * It must therefore only ever be reached through the repository layer,
 * with services passing user ids taken from a verified Supabase session.
 * RLS still protects any query made with the anon/authenticated Supabase
 * client (e.g. from proxy.ts or client components).
 */
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    // prepare: false — required for Supabase's transaction-mode pooler
    const client = postgres(url, { prepare: false });
    db = drizzle(client, { schema });
  }
  return db;
}
