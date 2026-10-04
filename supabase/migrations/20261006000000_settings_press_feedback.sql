-- Press feedback as a setting (owner, 2026-10-04; DESIGN-SPEC §10, Phase 9 roadmap item 20):
-- the ripple stays the default; Ring and Press-in are there to compare over time.
-- Additive: push it before the code that reads the column is deployed.

alter table public.settings
  add column press_feedback text not null default 'ripple'
  check (press_feedback in ('ripple', 'ring', 'press'));
