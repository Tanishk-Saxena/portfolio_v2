-- Storage cleanup (owner, 2026-10-04; ADMIN-DESIGN-SPEC §14, Phase 9 roadmap item 32): the
-- admin removes a file once no record points at it. The delete policy has been there from
-- the start, but a delete only reaches rows the role can also select, and nothing let the
-- admin select objects (the public reads files through the bucket's public URL, which needs
-- no policy). Without this, a remove succeeds and deletes nothing. Additive: push it before
-- the code that removes files deploys.

create policy "admin reads media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
