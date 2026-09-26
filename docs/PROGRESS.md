# Progress ledger

Current state of the build. Updated before every commit; each commit waits for the owner's
diff review (brief §8).

**Now:** Phase 3 — Public site · PR 1 of 4 (`feat/phase-3-shell`) built and verified,
awaiting diff review

---

## Phase 0 — Repo and design extraction ✅

- [x] Scaffold Next.js 16 · `1d1e936`
- [x] Brief, handoff and mockups in `docs/` · `cfdb3ce`
- [x] `docs/DESIGN-SPEC.md` extracted; open items resolved as `[ASSUMED]` · `cbc3cd2`
- [x] Owner direction recorded (brief §0.1, spec Revision 2) · `85874fd`

## Phase 1 — Foundation ✅

| Step | Scope | Status |
|---|---|---|
| 1.1 | Tooling: Prettier (+ Tailwind plugin), Vitest + Testing Library, `lint`/`typecheck`/`format`/`test`/`check` scripts, GitHub Actions CI, ESLint ignores `docs/**`, ledger + working agreement | ✅ `53cc1fe` |
| 1.2 | Token layer: `styles/tokens.css` (both modes, bands, focus ring, reduced motion, grain, keyframes), `app/globals.css` `@theme` mapping, `next/font`, root layout + pre-paint theme script | ✅ `b68ecbb` |
| 1.3 | `/tokens` verification page; template assets removed; home stub at `app/(site)/page.tsx` | ✅ `778ed27` |
| 1.4 | Verification (below) + CLAUDE.md commands refreshed | ✅ `05772a6` |
| 1.5 | GitHub remote (private `Tanishk-Saxena/portfolio_v2`), first CI run green on `main` | ✅ |
| 1.6 | Branching strategy + safeguards: `CONTRIBUTING.md`, PR template, local hooks blocking commits/pushes to `main`, `.gitattributes` for hooks, repo merge settings (squash/rebase only, delete on merge), CI actions bumped to v5 | ✅ PR #2 → `b6b5e25` |

Verification checklist (brief §6, adjusted: everything local first):
- [x] Local production build renders `/tokens` with every token in both modes. Screenshots
      checked at 1440px (side by side) and 390px (true 390px iframe): fonts load, dark
      accent is derived, band fill stays the same in both modes, no horizontal overflow.
- [x] Lint gate rejects a deliberately introduced error (`no-var` → exit 1), and is clean
      again after the revert (exit 0).
- [x] The same rejection **in CI**: throwaway PR #1 failed at `npm run lint` on the planted
      `no-var`, then was closed and its branch deleted.
- [x] Server-side enforcement: repo made public; ruleset `main protection` active (PR required,
      `check` required and up to date, linear history, no force-push/deletion, no bypass).
- Deployment (host choice and setup) is **deferred to Phase 5**, by owner decision.

## Phase 2 — Domain and fixtures (branch `feat/phase-2-domain`)

| Step | Scope | Status |
|---|---|---|
| 2.0 | Post-merge doc fixes: CONTRIBUTING safeguards table (ruleset active, auto-merge note), ledger | ✅ committed |
| 2.1 | Domain types (`lib/domain/types.ts`, spec §7) + async repository interfaces with an ordering/copy contract (`lib/domain/repositories.ts`) | ✅ committed |
| 2.2 | Fixture repositories over a `FixtureDataset`; shipped content (`lib/repositories/fixtures/data/`); stress dataset; composition root `lib/container.ts` (`DATA_SOURCE`) | ✅ committed |
| 2.3 | Contract suite (`lib/repositories/repository-contract.ts`) run against default + stress sets; container tests; ESLint repository boundary; `vitest.config.mts` | ✅ committed |
| 2.4 | PR into `main` | open, awaiting owner merge |

Verification checklist (brief §6):
- [x] Repository tests pass against the interface: 23 tests, contract run on both datasets
- [x] No component imports fixture data: enforced by ESLint `no-restricted-imports` on
      `app/**` and `components/**` (a probe import failed lint as intended)
- [x] Every method returns a Promise (asserted in the contract)
- [x] Awkward cases present in the stress set (long role title, 5+ roles, empty summary,
      no live/repo URLs, 0 and 7 tags, external-only article, no headline highlight,
      long email, 12-item skill group)

**Content strategy (owner decision, brief §5):** everything ships as placeholders, i.e. the
mockup's copy verbatim, `example.com` links, the mockup's image frames, and
`public/placeholder/resume.pdf`. The placeholders seed Supabase in Phase 6; the owner
replaces them through the admin portal (Phase 8). Nothing blocks on real content.

Phase 2 merged: PR #3.

## Phase 3 — Public site (layout and behaviour; motion is Phase 4)

Split into four PRs so each stays reviewable:

| PR | Branch | Scope | Status |
|---|---|---|---|
| 3.1 | `feat/phase-3-shell` | Screenshot tooling (Playwright on local Chrome); CSS layering fix; shell: `@container/page`, grain, header (signature, theme toggle), footer, section primitives, icons; Hero; About band | built, awaiting review |
| 3.2 | `feat/phase-3-sections` | Experience accordion, Projects (cards, show more, modal), Writing, Skills, Quotes, Contact band | todo |
| 3.3 | `feat/phase-3-nav` | Floating section nav (FAB, arc, curtain) and back-to-top | todo |
| 3.4 | `feat/phase-3-article` | `/articles/[slug]` route with Markdown body | todo |

3.1 verification: compared by eye against mockup screenshots at 390px and 1440px (light),
plus dark mode. Hero type scale, highlight chip, CTAs, scroll cue, About band grid and
portrait frame, and footer all match. Found and fixed: unlayered base CSS was beating
Tailwind utilities (résumé button text rendered dark); base styles now live in `@layer base`.

## Phase 4 — Motion · Phase 5 — Ship

Not started.

---

## Notes / decisions made during the build

- `@types/node` bumped to `^24` (Vitest 5 peer requirement; local Node is 26).
- Tailwind colour utilities are named `paper`, `surface`, `ink`, `muted`, `accent`, `accent-fill`
  (e.g. `bg-paper`, `text-ink`), so `bg-bg` / `text-text` are avoided.
- Dark mode is attribute-driven: `@custom-variant dark` on `[data-theme='dark']`.
- `typecheck` runs `next typegen` first, because `LayoutProps`/`PageProps` are generated.
- Visual checks: `node scripts/screenshot.mjs <url> [outDir]` → full-page 390/1440 × light/dark
  (Playwright on local Chrome, reduced motion forced). Mockup reference:
  `file:///…/docs/design/artifacts/Portfolio.dc.html?introEnabled=false`.
- Custom CSS in `styles/tokens.css` must be in `@layer base` / `@layer components`;
  unlayered rules beat Tailwind utilities.
- Theme toggle label is "Dark mode" with `aria-pressed` (toggle-button pattern) rather than
  the mockup's "Toggle colour mode". Invisible a11y refinement.
