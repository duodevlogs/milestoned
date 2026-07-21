-- Milestoned — initial schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

-- ============================================================
-- Tables
-- ============================================================

create table public.founding_members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  stripe_customer_id text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  credits_remaining integer not null default 0 check (credits_remaining >= 0),
  credits_total_purchased integer not null default 0,
  is_founding_member boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  doc_type text not null
    check (doc_type in ('sow', 'contract', 'proposal', 'invoice')),
  client_name text not null,
  project_name text not null,
  content jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

-- ============================================================
-- Row-level security
-- ============================================================

alter table public.founding_members enable row level security;
alter table public.users enable row level security;
alter table public.documents enable row level security;

-- founding_members: no policies — only the service role (Stripe webhook)
-- can read or write. RLS with zero policies denies anon + authenticated.

-- users: a user can read their own row. Credits are mutated only by
-- server-side code using the service role, so no insert/update policies.
create policy "users_select_own"
  on public.users for select
  using ((select auth.uid()) = id);

-- documents: a user can read and create their own documents.
create policy "documents_select_own"
  on public.documents for select
  using ((select auth.uid()) = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  with check ((select auth.uid()) = user_id);

create policy "documents_delete_own"
  on public.documents for delete
  using ((select auth.uid()) = user_id);

-- ============================================================
-- Auto-provision a public.users row on signup.
-- Founding members (paid pre-launch) get 20 credits + the flag.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fm record;
begin
  select * into fm
  from public.founding_members
  where email = new.email and payment_status = 'paid';

  if fm.id is not null then
    insert into public.users (id, email, credits_remaining, credits_total_purchased, is_founding_member)
    values (new.id, new.email, 20, 20, true);
  else
    insert into public.users (id, email)
    values (new.id, new.email);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
