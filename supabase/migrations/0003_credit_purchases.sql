-- Milestoned — credit top-up purchases
-- Run in the Supabase SQL editor, or via `supabase db push`.

create table if not exists public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- Unique so a redelivered Stripe webhook event can never grant credits twice.
  stripe_session_id text not null unique,
  credits_purchased integer not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists credit_purchases_user_id_idx on public.credit_purchases(user_id);
