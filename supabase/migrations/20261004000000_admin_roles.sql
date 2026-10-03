-- Admin roles (Phase 9.4, roadmap item 1). The allowlist gains a role: an `editor` reads
-- and writes everything, as every admin did before; a `viewer` reads everything the admin
-- shows (hidden rows, drafts) and writes nothing. The viewer exists so CI can sign in and
-- audit the admin's screens without a key that can change content.

alter table public.admin_user
  add column role text not null default 'editor' check (role in ('editor', 'viewer'));

-- `is_admin()` stays "on the allowlist" (reads). Writes need `is_editor()`.
create function public.is_editor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_user where user_id = (select auth.uid()) and role = 'editor'
  );
$$;

-- The signed-in user's role, or null when they aren't on the allowlist (for the app).
create function public.admin_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.admin_user where user_id = (select auth.uid());
$$;

grant execute on function public.is_editor(), public.admin_role() to anon, authenticated;

-- Split each table's "admin manages" policy: any admin reads, only an editor writes.
do $$
declare t text;
begin
  foreach t in array array[
    'profile', 'settings', 'experience', 'project', 'article', 'skill_group', 'quote',
    'social_link'
  ] loop
    execute format('drop policy "admin manages %1$s" on public.%1$I', t);
    execute format(
      'create policy "admin reads %1$s" on public.%1$I for select to authenticated
         using ((select public.is_admin()))', t);
    execute format(
      'create policy "editor inserts %1$s" on public.%1$I for insert to authenticated
         with check ((select public.is_editor()))', t);
    execute format(
      'create policy "editor updates %1$s" on public.%1$I for update to authenticated
         using ((select public.is_editor())) with check ((select public.is_editor()))', t);
    execute format(
      'create policy "editor deletes %1$s" on public.%1$I for delete to authenticated
         using ((select public.is_editor()))', t);
  end loop;
end;
$$;

-- Uploads: editors only.
drop policy "admin uploads media" on storage.objects;
drop policy "admin replaces media" on storage.objects;
drop policy "admin removes media" on storage.objects;
create policy "editor uploads media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_editor()));
create policy "editor replaces media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_editor()));
create policy "editor removes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_editor()));
