-- Milestoned — Client Portal foundation. A client gets read-only, per-project
-- access without a Milestoned account: the provider invites them by email,
-- the client proves control of that email via a one-time code (never a bare
-- link-as-credential — a leaked/forwarded link alone must never be enough to
-- see confidential documents), and gets a short-lived signed session scoped
-- to (project, email). Nothing in a project is visible to a client until the
-- provider explicitly shares that specific document (documents.shared_at).
-- Run in the Supabase SQL editor, or via `supabase db push`.

-- Allowlist of (project, email) pairs the provider has invited. No secret
-- token lives here — the portal URL is just the project's UUID (not
-- guessable), and the real gate is the OTP flow below, keyed off this row.
create table public.portal_access (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  email text not null,
  invited_at timestamptz not null default now(),
  -- Set by the provider to instantly cut off an existing client session's
  -- ability to verify a new OTP or refresh — checked on every portal request.
  revoked_at timestamptz,
  last_verified_at timestamptz,
  unique (project_id, email)
);

create index portal_access_project_id_idx on public.portal_access (project_id);

alter table public.portal_access enable row level security;
-- No policies — server-only via Drizzle, same as documents/projects.

-- Short-lived one-time codes, never stored in plaintext. A code is scoped to
-- one (project, email) attempt and is single-use (consumed_at) with a capped
-- guess count (attempts) — both enforced in portal-otp.service.ts, not here.
create table public.portal_otp_codes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index portal_otp_codes_project_id_email_idx on public.portal_otp_codes (project_id, email);

alter table public.portal_otp_codes enable row level security;
-- No policies — server-only via Drizzle.

alter table public.documents
  add column shared_at timestamptz;
