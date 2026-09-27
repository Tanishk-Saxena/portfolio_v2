# Progress ledger

Current state of the build. Updated before every commit; each commit waits for the owner's
diff review (brief §8).

**Now:** Phase 4 — Motion · done, PR from `feat/phase-4-motion` · next: Phase 5 — Ship

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
| 3.1 | `feat/phase-3-shell` | Screenshot tooling (Playwright on local Chrome); CSS layering fix; shell: `@container/page`, grain, header (signature, theme toggle), footer, section primitives, icons; Hero; About band | ✅ PR #4 |
| 3.2 | `feat/phase-3-sections` | Experience accordion, Projects (cards, show more, modal), Writing, Skills, Quotes, Contact band | ✅ PR #5 |
| 3.3 | `feat/phase-3-nav` | Floating section nav (FAB, arc, curtain) and back-to-top; Playwright e2e suite in CI | ✅ PR #6 |
| 3.4 | `feat/phase-3-article` | `/articles/[slug]` route with Markdown body and Listen; axe audits in e2e; Phase 3 verification (CLS fix, font split) | ✅ PR #7 |

3.1 verification: compared by eye against mockup screenshots at 390px and 1440px (light),
plus dark mode. Hero type scale, highlight chip, CTAs, scroll cue, About band grid and
portrait frame, and footer all match. Found and fixed: unlayered base CSS was beating
Tailwind utilities (résumé button text rendered dark); base styles now live in `@layer base`.

3.2 verification:
- Full page vs mockup at 1440 and 390 (light and dark): section order, rhythm, rules, the
  experience rows, the 3-up project grid, the writing rows, the skills columns, the quote
  block and the Contact band all match.
- Modal opened by clicking a card: side-by-side 880×420 on desktop, stacked on mobile, dark
  mode correct. Container queries work inside the top-layer `<dialog>`.
- Stress dataset (`DATA_SOURCE=fixtures-stress`) found three issues, all fixed:
  - Hero: the scroll cue could collide with long copy. Bottom padding is now
    `max(78px, cue space)`, which moves the normal hero ≈20px higher than the mockup.
  - Experience: rows without a summary lost the caret slot, so dates misaligned. The slot is
    now reserved.
  - Contact: long emails broke mid-word. They now wrap after `@` / `.` (`<wbr>`).

Behaviour notes (3.2):
- Experience body uses grid rows `0fr → 1fr` + `inert` when collapsed; Phase 4 animates it.
- Project card: stretched `<button>` + sibling icon links (no nesting). The overlay shows on
  hover, keyboard focus, narrow container, or `(hover: none)`. Hidden links don't catch clicks.
- Modal: native `<dialog>`, backdrop click closes, `html:has(dialog[open])` locks scroll.
- Show more moves focus to the first revealed item. `#post-<slug>` deep links expand then
  scroll.
- Quotes: all quotes stacked in one grid cell (the box fits the tallest). Dots + play/pause
  (WCAG 2.2.2). Pauses on hover/focus/hidden tab; starts paused under reduced motion.

3.3 verification:
- Closed state (scrolled to Projects): the FAB shows the active section's icon, with
  back-to-top above it. Open: six items on a true quarter-arc (r = 334 wide / 250 at 390px),
  the active item filled with accent, the page blurred behind. Checked light and dark at
  both widths.
- e2e (Playwright, `npm run test:e2e`, 12 tests × desktop/mobile), now also in CI:
  - nav: keyboard open, focus on the active item, Tab trapped, Escape returns focus
  - nav: a destination jumps there and focuses the section
  - modal: focus trap and return
  - show more: focuses the first new card
  - accordion: `aria-expanded`
  - theme: the toggle persists across reload

Behaviour notes (3.3):
- Scroll tracking is `IntersectionObserver` only (a mid-viewport line for the active
  section, the hero's exit at 140px for "past hero"). Zero scroll listeners.
- The arc is CSS: `rotate(θ) translateX(var(--r)) rotate(-θ)`, with `--r` switched by the
  page container query. Phase 4 animates this into the spiral.
- The nav lists only sections that render. Hidden controls are `inert`. After a jump, focus
  moves into the section; after back-to-top, onto the hero heading (no focus ring on these
  `tabindex="-1"` targets).

3.4 notes:
- Article route: statically generated per on-site article; unknown slug → 404; external-only
  → redirect. Markdown rendered on the server with raw HTML dropped (tested). Meta
  description falls back to the first paragraph.
- Matches the mockup at 1440/390. Text links and the Listen button keep their mockup sizes
  (40px Listen) with invisible 44px hit areas (Q4 R2); an SSR spacer holds the meta row's
  height.
- Fixed a real race: `#post-` deep links scrolled before the revealed rows rendered on busy
  devices. Now the scroll waits for the row to exist.

### Phase 3 verification (brief §6)

| Gate | Result |
|---|---|
| Side-by-side vs mockup at 390 / 1440 | ✅ every section, modal, nav and article (by eye, light and dark) |
| axe clean | ✅ `e2e/a11y.spec.ts`: home, open accordion, modal, nav, article × light/dark × desktop/mobile, in CI |
| Lighthouse accessibility 100 | ✅ home and article |
| Lighthouse best practices / SEO | ✅ 100 / 100 (article SEO fixed via a description fallback) |
| CLS < 0.1 | ✅ 0. Was 0.116: `ch`-based max-widths changed when web fonts swapped in, so the hero wrapped to 3 lines then 2. Above-the-fold measures are now `em` equivalents of the mockup's `ch` (identical render) |
| Lighthouse mobile performance ≥ 95, LCP < 2.0 s | ⚠️ **Not yet.** Local runs on this laptop: home 70–86, article 87–91; LCP 2.4–3.8 s (FCP ≈ LCP, text paints immediately). Split the pull-quote italic off the home page (−143 KB preloaded fonts, LCP 4.5 → 3.8 s simulated). Local numbers vary ±15 run to run, so the remaining gap is tracked below and re-measured on a real deployment |

**Tracked perf item (P-1):** measure with PageSpeed Insights on the deployed site (Phase 5).
Levers, in order:
1. Newsreader `opsz` axis costs 72 KB (128 vs 56 KB); the owner decides fidelity vs bytes.
2. Caveat preload (50 KB) could drop if the intro timing allows.
3. The grain layer's full-viewport blend (paint cost).
4. The hydration JS footprint.
Phase 4's intro also changes the LCP picture, so it's re-measured after that.

## Phase 4 — Motion (branch `feat/phase-4-motion`)

Everything in spec §5.3, with the R2 decisions (mockup motion wins; cheap equivalents only where they look identical):

| Moment | Implementation | Reduced motion |
|---|---|---|
| Signature intro | **Shelved** until after Milestone A (see below) | — |
| Hero entrance | Staggered fade-up on load; the H1 (LCP) only rises, never transparent | Static |
| Scroll cue | Wheel loop; fades in on load, out on first scroll or after 8.2s | Static, fades |
| Accordion | Grid-rows height .5s expand curve + fade .38s; caret turns | Fade only |
| Project card | Lift −3px, shadow layer fades in, image blur 3px + scale 1.04 (hover devices only), veil/caption/links settle in | No movement |
| Project modal | Scales out of the clicked card, back into it on close (Escape/backdrop/button all animate); backdrop blur fades | Fade only |
| Floating nav | Spiral: rotating arm, 62ms stagger out, reverse unwind in; FAB appears with scale, glyph turns to ×; back-to-top rises in; curtain fades | Fade in place |
| Writing rows | Padding-left 0 → 16px with the surface wash, as mocked; the date stays pinned right | Background only |
| Quotes | Cross-fade .7s with a 10px rise every 7s; no controls, as mocked; pauses on hover/focus | Fade, no auto-advance |
| Page ↔ article | Owner revision: the page moves as one sheet (list lifts away, article rises in; reverse on Back), never overlapping; header fixed and solid. No title morph | Cross-fade |
| Section entrances | Owner revision: each section fades up the first time it scrolls into view; on-screen-at-load stays static | Static |
| Header | Owner revision: hides reading down, returns on scroll up / tap / focus / near top | Hides without the slide |
| Press ripple | Owner revision: pressed colour spreads from the touch point, fades after release | Fade in place |

Also fixed from owner review: 3-up cards stay 3-up after Show more; card hover no longer lingers after the modal closes; the modal scales from the card actually clicked; Listen's pause glyph (two solid bars) and fixed button width; the hero entrance plays.

[ASSUMED] Quotes auto-advance with no pause control, as mocked. WCAG 2.2.2 is met by intent: rotation pauses on hover/focus, never runs under reduced motion, and a static quote is always readable. Owner's call.

**Signature intro: shelved.** The pen-drawn version (Caveat glyph outlines + skeleton-stroke mask, flying into the navbar) still showed a shift at the hand-off, and cost load time (≈31 KB of glyph data in the HTML/JS). (It also never cleared on the owner's phone, but that was the hydration failure below: no JS ran at all.) The work is parked in `git stash` ("wip: signature intro (shelved from Phase 4)"), with its generator script. It is revisited after Milestone A, and only if it can hand off with zero shift at no perf cost. The navbar signature is live Caveat text again.

**Mobile first (owner direction).** The owner's phone, on the local dev server over the LAN, got a dead page: no theme toggle, cards, Show more. Root cause: Next's dev server serves its JS only to `localhost` unless the origin is listed in `allowedDevOrigins`, so the page never hydrated. Every earlier check ran on localhost and passed. Fixed in `next.config.ts` (this machine's LAN IPv4s, read at startup; dev only).

All owner revisions settled in this phase are recorded as final in `docs/DESIGN-SPEC.md` §10 (they override the mockup). Back from an article now restores the exact previous scroll position before paint (direct visits fall back to `/#writing`); expanded lists stay expanded for the session. About has less top space and a smaller portrait.

Regressions caught in owner review: the section-entrance animation filled forwards and pinned the project dialog's transform (no scale-from-card) → reveals exclude the dialog and fill backwards only. A leftover test server once served a stale build → Playwright always starts a fresh server.

Testing (owner direction, end of Phase 4): trimmed to unit tests for data plus a small e2e smoke suite (home loads/hydrates, theme, project modal, section nav, article + Back, 404) and axe on both pages in both modes, on desktop + mobile Chrome. The WebKit/device/motion suites were removed: flaky on Windows WebKit, slow, and testing UI details rather than behaviour.

Later owner rounds (all in spec §10): Show more as a sequence (button glides, page follows, items fade in one by one) and Show less; ripple polish (one speed, touch-scroll cancel, border coverage, inverse back-to-top, nav selection); header auto-hide on phones only; jumps land flush without the divider; reload opens at the URL's #section with no hero flash (URL follows the section being read); articles keep native scroll restoration; scroll cue ends after three loops; tighter section rhythm; About balanced. Then: Show less as the exact reverse of Show more (landing rules in spec §10); reload positioned once (no late yank); phones land exactly on #writing from an article or the 404; `#hero` never in the URL; phones return from an article without a view transition (article slides out, home settles in); a designed 404 (`app/not-found.tsx`).

Writing rows (owner's call): the read time sits on its own line under the title; the date stays right, level with the title's first line.

Back to top (owner's call) is now a plain `#hero` link, like the header signature: no JS, the URL follows the scroll (a reload no longer jumps back to the last section's hash), native scrolling honours scroll-behavior/reduced motion.

Experience rows: dates and caret are one group, baseline-aligned with the role's first line. On mobile the caret no longer floats at the middle of the two-line block.


## Phase 5 — Ship

Not started.

---

## Notes / decisions made during the build

- `@types/node` bumped to `^24` (Vitest 5 peer requirement; local Node is 26).
- Tailwind colour utilities are named `paper`, `surface`, `ink`, `muted`, `accent`, `accent-fill`
  (e.g. `bg-paper`, `text-ink`), so `bg-bg` / `text-text` are avoided.
- Dark mode is attribute-driven: `@custom-variant dark` on `[data-theme='dark']`.
- `typecheck` runs `next typegen` first, because `LayoutProps`/`PageProps` are generated.
- Visual checks: `node scripts/screenshot.mjs <url> [outDir]` → full-page 390/1440 × light/dark
  (Playwright on local Chrome, reduced motion forced); `--selector=#id` for close-ups,
  `--click=<selector>` to open a dialog or menu first. Mockup reference:
  `file:///…/docs/design/artifacts/Portfolio.dc.html?introEnabled=false`.
- Custom CSS in `styles/tokens.css` must be in `@layer base` / `@layer components`;
  unlayered rules beat Tailwind utilities.
- Theme toggle label is "Dark mode" with `aria-pressed` (toggle-button pattern) rather than
  the mockup's "Toggle colour mode". Invisible a11y refinement.
