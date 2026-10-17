-- The script face becomes a setting (owner, 2026-10-04; DESIGN-SPEC §10 "Phase 9 picks", Phase 9
-- roadmap item 28a): Allura or Caveat, for the signature and the hero's highlighted word.
-- Allura, the owner's pick, is the default. Additive: push before the code deploys.

alter table public.settings
  add column script_font text not null default 'allura'
    check (script_font in ('allura', 'caveat'));
