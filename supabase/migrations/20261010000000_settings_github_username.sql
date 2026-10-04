-- The GitHub contribution heat map (owner, 2026-10-04; DESIGN-SPEC §10 "Contributions", Phase 9
-- roadmap item 29e): whose calendar the site shows under Skills. Empty, the default, hides
-- the heat map, so nothing changes until the admin enters a username. Additive: push before
-- the code deploys.

alter table public.settings
  add column github_username text not null default ''
    check (github_username ~ '^([A-Za-z0-9]+(-[A-Za-z0-9]+)*)?$' and char_length(github_username) <= 39);
