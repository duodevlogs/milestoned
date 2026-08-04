-- Milestoned — founding member rework: free pre-launch signup with a
-- locked-in discounted top-up rate, instead of a paid $7 signup.
-- Run in the Supabase SQL editor, or via `supabase db push`.

-- Singleton settings row — launched_at stays null until the founder flips
-- it at actual launch. Read by handle_new_user() below (to decide whether a
-- new signup is a founding member) and by the landing page (to decide which
-- pricing/copy to show).
create table if not exists public.app_settings (
  id boolean primary key default true,
  launched_at timestamptz,
  constraint app_settings_singleton check (id)
);

insert into public.app_settings (id, launched_at)
values (true, null)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;
-- No policies — service role only, same reasoning founding_members had.

-- founding_members is no longer used — founding-member status is now free
-- (just "signed up before launch"), not a paid, email-matched pre-order.
drop table if exists public.founding_members;

-- Re-provision new users: founding-member status now just means "signed up
-- before launch" — no payment and no credits granted at signup. Credits
-- are only ever added via a real top-up purchase (at the founding-member
-- rate if is_founding_member is true, the regular rate otherwise).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_prelaunch boolean;
begin
  select (launched_at is null) into is_prelaunch
  from public.app_settings
  limit 1;

  insert into public.users (id, email, is_founding_member)
  values (new.id, new.email, coalesce(is_prelaunch, true));

  return new;
end;
$$;
