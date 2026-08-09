-- Milestoned — business country, used only to suggest a default VAT/tax rate
-- when starting a new invoice (see lib/tax-rates.ts). Free-standing from the
-- existing business/billing fields added in 0007 since it's a UI convenience,
-- not something printed on generated documents.
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  add column country text;
