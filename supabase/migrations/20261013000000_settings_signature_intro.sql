-- The signature intro returns (owner, 2026-10-04; DESIGN-SPEC §10 "Signature intro", Phase 9
-- roadmap item 29c): whether the home page opens with the signature written large and flown
-- into the navbar. On by default, as the mockup has it. Additive: push before the code deploys.

alter table public.settings
  add column signature_intro boolean not null default true;
