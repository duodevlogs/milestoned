-- Milestoned — Projects: groups one client engagement's Proposal, Contract,
-- SOW, and Invoices together. Sits between Client (a contact, spanning every
-- engagement over time) and Document (one generated file) — Client 1:many
-- Project 1:many Document. project_id is nullable on documents so existing
-- documents (generated before this migration) are left ungrouped rather than
-- retroactively backfilled, consistent with how doc_number/related_document_id
-- were introduced in 0007.
-- Run in the Supabase SQL editor, or via `supabase db push`.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  client_id uuid references public.clients (id) on delete set null,
  client_name text not null,
  created_at timestamptz not null default now()
);

create index projects_user_id_created_at_idx on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;
-- No policies — server-only via Drizzle (bypasses RLS), same as documents.

alter table public.documents
  add column project_id uuid references public.projects (id) on delete set null;

create index documents_project_id_idx on public.documents (project_id);
