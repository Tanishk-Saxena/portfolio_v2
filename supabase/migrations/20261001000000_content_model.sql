-- Content model v2 (brief §5, ADMIN-DESIGN-SPEC §8). One table per domain entity; the
-- repository layer maps snake_case rows to the camelCase domain types.
--
-- Security model (brief §6, Phase 6.2): RLS is the real boundary. Anonymous visitors read
-- only what the site shows (non-deleted, published / active rows). Every write, and every
-- read of hidden rows, needs a signed-in user listed in `admin_user` (Phase 7 adds the one
-- account). The app's route guard is defence in depth on top of this.

-- ── Helpers ──────────────────────────────────────────────────────────────────────────────

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- The allowlist. No policies: only `is_admin()` (security definer) reads it.
create table public.admin_user (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_user enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_user where user_id = (select auth.uid()));
$$;

-- ── Single records ───────────────────────────────────────────────────────────────────────

create table public.profile (
  id boolean primary key default true check (id), -- exactly one row
  name text not null,
  eyebrow text not null default '',
  headline text not null,
  headline_highlight text,
  standfirst text not null default '',
  cta_label text not null default '',
  about_lead text not null,
  about_paragraphs text[] not null default '{}',
  portrait jsonb, -- Image: { src, alt, width, height, focalPoint? }
  resume_url text,
  email text not null,
  contact_statement text not null,
  location text not null default '',
  footer_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id boolean primary key default true check (id), -- exactly one row
  accent text not null default 'terracotta' check (accent in ('terracotta', 'slate')),
  grain numeric(3, 1) not null default 6 check (grain between 0 and 24),
  nav_position text not null default 'right' check (nav_position in ('right', 'centre')),
  menu_layout text not null default 'arc' check (menu_layout in ('arc', 'wheel')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Collections ──────────────────────────────────────────────────────────────────────────
-- Text ids so the seeded rows keep the fixtures' ids; new rows get a uuid.

create table public.experience (
  id text primary key default gen_random_uuid()::text,
  role text not null,
  org text not null,
  start_date text not null check (start_date ~ '^\d{4}-\d{2}$'),
  end_date text check (end_date ~ '^\d{4}-\d{2}$' and end_date >= start_date), -- null = current
  summary text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.project (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  kind text not null check (kind in ('open-source', 'side-project', 'client-work')),
  year integer not null check (year between 1900 and 2999),
  summary text not null default '' check (char_length(summary) <= 110),
  description text not null default '' check (char_length(description) <= 320),
  tags text[] not null default '{}',
  image jsonb, -- Image
  repo_url text,
  live_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.article (
  id uuid primary key default gen_random_uuid(), -- stable while the slug is edited
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  published_at date not null default current_date,
  read_minutes integer check (read_minutes >= 1), -- null = estimate from the body
  body text, -- Markdown; null = lives only at external_url
  external_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  listen boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- Publishing needs somewhere to read it (ADMIN-DESIGN-SPEC Q-A12).
  check (status = 'draft' or nullif(trim(body), '') is not null or external_url is not null)
);
-- A slug is unique among live articles; a deleted one frees it.
create unique index article_slug_live on public.article (slug) where deleted_at is null;

create table public.skill_group (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  items text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.quote (
  id text primary key default gen_random_uuid()::text,
  text text not null check (char_length(text) <= 140),
  author text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.social_link (
  id text primary key default gen_random_uuid()::text,
  label text not null,
  url text not null default '', -- empty = hidden on the site
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ── updated_at, RLS, policies ────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'profile', 'settings', 'experience', 'project', 'article', 'skill_group', 'quote',
    'social_link'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "admin manages %1$s" on public.%1$I for all to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- What the public site may read. Permissive policies OR together, so the admin sees all.
create policy "public reads profile" on public.profile for select using (true);
create policy "public reads settings" on public.settings for select using (true);
create policy "public reads experience" on public.experience for select
  using (deleted_at is null);
create policy "public reads published projects" on public.project for select
  using (deleted_at is null and published);
create policy "public reads published articles" on public.article for select
  using (deleted_at is null and status = 'published');
create policy "public reads skill groups" on public.skill_group for select
  using (deleted_at is null);
create policy "public reads active quotes" on public.quote for select
  using (deleted_at is null and active);
create policy "public reads linked socials" on public.social_link for select
  using (deleted_at is null and url <> '');

-- Table privileges, stated explicitly so the schema behaves the same whether or not the
-- project's "Automatically expose new tables" setting is on. Visitors may only attempt
-- reads; signed-in users may attempt writes, which the policies above then allow only for
-- the admin. The allowlist itself is reachable only through is_admin().
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.profile, public.settings, public.experience, public.project,
  public.article, public.skill_group, public.quote, public.social_link
  to anon, authenticated;
grant insert, update, delete on public.profile, public.settings, public.experience,
  public.project, public.article, public.skill_group, public.quote, public.social_link
  to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Storage ──────────────────────────────────────────────────────────────────────────────
-- One public bucket for the portrait, project covers and the résumé (ADMIN-DESIGN-SPEC §10,
-- Q-A17: 5 MB images, 10 MB PDF; the per-type limit is checked by the upload route).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

create policy "admin uploads media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "admin replaces media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "admin removes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
