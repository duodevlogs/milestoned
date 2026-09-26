-- Milestoned — reverses 0011. VAT and any small-business/tax note are now
-- per-invoice choices (optional checkboxes in the invoice wizard), not an
-- account-level setting, so the two account columns are no longer used.
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  drop column tax_status,
  drop column tax_exemption_note;
