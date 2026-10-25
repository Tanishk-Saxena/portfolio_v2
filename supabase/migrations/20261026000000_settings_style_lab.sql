-- The style lab switch (owner, 2026-10-26; ADMIN-DESIGN-SPEC §14 "Style lab"): whether the
-- site shows the temporary Lab button that tries candidate palettes and hero backgrounds.
-- Off by default, so visitors never see it unless the owner turns it on. Additive: push
-- before the code deploys. Dropped with the lab once the owner picks.

alter table public.settings
  add column style_lab boolean not null default false;
