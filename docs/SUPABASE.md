# Supabase

Two real projects: **dev** (local work, Vercel previews) and **prod** (the live site), plus
CI's throwaway **local** one (`npx supabase start`), which every test runs against. Tests never
touch dev or prod. RLS is the security boundary: anonymous reads see only published / active,
non-deleted rows; every write, and every read of hidden rows, needs a signed-in user in
`public.admin_user`. `proxy.ts` and the admin's handlers check the session too, but never
replace RLS.

## In the repo

| Path | What |
|---|---|
| `supabase/migrations/*.sql` | The schema, applied in filename order: tables, constraints, triggers, RLS, the allowlist, the `media` bucket (`images/`, `files/`, `media/`), the cleanup job |
| `supabase/seed.sql` | The test dataset, **generated** from `lib/seed` (the shipped placeholders plus stress cases; `lib/repositories/supabase/seed.ts`; regenerate with `npx vitest run seed -u`). The local Supabase loads it on start. Never pushed to dev or prod |
| `supabase/config.toml` | The local Supabase (CI): sign-ups off, as on dev and prod |
| `lib/repositories/supabase/` | Row mappers, the public and admin repositories, the client |

## Tests

- `migration.test.ts` (unit, offline): migrations, seed and RLS in PGlite (Postgres in WASM).
- `db.test.ts` (`npm run test:db`): the repository contract, RLS, auth and storage against the
  **local** Supabase. It plants and removes rows and throwaway accounts, so it refuses any
  other URL. CI runs it after `npx supabase start` (`.github/actions/local-supabase`), which
  also makes the **test admin** (`scripts/test-admin.mjs`; `E2E_ADMIN_*` in `ci.yml`, local
  only). The e2e suite and Lighthouse run against the same local Supabase.

## Environment

- `.env.local` (template `.env.example`): the **dev** URL and publishable key. `npm run dev`
  then reads and writes dev; that is where content is worked out before it goes to prod.
- Vercel → Environment Variables: **Production** = prod's URL and publishable key;
  **Preview** = dev's. Both: `GITHUB_TOKEN` (read-only, for the heat map). The secret key
  never goes into Vercel.

## Setting up a project (once)

1. Create it on supabase.com (region Mumbai, `ap-south-1`); keep the database password.
2. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up".
3. Apply the schema: `npx supabase link --project-ref <ref>`, then `npx supabase db push`
   (no seed: it is test data; real content goes in through the admin).
4. **The admin account:** Authentication → Users → Add user (Auto Confirm on), then in the SQL
   Editor:
   ```sql
   insert into public.admin_user (user_id) select id from auth.users where email = 'you@example.com';
   ```
   Authentication → URL Configuration → Site URL = the site's address (dev:
   `http://localhost:3000`). An account not on the list gets "That email and password don't
   match." and can write nothing.
5. **The cleanup job's Vault secrets** (the project's own URL and secret key, so set by hand,
   never in a migration):
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
   select vault.create_secret('<that project''s secret key>', 'service_role_key');
   ```
   Both projects have them (prod since 2026-10-18).

**Test accounts:** none on dev or prod. CI's test admin lives only in its local Supabase, made
from values in `ci.yml` (no repository secrets).

## Day to day

- **Content:** dev holds the fictional test persona from `docs/admin-test-content/`
  (git-ignored, filler until the real content is ready); prod holds the original seed until
  the owner copies the real content over from dev.
- **Schema changes:** a new migration (`npx supabase migration new <name>`), pushed to dev,
  then prod: `npx supabase db push --db-url "$SUPABASE_DB_URL"` (`--dry-run` first; prod:
  `$SUPABASE_PROD_DB_URL`). Additive migrations go to prod once the PR is approved, before it
  merges. A non-additive one (a dropped column) goes after the code that no longer reads it is
  deployed.
- **Storage cleanup:** saves remove the files they no longer point at; `public.clean_media()`
  runs daily at 21:30 UTC (pg_cron job `clean-media`) and removes uploads a day old or more
  that no record points at. Preview: `select public.media_orphans();`. Run now:
  `select public.clean_media();`. Stop: `select cron.unschedule('clean-media');`.
- **Caching:** pages are prerendered; an admin save marks them stale
  (`revalidatePath('/', 'layout')`). An edit made in the Supabase dashboard shows after the
  next deploy or admin save.
- **Sample media:** the first two projects in dev and prod point at `public/samples/`; remove
  them in the admin when real media goes in.
