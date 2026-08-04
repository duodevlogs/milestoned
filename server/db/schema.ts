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
  primaryKey,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/*
 * Singleton settings row — launchedAt stays null until the founder flips it
 * at actual launch. The signup trigger (SQL) reads this to decide whether a
 * new user is a founding member; the landing page reads it via
 * appSettingsRepository to decide which pricing/copy to show.
 */
export const appSettings = pgTable("app_settings", {
  id: boolean("id").primaryKey().default(true),
  launchedAt: timestamp("launched_at", { withTimezone: true }),
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
  // Shown on generated documents instead of the Milestoned brand mark —
  // the document represents the customer's business to their own client.
  businessName: text("business_name"),
  logoUrl: text("logo_url"),
  // Invoice fields — the consultant's own billing details, shown verbatim
  // on generated invoices. paymentInstructions is free text (not structured
  // bank-account fields) since payment details vary too much by country/method.
  businessAddress: text("business_address"),
  taxId: text("tax_id"),
  companyRegistration: text("company_registration"),
  paymentInstructions: text("payment_instructions"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    company: text("company"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("clients_user_id_idx").on(t.userId)]
);

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
    // Optional link to a saved client (for the per-client document history
    // page). clientName above stays the required plain-text snapshot either
    // way, so documents created without picking a saved client still work.
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    projectName: text("project_name").notNull(),
    content: jsonb("content").notNull(),
    pdfUrl: text("pdf_url"),
    status: text("status", {
      enum: ["draft", "sent", "signed", "paid"],
    })
      .notNull()
      .default("draft"),
    // Sequential per-user/per-type/per-year number, e.g. "DDL-INV-2026-014" —
    // see document-number.service.ts. Null for documents generated before
    // this existed.
    docNumber: text("doc_number"),
    // Optional pointer to another of the user's own documents (e.g. an
    // Invoice referencing the SOW it bills against). Self-referencing, so
    // the FK target needs the AnyPgColumn type hint to avoid a circular
    // type-inference error.
    relatedDocumentId: uuid("related_document_id").references(
      (): AnyPgColumn => documents.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("documents_user_id_created_at_idx").on(t.userId, t.createdAt.desc()),
    index("documents_client_id_idx").on(t.clientId),
  ]
);

/** A saved clause selection only — applied from the Clauses wizard step. */
export const clauseBundles = pgTable(
  "clause_bundles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    clauseSelection: jsonb("clause_selection").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("clause_bundles_user_id_idx").on(t.userId)]
);

/**
 * A saved project preset (scope + deliverables + clauses + doc type),
 * applied to pre-fill the generate wizard. sourceDocumentId is set when
 * created via "Save as template" on an existing document (Templates page's
 * "Cloned Documents" section) and null when created directly from the
 * wizard ("Project Presets" section) — same shape either way, this only
 * affects which section it's grouped under.
 */
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    docType: text("doc_type", {
      enum: ["sow", "contract", "proposal", "invoice"],
    }).notNull(),
    scope: text("scope").notNull(),
    deliverables: text("deliverables").notNull().default(""),
    clauseSelection: jsonb("clause_selection").notNull(),
    sourceDocumentId: uuid("source_document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("templates_user_id_idx").on(t.userId)]
);

/**
 * Atomic per-user/per-type/per-year counter for document numbers — same
 * guarded-update principle as users.creditsRemaining, so two concurrent
 * generations can never produce the same number.
 */
export const documentSequences = pgTable(
  "document_sequences",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    docType: text("doc_type", {
      enum: ["sow", "contract", "proposal", "invoice"],
    }).notNull(),
    year: integer("year").notNull(),
    lastNumber: integer("last_number").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.docType, t.year] })]
);

export const creditPurchases = pgTable(
  "credit_purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Unique so a redelivered Stripe webhook event can never grant credits twice.
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    creditsPurchased: integer("credits_purchased").notNull(),
    amountCents: integer("amount_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("credit_purchases_user_id_idx").on(t.userId)]
);

export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type ClauseBundle = typeof clauseBundles.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type DocumentSequence = typeof documentSequences.$inferSelect;
export type DocumentStatus = Document["status"];
