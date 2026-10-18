-- Two style settings go (owner, 2026-10-18; DESIGN-SPEC §10): the navigation button is always
-- bottom right (the centre position cut into content), and every press uses the ripple (Ring
-- and Press-in were compared and dropped). Not additive: push after the code that no longer
-- reads these columns is deployed.

alter table public.settings
  drop column nav_position,
  drop column press_feedback;
