-- The site's title and description become settings (owner, 2026-10-03; Phase 9 roadmap item
-- 24): until now both were constants in app/layout.tsx. The defaults are those constants, so
-- nothing changes until the admin edits them. Additive: push before the code deploys.

alter table public.settings
  add column site_title text not null default 'Tanishk Saxena — Software Engineer'
    check (char_length(trim(site_title)) between 1 and 70),
  add column site_description text not null
    default 'Tanishk Saxena is a frontend engineer in Delhi building quiet, careful software for the web.'
    check (char_length(site_description) <= 200);
