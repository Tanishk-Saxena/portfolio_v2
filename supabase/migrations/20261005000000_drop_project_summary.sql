-- The project's Card line goes (owner, 2026-10-04; ADMIN-DESIGN-SPEC §14, Phase 9 roadmap
-- item 21): nothing on the site showed it except the modal, as a fallback for an empty
-- Description. That fallback is kept by copying it over before the column is dropped.
--
-- Not additive: the code that still selects `summary` breaks once this runs, so push it
-- after the code that no longer reads the column is deployed.

update public.project
set description = left(summary, 320)
where trim(description) = '' and trim(summary) <> '';

alter table public.project drop column summary;
