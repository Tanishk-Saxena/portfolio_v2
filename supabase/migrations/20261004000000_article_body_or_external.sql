-- An article has a body or an external URL, never both (owner, 2026-10-04; ADMIN-DESIGN-SPEC
-- §14, Phase 9 roadmap item 6). The site already shows the body when a row has both, so the
-- address it never used is cleared before the check goes on.

update public.article
set external_url = null
where nullif(trim(body), '') is not null and external_url is not null;

alter table public.article
  add constraint article_body_or_external
  check (nullif(trim(body), '') is null or external_url is null);
