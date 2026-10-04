-- Modal media for projects (owner, 2026-10-04; DESIGN-SPEC §10, Phase 9 roadmap item 23): an
-- ordered list of images, GIFs and videos shown in the modal in place of the cover, and a
-- setting for whether it moves on by itself. The bucket takes GIFs and short videos too
-- (its 10 MB cap stays). Additive: push it before the code that reads the columns deploys.

alter table public.project
  add column media jsonb not null default '[]'::jsonb
  check (jsonb_typeof(media) = 'array');

alter table public.settings
  add column media_auto_rotate boolean not null default false;

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'application/pdf'
]
where id = 'media';
