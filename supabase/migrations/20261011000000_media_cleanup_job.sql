-- The storage cleanup job (owner, 2026-10-04; ADMIN-DESIGN-SPEC §14 "Storage cleanup", Phase 9
-- roadmap item 32). Once a day the database removes from the `media` bucket every upload no
-- record points at: files of projects deleted more than ten minutes ago (Undo's margin),
-- files uploaded into a form that was never saved, and anything orphaned before cleanup
-- existed. The app itself only removes what a save drops (lib/admin/storage.ts).
--
-- A file has to go through the Storage API (deleting its row would leave the file behind),
-- so the job calls it with pg_net, using two Vault secrets set once per project by hand
-- (docs/SUPABASE.md): `project_url` and `service_role_key`. Without them the job does nothing.
-- Additive; the functions are callable by the server role only.

-- The uploads to remove: in the bucket for a day or more (a form still open may hold a newer
-- one), named as the upload route names files, and pointed at by no record.
create function public.media_orphans()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  with referenced as (
    select portrait ->> 'src' as url from public.profile
    union all
    select resume_url from public.profile
    union all
    select p.image ->> 'src' from public.project p
      where p.deleted_at is null or p.deleted_at > now() - interval '10 minutes'
    union all
    select m ->> 'src' from public.project p, jsonb_array_elements(p.media) m
      where p.deleted_at is null or p.deleted_at > now() - interval '10 minutes'
  )
  select o.name
  from storage.objects o
  where o.bucket_id = 'media'
    and o.created_at < now() - interval '1 day'
    and o.name ~ '^(images|files|media)/[0-9a-f-]{36}\.[a-z0-9]{2,5}$'
    and not exists (
      select 1 from referenced r
      where r.url is not null and right(r.url, length(o.name) + 7) = '/media/' || o.name
    );
$$;

-- Asks the Storage API to delete each one; returns how many it asked for. The requests are
-- queued by pg_net and sent after the transaction, so a failure never reaches the caller.
create function public.clean_media()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  key text;
  path text;
  asked integer := 0;
begin
  select decrypted_secret into base from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into key from vault.decrypted_secrets where name = 'service_role_key';
  if base is null or key is null then
    raise notice 'clean_media: set project_url and service_role_key in Vault (docs/SUPABASE.md)';
    return 0;
  end if;
  for path in select public.media_orphans() loop
    perform net.http_delete(
      url := rtrim(base, '/') || '/storage/v1/object/media/' || path,
      headers := jsonb_build_object('apikey', key, 'Authorization', 'Bearer ' || key)
    );
    asked := asked + 1;
  end loop;
  return asked;
end;
$$;

revoke all on function public.media_orphans() from public, anon, authenticated;
revoke all on function public.clean_media() from public, anon, authenticated;
grant execute on function public.media_orphans() to service_role;
grant execute on function public.clean_media() to service_role;

-- Every day at 21:30 UTC (03:00 in Delhi). Skipped where pg_cron does not exist (the test
-- database); scheduling under the same name again replaces the job.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    create extension if not exists pg_net;
    perform cron.schedule('clean-media', '30 21 * * *', 'select public.clean_media()');
  end if;
end;
$$;
