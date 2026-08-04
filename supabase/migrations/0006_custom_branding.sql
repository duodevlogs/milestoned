-- Milestoned — custom document branding: a business name and/or logo that
-- replaces the Milestoned brand mark on generated documents. The document
-- represents the customer's business to their own client, not ours.
-- Run in the Supabase SQL editor, or via `supabase db push`.

alter table public.users
  add column business_name text,
  add column logo_url text;

-- Storage bucket for logo uploads. Public read (logos aren't sensitive, and
-- must be fetchable both by the browser preview and by react-pdf's
-- server-side PDF renderer, which fetches the image over HTTP); writes are
-- restricted to the owning user's own folder ({user_id}/...).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "logos_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos_update_own"
  on storage.objects for update
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos_delete_own"
  on storage.objects for delete
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');
