# portfolio_v2

Tanishk Saxena's portfolio, live at https://tanishk-saxena.vercel.app, plus an admin portal
at `/admin` to edit every piece of its content and the site's style settings.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript strict · Supabase (Postgres,
Auth, Storage) · Vercel.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, on the shipped fixture content
npm run check      # lint + typecheck + format check + unit tests
```

The site and the admin read their content through repository interfaces
(`lib/domain/repositories.ts`). `DATA_SOURCE` picks the source for both: `fixtures`
(default), `fixtures-stress` (awkward content for layout checks) or `supabase` (needs the
keys in `.env.local`; template: `.env.example`).

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
