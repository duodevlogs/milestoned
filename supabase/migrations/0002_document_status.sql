-- Milestoned — document lifecycle status
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.documents
  add column status text not null default 'draft'
    check (status in ('draft', 'sent', 'signed', 'paid'));
