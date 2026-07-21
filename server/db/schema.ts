/*
 * Drizzle schema — mirrors supabase/migrations/0001_init.sql exactly.
 * The SQL migration is the source of truth; schema changes go there first,
 * then get mirrored here. We do not use drizzle-kit generate/push.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const foundingMembers = pgTable("founding_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  // References auth.users(id) — enforced by the SQL migration.
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  creditsRemaining: integer("credits_remaining").notNull().default(0),
  creditsTotalPurchased: integer("credits_total_purchased")
    .notNull()
    .default(0),
  isFoundingMember: boolean("is_founding_member").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    docType: text("doc_type", {
      enum: ["sow", "contract", "proposal", "invoice"],
    }).notNull(),
    clientName: text("client_name").notNull(),
    projectName: text("project_name").notNull(),
    content: jsonb("content").notNull(),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("documents_user_id_created_at_idx").on(t.userId, t.createdAt.desc()),
  ]
);

export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type FoundingMember = typeof foundingMembers.$inferSelect;
