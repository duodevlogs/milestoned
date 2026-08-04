-- Milestoned — shared foundations for per-doc-type flows: the consultant's
-- own business/billing details (needed by Invoice), sequential document
-- numbering, and cross-document references (e.g. an Invoice pointing back
-- to the SOW it bills against).
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  add column business_address text,
  add column tax_id text,
  add column company_registration text,
  -- Free text rather than structured bank-account fields — payment details
  -- vary too much by country/method to model strictly; shown verbatim on
  -- invoices exactly as the consultant writes it.
  add column payment_instructions text;

alter table public.documents
  add column doc_number text,
  add column related_document_id uuid references public.documents (id) on delete set null;

-- Atomic per-user/per-type/per-year sequence counter, so two concurrent
-- generations can never produce the same document number (same guarded-
-- update principle as credits_remaining elsewhere in this app).
create table public.document_sequences (
  user_id uuid not null references public.users (id) on delete cascade,
  doc_type text not null,
  year integer not null,
  last_number integer not null default 0,
  primary key (user_id, doc_type, year)
);

alter table public.document_sequences enable row level security;
-- No policies — server-only via Drizzle (bypasses RLS), same as credit_purchases.
