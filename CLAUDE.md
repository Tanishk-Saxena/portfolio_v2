# CLAUDE.md

Guidance for Claude Code in this repository.

@AGENTS.md

## Project state

Tanishk Saxena's portfolio (live at https://tanishk-saxena.vercel.app) plus an auth-secured
admin at `/admin` that edits every piece of its content and its style settings. Next.js 16,
React 19, Tailwind v4, TypeScript strict, Supabase, Vercel. **The build is complete (Phases
0–10), and there is one data path: Supabase**, tested in CI against a throwaway local
Supabase loaded with the seed. The owner's review round is merged (PR #67) and its migration
is on dev and prod; a cosmetic round followed (PR #69: hand-written intro, gradients, curved
bands), then the temporary **style lab** (PR #72: Settings → Style lab tries palettes and hero
backgrounds on the live site). Next: the owner picks a palette and background with the other
open settings, then the lab and the unneeded options go; then the end-to-end test round on prod (the owner is entering real content on dev, then copies it to prod). Check
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
npm run check         # lint + typecheck + format:check + test (all that runs without Docker)
# Need a local Supabase (`npx supabase start`, Docker), so CI runs them; they refuse any other:
npm run test:db       # the repository contract, RLS, auth, storage
npm run test:e2e      # Playwright (e2e/) against `next start`, after `npm run build`
npm run lighthouse    # after a build: site + signed-in admin; mobile + desktop (a reading)
```

CI (`.github/workflows/ci.yml`), on every PR, every push to `main`, and **by hand** (Actions →
CI → Run workflow, any branch): `check` (lint, typecheck, format, unit; then a local Supabase
with the seed and the test admin, `.github/actions/local-supabase`; the database suite, build,
smoke e2e, all blocking; axe a warning) and a separate `lighthouse` job (the site and the
signed-in admin; a reading, never red). No repository secrets; dev and prod are never touched.
Dependabot (`.github/dependabot.yml`) opens update PRs: npm weekly (minor and patch grouped; no majors),
Actions monthly, security fixes at once; they run the full checks and the owner merges.

Data: one path, Supabase. Pages read via `getRepositories()` (`lib/container.ts`), never
`lib/repositories/**` or `lib/seed` (ESLint enforces it); the admin via
`getAdminRepositories()`, as the signed-in admin. Which project is only a matter of keys: dev
in `.env.local`, prod in Vercel, CI's local one in CI. `lib/seed` is the one dataset: the
shipped placeholders plus stress cases at the real limits; it generates `supabase/seed.sql`
and feeds unit tests of pure logic.

Visual checks: `npm run build && npx next start -p 3100` (reads dev, from `.env.local`), then
`node scripts/screenshot.mjs <url>` (390 / 1440 × light / dark). For 390px, headless Chrome
needs a 390px-wide `<iframe>`.

## Constraints

Functionality gates; performance and accessibility are flagged, never blocking (brief §3).

- **Mobile first** at 390px touch; platform features (native elements, CSS, transform /
  opacity). Check changed UI on a phone viewport, and on the owner's phone via the LAN IP
  (`allowedDevOrigins` in `next.config.ts`).
- **Lean testing.** Unit tests for data and logic (one test per behaviour, several
  assertions). E2E: one smoke journey per area (`e2e/smoke.spec.ts`, blocking) and axe
  (`e2e/a11y.spec.ts`, `e2e/admin-a11y.spec.ts`, warnings), on three projects: Chrome desktop,
  Chrome phone, and Safari's engine on an iPhone profile (`iphone-safari`). Outcomes only:
  no timings, pixels or animation details; no tests of purely visual UI. Run what's relevant
  for small fixes, the full suite before a PR.
- **Accessible by construction, so real content never needs an audit.** Anything content or a
  setting could break is closed in code: the renderer (one h1, named links, safe hrefs), the
  admin's validation (image descriptions, link words, labels, caps), names derived from
  content (portrait, modal media), clamps (grain ≤ `GRAIN_MAX`). A new content-driven risk
  gets the same treatment; the PR checks and Vercel's metrics are the only readings.
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
