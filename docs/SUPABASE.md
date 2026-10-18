# Supabase

Two projects: **dev** (local work, Vercel previews, `npm run test:live`) and **prod** (the
live site). RLS is the security boundary: anonymous reads see only published / active,
non-deleted rows; every write, and every read of hidden rows, needs a signed-in user in
`public.admin_user`. `proxy.ts` and the admin's handlers check the session too, but never
replace RLS.

## In the repo

| Path | What |
|---|---|
| `supabase/migrations/*.sql` | The schema, applied in filename order: tables, constraints, triggers, RLS, the allowlist, the `media` bucket (`images/`, `files/`, `media/`), the cleanup job |
| `supabase/seed.sql` | The placeholder content, **generated** from the fixtures (`lib/repositories/supabase/seed.ts`; regenerate with `npx vitest run seed -u`) |
| `lib/repositories/supabase/` | Row mappers, the public and admin repositories, the client |

## Tests

- `migration.test.ts`: migrations, seed and RLS in PGlite (Postgres in WASM). Runs in CI.
- `live.test.ts` (`npm run test:live`, local only): the repository contract, RLS and auth
  against **dev** (`.env.local`). Run it when a change touches the database or auth. It
  plants and removes test rows and throwaway accounts: **never point it at prod**.

## Environment

- `.env.local` (template `.env.example`): the **dev** URL, publishable key and secret key;
  `DATA_SOURCE=supabase` to read and edit dev locally (unset = fixtures; the admin's saves then
  change only an in-memory copy).
- Vercel → Environment Variables: **Production** = `DATA_SOURCE=supabase` + prod's URL and
  publishable key; **Preview** = the same with dev's. Both: `GITHUB_TOKEN` (read-only, for the
  heat map). The secret key never goes into Vercel.

## Setting up a project (once)

1. Create it on supabase.com (region Mumbai, `ap-south-1`); keep the database password.
2. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up".
3. Apply the schema and seed: `npx supabase link --project-ref <ref>`, then
   `npx supabase db push --include-seed`.
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

**The test admin (dev only):** `e2e-admin@example.com`, on the allowlist, used by CI's
signed-in tests. Its password is the repository secret `E2E_ADMIN_PASSWORD` (with
`E2E_ADMIN_EMAIL`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY`) and in `.env.local`. To
rotate: a new password in Authentication → Users, then both places. Prod has no test account.

## Day to day

- **Content:** dev holds the fictional test persona from `docs/admin-test-content/`
  (git-ignored); prod holds the seed until the owner replaces it.
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
