# CLAUDE.md

Guidance for Claude Code in this repository.

@AGENTS.md

## Project state

Tanishk Saxena's portfolio (live at https://tanishk-saxena.vercel.app) plus an auth-secured
admin at `/admin` that edits every piece of its content and its style settings. Next.js 16,
React 19, Tailwind v4, TypeScript strict, Supabase, Vercel. **The build is complete (Phases
0–10).** Next: **one data path** (Supabase only, tested against a throwaway local Supabase in
CI; the plan is in `docs/PROGRESS.md`), then the owner's end-to-end test round. Check
`docs/PROGRESS.md` before starting work.

## Sources of truth

- `docs/PROGRESS.md`: status, next step, open items, the owner's test list, the Phase 9
  roadmap index (code cites its item numbers).
- `docs/PROJECT-BRIEF.md`: everything non-visual: standing direction, stack, constraints,
  architecture, content model, working agreement.
- `docs/DESIGN-SPEC.md` (site) and `docs/ADMIN-DESIGN-SPEC.md` (admin): look and behaviour as
  shipped; `[ASSUMED]` decisions (§9 / §13) and **owner revisions (§10 / §14), which win over
  everything**. When the owner settles a change in conversation, record it there. Code cites
  their section numbers and Q ids: keep them stable.
- `docs/SUPABASE.md` (database runbook), `docs/PERFORMANCE.md` (readings, P-1),
  `CONTRIBUTING.md` (branching).

Owner's standing direction (brief §0): meet rules by intent, invisibly; keep the site smooth
on older phones without stripping motion; motion is crafted and subtle; don't block on
questions (make a call, tag it `[ASSUMED]`); **simplicity and reliability first: before
building any check, workflow or process, compare it with what the PR checks already cover,
and challenge it if it repeats them**.

## Commands

```bash
npm run dev           # :3000
npm run build
npm run lint          # eslint, zero warnings (docs/** ignored)
npm run typecheck     # next typegen + tsc --noEmit
npm run format        # prettier --write (Tailwind class sorting); format:check in CI
npm run test          # unit tests (offline); one file: npx vitest run path/to/file.test.ts
npm run test:live     # against the dev Supabase project (.env.local); when DB/auth changes
npm run check         # lint + typecheck + format:check + test
npm run test:e2e      # Playwright (e2e/) against `next start`, after DATA_SOURCE=fixtures npm run build
                      # signed-in admin tests need E2E_ADMIN_EMAIL/PASSWORD in .env.local (else skip)
npm run lighthouse    # after a build: home, article, sign-in; mobile + desktop (a reading)
```

CI (`.github/workflows/ci.yml`) on every PR and push to `main`: `check` (lint, typecheck,
format, unit, build, smoke e2e blocking; axe a warning) and a separate `lighthouse` job (a
reading, never red). `check` builds on fixtures and signs in through the dev project as its
**test admin** (repository secrets `E2E_*`; no secret key in CI); saves stay in memory.

Data source (until the one-data-path refactor): `DATA_SOURCE=fixtures` (default) ·
`fixtures-stress` (awkward content) · `supabase` (dev keys in `.env.local`). Pages read via
`getRepositories()` (`lib/container.ts`), never `lib/repositories/**` (ESLint enforces it);
the admin via `getAdminRepositories()`, as the signed-in admin over Supabase. On fixtures the
admin's saves change an in-memory copy, lost on restart.

Visual checks: `npm run build && npx next start -p 3100`, then `node scripts/screenshot.mjs
<url>` (390 / 1440 × light / dark). For 390px, headless Chrome needs a 390px-wide `<iframe>`.

## Constraints

Functionality gates; performance and accessibility are flagged, never blocking (brief §3).

- **Mobile first** at 390px touch; platform features (native elements, CSS, transform /
  opacity). Check changed UI on a phone viewport, and on the owner's phone via the LAN IP
  (`allowedDevOrigins` in `next.config.ts`).
- **Lean testing.** Unit tests for data and logic (one test per behaviour, several
  assertions). E2E: one smoke journey per area (`e2e/smoke.spec.ts`, blocking) and axe
  (`e2e/a11y.spec.ts`, `e2e/admin-a11y.spec.ts`, warnings), desktop and phone. Outcomes only:
  no timings, pixels or animation details; no tests of purely visual UI. Run what's relevant
  for small fixes, the full suite before a PR.
- LCP < 2.0 s, CLS < 0.1 (`docs/PERFORMANCE.md`); never hide the LCP text behind an opacity-0
  entrance. WCAG 2.1 AA, keyboard operable, 44px hit areas, reduced motion fully usable. No
  scroll hijacking. Components survive long, empty and extra content.
- Architecture and conventions: brief §4 (repository boundary; ≤ 200 lines per component;
  Server Components by default; tokens, no magic values). A change that needs edits to
  unrelated files is a design smell.

## Working agreement

No approval needed to build, but **before every commit, ask the owner to review the diff**,
and commit only once they approve.

Branching (`CONTRIBUTING.md`): trunk-based; short-lived `<type>/<desc>` branches from an
up-to-date `main`; a PR into `main` with `gh pr create`; CI `check` green. **The owner
merges** (rebase-and-merge); Claude merges only when the owner says the work is finished and to
merge it, and never sets auto-merge. Hooks block commits and pushes to `main`; never
`--no-verify`. `gh` is at `C:\Program Files\GitHub CLI\gh.exe` (in PowerShell, refresh
`$env:Path` from the Machine and User scopes first).

**Docs move with the code, in the same PR.** State files: `CLAUDE.md`, `docs/PROGRESS.md`, the
brief and specs, `docs/SUPABASE.md`, `docs/PERFORMANCE.md`, `CONTRIBUTING.md`, `README.md`,
`.github/pull_request_template.md`, and the memory files. Write them as they will read once
merged. Before proposing a commit:

1. **List what changed from the diff** (`git diff main --stat`, `--name-status`): every added,
   renamed or deleted file, script, command, route, env var, count or status.
2. **Grep for each old fact** (old paths and bare file names, old names and numbers) and fix
   every hit. A doc that must mention something gone says so ("… (removed)").
3. **Walk the state files** against the diff.
4. **Edit prose with the Edit tool**, not scripts; if a script touched prose, read every line.
5. **Read the whole staged diff back** before asking for review.

**Before every merge, remind the owner to ask for a docs pass**; when asked, update every state
file and the memory files, then merge. After a merge, pull `main` and confirm the ledger names
the next step.

Don't claim something matches the design without checking it against the spec. Never
improvise admin UI beyond `docs/ADMIN-DESIGN-SPEC.md`.
