# portfolio_v2

Tanishk Saxena's portfolio, live at https://tanishk-saxena.vercel.app, plus an admin portal
at `/admin` to edit every piece of its content and the site's style settings.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript strict · Supabase (Postgres,
Auth, Storage) · Vercel.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, on the dev Supabase project (keys in .env.local)
npm run check      # lint + typecheck + format check + unit tests
```

The site and the admin read their content through repository interfaces
(`lib/domain/repositories.ts`), always from Supabase; the keys in `.env.local` (template:
`.env.example`) pick the project. The database suite, the e2e journeys and Lighthouse run in
CI against a throwaway local Supabase loaded with the seed (`lib/seed`); Actions → CI → Run
workflow runs them on any branch.

## Where things are

|                                  |                             |
| -------------------------------- | --------------------------- |
| Status, what's done and next     | `docs/PROGRESS.md`          |
| Plan, architecture, constraints  | `docs/PROJECT-BRIEF.md`     |
| Site design values and decisions | `docs/DESIGN-SPEC.md`       |
| Admin design                     | `docs/ADMIN-DESIGN-SPEC.md` |
| Database setup and workflow      | `docs/SUPABASE.md`          |
| Branching and merge rules        | `CONTRIBUTING.md`           |
| Performance readings             | `docs/PERFORMANCE.md`       |
