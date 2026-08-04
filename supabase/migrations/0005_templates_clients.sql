-- Milestoned — Phase 9: reusable templates, clients, and (via existing
-- credit_purchases) account billing history.
-- Run in the Supabase SQL editor, or via `supabase db push`.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  email text,
  company text,
  notes text,
  created_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients (user_id);

-- Documents can optionally link to a saved client (for the per-client
-- document history page). client_name stays a required plain-text snapshot
-- either way — set from the picked client or typed free-hand — so existing
-- documents and documents created without picking a saved client still work
-- unchanged.
alter table public.documents
  add column client_id uuid references public.clients (id) on delete set null;

create index documents_client_id_idx on public.documents (client_id);

-- A saved clause selection only (no scope/deliverables/docType) — applied
-- from the Clauses step of the generate wizard.
create table public.clause_bundles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  clause_selection jsonb not null,
  created_at timestamptz not null default now()
);

create index clause_bundles_user_id_idx on public.clause_bundles (user_id);

-- A saved project preset (scope + deliverables + clauses + doc type),
-- applied to pre-fill the generate wizard. source_document_id is set when
-- the preset was created via "Save as template" on an existing document
-- (for the Templates page's "Cloned Documents" section) and null when
-- created directly from the wizard ("Project Presets" section) — same
-- shape either way, this only affects which section it's grouped under.
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  doc_type text not null
    check (doc_type in ('sow', 'contract', 'proposal', 'invoice')),
  scope text not null,
  deliverables text not null default '',
  clause_selection jsonb not null,
  source_document_id uuid references public.documents (id) on delete set null,
  created_at timestamptz not null default now()
);

create index templates_user_id_idx on public.templates (user_id);

-- ============================================================
-- Row-level security — same pattern as documents: a user can read, create,
-- and delete their own rows; updates happen server-side via Drizzle
-- (which bypasses RLS, so ownership is enforced in application code there).
-- ============================================================

alter table public.clients enable row level security;
alter table public.clause_bundles enable row level security;
alter table public.templates enable row level security;

create policy "clients_select_own"
  on public.clients for select
  using ((select auth.uid()) = user_id);

create policy "clients_insert_own"
  on public.clients for insert
  with check ((select auth.uid()) = user_id);

create policy "clients_delete_own"
  on public.clients for delete
  using ((select auth.uid()) = user_id);

create policy "clause_bundles_select_own"
  on public.clause_bundles for select
  using ((select auth.uid()) = user_id);

create policy "clause_bundles_insert_own"
  on public.clause_bundles for insert
  with check ((select auth.uid()) = user_id);

create policy "clause_bundles_delete_own"
  on public.clause_bundles for delete
  using ((select auth.uid()) = user_id);

create policy "templates_select_own"
  on public.templates for select
  using ((select auth.uid()) = user_id);

create policy "templates_insert_own"
  on public.templates for insert
  with check ((select auth.uid()) = user_id);

create policy "templates_delete_own"
  on public.templates for delete
  using ((select auth.uid()) = user_id);
