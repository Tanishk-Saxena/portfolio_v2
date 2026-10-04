# Supabase

The database behind the site and the admin (brief §6, Phase 6.2). Two projects: **dev**
(local work, Vercel previews, the Supabase tests) and **prod** (the live site).

## What lives in the repo

| Path | What |
|---|---|
| `supabase/migrations/*.sql` | The schema: tables, constraints, `updated_at` triggers, RLS, the `admin_user` allowlist, the `media` bucket (the admin's uploads: `images/`, `files/`, and `media/` for projects' modal media, GIFs and short videos included; replaced files are not cleaned up yet). Applied in filename order |
| `supabase/seed.sql` | The shipped placeholder content. **Generated** from the fixtures by `lib/repositories/supabase/seed.ts`; regenerate with `npx vitest run seed -u` |
| `lib/repositories/supabase/` | Row mappers, the public repositories, the admin's reads (run as the signed-in admin), the client |

Security: RLS is the boundary. Anonymous reads see only published / active, non-deleted
rows; every write (and every read of hidden rows) needs a signed-in user listed in
`public.admin_user`. `proxy.ts` and the admin's pages and handlers check the session too
(defence in depth); they never replace RLS.

## Tests

- `migration.test.ts` runs the migrations, the seed and the RLS policies in PGlite
  (Postgres in WASM), with no project and no Docker. Runs everywhere, CI included.
- `live.test.ts` (`npm run test:live`, local only, ~15 s) runs the repository contract, the
  RLS checks and the admin auth checks (sign-ups off, wrong password, only the allowlisted
  account writes) against the **dev** project in `.env.local`. Run it when a change touches
  the database or auth. It skips without keys. Never point it at prod: it plants and removes
  test rows and throwaway accounts.

## One-time setup (owner)

1. On supabase.com, create two projects, `portfolio-dev` and `portfolio-prod` (region:
   Mumbai, `ap-south-1`). Keep each database password.
2. In each project, under **Authentication → Sign In / Providers**, turn **off** "Allow new
   users to sign up" (the admin is one invited account, Phase 7).
3. Apply the schema and seed to each project. Either run, once per project:

   ```bash
   npx supabase login                          # opens the browser
   npx supabase link --project-ref <ref>       # asks for that project's DB password
   npx supabase db push --include-seed
   ```

   or create a personal access token (Account → Access Tokens) and hand it over for the
   session, so these run non-interactively.
4. Put the **dev** keys in `.env.local` (template: `.env.example`): Project URL, publishable
   key, secret key. Leave `DATA_SOURCE` unset to keep working on fixtures, or set it to
   `supabase`. The admin's lists follow the same setting: sign-in always uses Supabase, but
   with fixtures the lists show the fixtures and saves only change an in-memory copy (lost on
   restart). Use `DATA_SOURCE=supabase npm run dev` to see and edit the dev database in the
   admin.
5. In Vercel → Settings → Environment Variables:
   - **Production**: `DATA_SOURCE=supabase`, prod `NEXT_PUBLIC_SUPABASE_URL` and
     `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - **Preview**: the same three, with the dev project's values.
   - The secret key never goes into Vercel.
6. Redeploy. The site should look identical: it now reads the seeded copy of the same
   content.

## Admin account (owner, once per project)

The admin signs in at `/admin/sign-in` with email + password (Phase 7). Sign-ups are off, so
the account is made by hand, then put on the allowlist:

1. **Authentication → Users → Add user → Create new user**: your email, a strong password,
   **Auto Confirm User** on.
2. **SQL Editor**, run:

   ```sql
   insert into public.admin_user (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

3. **Authentication → URL Configuration**: Site URL = the site's address for that project
   (prod: the live domain; dev: `http://localhost:3000`).

Do it in dev and in prod (one account each, same email is fine). A signed-in account that
isn't on the list sees "That email and password don't match." and can't write anything.
To remove access, delete the row (or the user). `npm run test:live` checks all of this
against dev with throwaway accounts.

**The test admin (dev only).** `e2e-admin@example.com`, made with the secret key and put on
the allowlist (a full admin, like the owner; there are no roles), for the signed-in admin
e2e tests (smoke and axe) in CI's `check` job and locally. Those tests run on a fixtures build, so it signs in through dev but its saves change only the
server's in-memory fixtures. Its password lives in the repository secret `E2E_ADMIN_PASSWORD`
(with `E2E_ADMIN_EMAIL`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY`) and, for local
runs, in `.env.local`. It could write to dev directly if leaked; dev holds only test content.
To rotate: set a new password in Authentication → Users, then update both. Prod has no test
account.

## Day to day

- What dev holds: since the owner's admin test (2026-10-03), the **dev** project has the
  fictional test persona from `docs/admin-test-content/` (git-ignored, local only), not the
  seed. Prod still has the seed until the owner's own smoke test there.
- New schema change → a new file in `supabase/migrations/` (`npx supabase migration new
  <name>`), pushed to dev first, then prod. Without linking, the database URLs in
  `.env.local` work directly: `npx supabase db push --db-url "$SUPABASE_DB_URL" --dry-run`,
  then without `--dry-run` (prod: `$SUPABASE_PROD_DB_URL`, once the PR is approved, before it
  merges, so the deployed code never meets an old schema). Keep migrations additive so the
  live code runs on either side of the push. A migration that can't be additive (a dropped
  column, like `20261005000000_drop_project_summary.sql`) goes the other way round: merge and
  deploy the code that no longer reads the column first, then push the migration. When one
  PR carries both kinds (Phase 9.3 D–E: the dropped column and the additive
  `20261006000000_settings_press_feedback.sql`), `db push` applies them together, so push
  right before merging: pages are prerendered, so visitors see nothing in the minutes until
  the deploy, and only the admin's Projects list would fail in between.
- Sample modal media (owner, 2026-10-04, for testing): the first two live projects in dev
  and prod point at the files in `public/samples/` (two photos, a GIF, an MP4), as the
  fixtures' first two do. Remove them from the admin (Projects → Modal media) when real
  media goes in.
- Pages are prerendered at build. A save in the admin marks them stale
  (`revalidatePath('/', 'layout')`), so the site shows it on the next visit. An edit made
  directly in the Supabase dashboard skips that, and shows after the next deploy or the next
  admin save.
