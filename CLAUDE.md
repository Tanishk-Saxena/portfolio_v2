# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

Personal portfolio for Tanishk Saxena (frontend engineer, TypeScript/Angular trading UIs) plus an auth-secured admin portal to edit its content. Stack: Next.js 16, React 19, Tailwind v4, TypeScript strict. Milestone A (the public site, Phases 0–5) is live. Milestone B (Supabase + admin, Phases 6–8) is underway: Phases 6–7 are done (the live site reads Supabase; `/admin` sign-in works in dev and prod), Phases 8.1–8.3 are built (the admin shell; the editor and saving for Hero, About, Contact, Experience, Skills, Quotes; list actions: toggles, reorder, duplicate, delete + Undo, 409). Phase 8.4 (Projects and Writing editors, Markdown, uploads) is next. Check `docs/PROGRESS.md` for the current phase and step before starting work.

Read these before doing any work; they are the source of truth:

- `docs/PROJECT-BRIEF.md` — stack, architecture rules, content model, phased plan, constraints (functionality gates; perf and a11y flagged). **Everything non-visual.**
- `docs/design/HANDOFF.md` — build checklist, tokens, breakpoints, a11y requirements for the design.
- `docs/design/DESIGN.md` — design rationale, section structure, signature interactions, still-open design options.
- `docs/design/artifacts/*.dc.html` — the Claude Design mockups (`Portfolio`, `Article`, `Mobile preview`, `Dev notes` = behaviour spec). Single-file HTML rendered via `support.js`; they are a _reference spec_, not code to port. Open them in a browser to inspect behaviour.
- `docs/DESIGN-SPEC.md` — exact values extracted from the mockup, plus resolved decisions tagged `[ASSUMED]` (§9 lists them). Build from this.
- `docs/ADMIN-DESIGN-SPEC.md` — the same for the admin (Milestone B): values, behaviour, content-model reconciliation, API, `[ASSUMED]` decisions (§13), owner revisions (§14). Sources: `docs/design/ADMIN-DESIGN.md`, `ADMIN-HANDOFF.md`, `artifacts/Admin.dc.html`, `Field.dc.html`, `admin-data.js`, `ADMIN-Dev notes.dc.html`. Where the admin mockup describes the site (palette, sample copy, Settings options), the shipped site wins (§1).

Precedence: **owner revisions in `docs/DESIGN-SPEC.md` §10 win over everything**; after those, **the mockup wins every contradiction** (brief §0.1). When the owner settles a change in conversation, record it in §10. Meet the brief's rules by intent, invisibly where possible.

Owner's standing direction (brief §0.1): keep the site smooth on older phones without stripping motion. Motion is a crafted feature, subtle in tone. Don't block on questions: make a call, tag it `[ASSUMED]`, keep going.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build
npm run lint          # eslint, zero warnings allowed (docs/** ignored)
npm run typecheck     # next typegen + tsc --noEmit (LayoutProps/PageProps come from typegen)
npm run format        # prettier --write (Tailwind class sorting); format:check in CI
npm run test          # unit tests (offline, ~8 s); single file: npx vitest run path/to/file.test.ts
npm run test:live     # the dev Supabase project: contract, RLS, auth (needs .env.local; run when DB/auth changes)
npm run check         # lint + typecheck + format:check + test
npm run test:e2e      # Playwright critical paths (e2e/) against `next start`; run `npm run build` first
```

CI (`.github/workflows/ci.yml`) runs the same checks plus `build` on every PR and push to `main`.

Data source: `DATA_SOURCE=fixtures` (default, shipped content) · `fixtures-stress` (awkward content, used for layout checks) · `supabase` (dev project keys in `.env.local`, see `docs/SUPABASE.md`). Set in `.env.local` or inline: `DATA_SOURCE=fixtures-stress npm run dev`. Pages get data from `getRepositories()` in `lib/container.ts`, never from `lib/repositories/**` (ESLint enforces this). The admin reads through `getAdminRepositories()` (same `DATA_SOURCE`, hidden rows included; over Supabase it runs as the signed-in admin, per request, via `loadAdminContent()` in `lib/admin/content.ts`). So with the default fixtures, the admin lists show fixtures even when signed in, and its saves change a per-process working copy of them (lost on restart); use `DATA_SOURCE=supabase` to edit the dev database.

Visual checks: `npm run build && npx next start -p 3100`, then headless Chrome screenshots. For 390px, load the page inside a 390px-wide `<iframe>`, because headless Chrome won't size its window below ~500px.

## Architecture (planned — see brief §4)

- **Repository boundary is the core rule.** Components never import fixtures or call Supabase. All data goes through interfaces in `lib/domain/repositories.ts` returning domain types from `lib/domain/types.ts`. Implementations live in `lib/repositories/{fixtures,supabase}/`; `lib/container.ts` is the single composition root (ideally env-switched). Every repository method is `async`, even over sync fixtures. Repository tests target the interface so the same suite runs against both implementations.
- Layout: `app/(site)/page.tsx` (single-page public site), `app/admin/` + `app/api/admin/` (auth in `lib/auth/`, guard in `proxy.ts`; pages and handlers re-check with `getAdmin()`), `components/{sections,ui,admin}/`, `styles/tokens.css` (all tokens, both modes, reduced-motion).
- Styling: Tailwind utilities driven by CSS-custom-property tokens (Tailwind v4 `@theme` in CSS; there is no `tailwind.config`). Hand-written CSS only in `tokens.css` or where utilities can't express it. No magic values.
- Conventions: kebab-case filenames, one PascalCase component per file, ≤200 lines per component file, Server Components by default, conventional commits.

## Design essentials

- Tokens live in `styles/tokens.css` (ship values from DESIGN-SPEC §1.1a: muted `#6D655C`, accent `#A9491F`, dark accent = accent + 24% white, `accent-fill` for filled surfaces in both modes).
- Fonts: Newsreader display/long-form, IBM Plex Sans UI/body, Caveat 600 only for the signature and the hero's highlighted word.
- Single breakpoint at 760px, via container queries on the `page` container (`@wide:`); mobile (390px) first; measure 1140px (760px articles).

## Constraints (functionality gates; performance and a11y are flagged, never blocking)

- **Mobile first.** Build for 390px touch first, using platform features that work everywhere (native elements, CSS, transform/opacity) so behaviour is right by construction. Check changed UI on a phone-sized touch viewport (and on the owner's phone via the LAN IP; `allowedDevOrigins` in `next.config.ts` makes that work).
- **Testing is lean (owner direction).** Unit tests for data/logic (repositories, migrations + RLS in PGlite, the admin gate; the dev Supabase project via `npm run test:live`). Prefer one test per behaviour with several assertions over many tiny tests. E2E is a small smoke suite for major flows only (`e2e/smoke.spec.ts`, one journey per area, blocking in CI; `e2e/a11y.spec.ts`, axe, a non-blocking warning in CI): outcomes, never timings, pixels or animation details. Both run on desktop and phone viewports (a11y is never judged on one device). No tests for purely visual UI (ripples, entrances). CI pins a results table to the PR (one comment, `scripts/test-summary.mjs`) and publishes every test to the run's Summary page (dorny/test-reporter). Don't gate small fixes on the full suite; run what's relevant, and the full suite before a PR. A change that needs edits to unrelated files is a design smell.
- Targets, tracked in `docs/PERFORMANCE.md` and flagged when missed (never a blocker, brief §3): LCP < 2.0s, CLS < 0.1. Don't hide the LCP text behind an opacity-0 entrance.
- WCAG 2.1 AA, keyboard operable, 44px hit areas (invisible extension is fine), `prefers-reduced-motion` gives a static but fully usable site.
- No scroll hijacking. Prefer transform/opacity; small contained exceptions per brief §0.1.
- Components must survive variable-length content (long titles, empty optional fields, extra items).

## Working agreement

Phases in order, built in small steps with spaced-out commits. No approval needed to _build_, but **before every commit, stop and ask the owner to review the diff**, then commit only once they approve.

Branching (full rules in `CONTRIBUTING.md`): trunk-based, no `develop`. All work happens on a short-lived `<type>/<desc>` branch (phase work: `feat/phase-<n>-<scope>`) cut from an up-to-date `main`. When a unit is done, push the branch and open a PR into `main` with `gh pr create` (the template fills itself in). CI `check` must pass. **The owner merges**, rebase-and-merge by default. Local hooks block commits and pushes to `main`; never bypass them with `--no-verify`. `gh` lives at `C:\Program Files\GitHub CLI\gh.exe`; in PowerShell, refresh `$env:Path` from the Machine and User scopes first. Keep the ledger `docs/PROGRESS.md` current (phase, step, done, next) and update it before proposing each commit.

**Docs move with the code, in the same PR.** The files that carry state between sessions are `CLAUDE.md` (project state), `docs/PROGRESS.md` (status line, phase rows, notes), the brief and specs, runbooks (`docs/SUPABASE.md`, `CONTRIBUTING.md`), `README.md`, `.github/pull_request_template.md`, and the auto-memory files. A PR that changes a fact one of them states updates it in that PR, written as it will read once merged (the ledger's status line included), never in a later sweep. Before proposing any commit, in this order:

1. **List what changed from the diff, not from memory.** Run `git diff main --stat` and `git diff main --name-status`. Every added, renamed or deleted file, every changed npm script, command, route or env var, and every count or status the PR changes (tests, steps, phases) is a fact to chase.
2. **Grep for each old fact and fix every hit.** For each deleted or renamed file, grep the whole repo (docs, comments, configs, memory) for its old path _and_ its bare file name. Do the same for an old script name, old number or old status. A doc that must still mention something gone says so in words ("… (removed)").
3. **Walk the state files.** Open each file in the list above and check its claims against the diff: the status line and phase rows, `CLAUDE.md`'s project state and commands, the runbooks' steps, the README's commands. Fix them in this PR, written as they will read once merged.
4. **Edit prose with the Edit tool, not scripts.** sed or node replacements can splice sentences or half-apply. If a script edited prose, read every line it touched.
5. **Read the whole staged diff back** (`git diff --cached`), line by line, before asking for review.

After a merge, `main` should already be correct. Pull it and confirm the status line in `docs/PROGRESS.md` names the next step.

Don't claim something "matches the design" without comparing against the mockup. The admin is built from `docs/ADMIN-DESIGN-SPEC.md`; never improvise admin UI beyond it.
