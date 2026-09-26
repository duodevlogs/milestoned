-- Milestoned — saved payment methods. Replaces the single free-text
-- "payment instructions" box with a list of typed methods (PayPal, bank
-- transfer variants, Wise, crypto, …) that each invoice can show any
-- combination of. Stored as jsonb on the user — a short list read whole and
-- validated in payment-method.service.ts, never queried by field.
-- users.payment_instructions is kept (invoices generated before this still
-- carry a copy of it) but is no longer edited in the app.
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  add column payment_methods jsonb not null default '[]'::jsonb;

-- Carry existing free text over as one "Other" method so nothing is lost.
update public.users
set payment_methods = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'other',
    'label', '',
    'fields', jsonb_build_object('title', 'Payment instructions', 'details', payment_instructions),
    'isDefault', true
  )
)
where payment_instructions is not null and btrim(payment_instructions) <> '';
