-- Milestoned — per-account VAT/tax status. A small-business-exempt account
-- (e.g. Germany's Kleinunternehmerregelung, §19 UStG) must not show VAT on
-- its invoices at all — VAT printed on an invoice is generally owed even by
-- an exempt business — and must print an exemption note instead. The note
-- text is user-editable since the exact legal wording is the user's/their
-- tax advisor's call, not something this app should assert.
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  add column tax_status text not null default 'standard'
    check (tax_status in ('standard', 'exempt')),
  add column tax_exemption_note text;
