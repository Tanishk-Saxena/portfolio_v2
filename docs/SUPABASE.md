# Supabase

The database behind the site and the admin (brief §6, Phase 6.2). Two projects: **dev**
(local work, Vercel previews, the Supabase tests) and **prod** (the live site).

## What lives in the repo

| Path | What |
|---|---|
| `supabase/migrations/*.sql` | The schema: tables, constraints, `updated_at` triggers, RLS, the `admin_user` allowlist, the `media` bucket. Applied in filename order |
| `supabase/seed.sql` | The shipped placeholder content. **Generated** from the fixtures by `lib/repositories/supabase/seed.ts`; regenerate with `npx vitest run seed -u` |
| `lib/repositories/supabase/` | Row mappers, the public repositories, the client |

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
   `supabase`.
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

## Day to day

- New schema change → a new file in `supabase/migrations/` (`npx supabase migration new
  <name>`), pushed to dev first, then prod.
- Pages are prerendered at build. Until the admin's writes revalidate them (Phase 8.2),
  an edit made directly in the Supabase dashboard shows on the site after the next deploy.
