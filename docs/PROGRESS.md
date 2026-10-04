# Progress ledger

Current state of the build. Updated before every commit; each commit waits for the owner's
diff review (brief §8).

**Now:** Phase 9, planned in full (the **Phase 9 roadmap**, owner, 2026-10-04) · 9.1 (Lighthouse CI) and 9.4 (test infrastructure: a dev test admin; a blocking admin journey and admin axe in CI; site open states) complete · 9.3 under way: roadmap B (items 4–7, the bugs) and C (items 8–15, admin UI/UX) done; D (site UI/UX, items 16–21), E (drag to reorder) and F (media) done: **9.3 is complete**; 9.2 (site title and description) done · **9.5 under way** (re-evaluation outcomes and chosen features): items 30 (experience descriptions in Markdown), 31 (contact links as a list) and 32 (storage cleanup; **its migration is on dev, push it to prod before merging**) done; 29e (the GitHub heat map; **its migration is on dev: push it to prod before merging, the deployed site reads the new column**) done · next: the comparison page for items 25 and 28a (the owner picks), from "What's left of Phase 9" below; each item built also adds a line to **the owner's test list** (a running list of what to verify by hand, kept apart from the remaining work). Phase 10, the final audit, is last

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
| axe clean | ✅ `e2e/a11y.spec.ts`: home and article × light/dark × desktop/mobile, in CI (open accordion, modal and nav are not audited separately) |
| Lighthouse accessibility 100 | ✅ home and article |
| Lighthouse best practices / SEO | ✅ 100 / 100 (article SEO fixed via a description fallback) |
| CLS < 0.1 | ✅ 0. Was 0.116: `ch`-based max-widths changed when web fonts swapped in, so the hero wrapped to 3 lines then 2. Above-the-fold measures are now `em` equivalents of the mockup's `ch` (identical render) |
| Lighthouse mobile performance ≥ 95, LCP < 2.0 s | ⚠️ **Not yet.** Local runs on this laptop: home 70–86, article 87–91; LCP 2.4–3.8 s (FCP ≈ LCP, text paints immediately). Split the pull-quote italic off the home page (−143 KB preloaded fonts, LCP 4.5 → 3.8 s simulated). Local numbers vary ±15 run to run, so the remaining gap is tracked below and re-measured on a real deployment |

**Tracked perf item (P-1):** moved to `docs/PERFORMANCE.md` (Phase 5), with every reading so far.

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


## Phase 5 — Ship (branch `feat/phase-5-ship`)

| Step | Scope | Status |
|---|---|---|
| 5.1 | Site URL (`lib/site.ts`: `NEXT_PUBLIC_SITE_URL` → Vercel production domain → localhost); metadata (`metadataBase`, Open Graph, Twitter `summary_large_image`, canonicals, article `og:type=article`); share cards via `next/og` (home = the hero, article = title in accent), prerendered at build; app icons (Caveat "T" on the accent chip) + `favicon.ico`; `robots.txt`, `sitemap.xml`; JSON-LD (`ProfilePage` → `Person`, `BlogPosting` per article); Vercel Analytics + Speed Insights | ✅ built, awaiting review |
| 5.2 | Deploy to Vercel: project `portfolio-v2`, git-connected (main → production, branches → previews), live at https://tanishk-saxena.vercel.app (owner renamed the domain). `NEXT_PUBLIC_SITE_URL` set to it for production + preview, because the Vercel production domain lagged the rename and the old one now 404s. Analytics/Speed Insights toggles: owner, in the dashboard | ✅ Analytics + Speed Insights on |
| 5.3 | Domain: `tanishk-saxena.vercel.app` (owner's choice); a bought domain later only needs `NEXT_PUBLIC_SITE_URL` changed | ✅ |
| 5.4 | Verification on the live URL (below); perf readings in `docs/PERFORMANCE.md` | ✅ |
| 5.5 | Owner revisions: Contact and About bands take the section rhythm top = bottom (spec §10); perf + a11y flagged, never blocking (brief §3): axe is a non-blocking CI warning, `docs/PERFORMANCE.md` ledger | ✅ |

Decisions (5.1):
- [ASSUMED] Host: **Vercel** (brief's tentative choice). Analytics: **Vercel Analytics + Speed
  Insights**: cookieless (no consent banner), a few KB loaded after the page, and Speed
  Insights reports real-phone LCP/CLS, which closes P-1 with field data rather than laptop runs.
- Share-card fonts are static TTFs in `assets/og-fonts/` (OFL), read at build time only.
- `BlogPosting` has no `image`: the article card URL carries a build hash, and the field is
  optional. `sameAs` skips links that point at a service's home page (the placeholders).
- `/tokens` and `/admin` are disallowed in robots; `/tokens` is also `noindex`.
- Résumé: the placeholder PDF ships (brief §5 content strategy); replaced via admin later.

Verification checklist (brief §6):
- [x] Local: every metadata route returns 200 with the right type; OG cards and icons
      rendered and checked by eye; lint/typecheck/unit (44) and e2e smoke + axe (14) green
- [x] Live: every route 200 (404 for unknown articles); canonical, og:image, sitemap and
      JSON-LD all use the production domain
- [x] Structured data valid on the live URL: Schema.org validator, 0 errors / 0 warnings
      (ProfilePage home, BlogPosting article). Google's Rich Results Test is the same check
      with Google's eligibility on top: optional, owner
- [x] OG card renders in a real preview (owner, chat app)
- [x] Tested on an actual phone against the deployed site (owner)
- [~] P-1 (LCP 3.3–3.6 s lab vs 2.0 s target): open and flagged in `docs/PERFORMANCE.md`;
      not a blocker (brief §3)

**Post-ship fix, phones opening an article:** the screen froze (ripple included) before the
article rose in, on the live site only. Two causes. (1) React holds a view transition until
newly used fonts load, and the pull-quote italic was first requested after the tap: the
article-only faces now download once the Writing list nears the screen (PR #10). (2) The
bigger one: the view transition snapshots the full-length home page, which phone GPUs are slow
at (desktop was fine; the return trip already avoided it). Phones now turn pages with
transform/opacity both ways: the list lifts away, then the article rises in
(`openArticle`, `ArticleEntrance`), and the page wrapper mounts without a `<ViewTransition>`
on phone turns, since React starts a view transition whenever one mounts. Emulated phone (4×
CPU): worst frame 683 ms → 163–185 ms, and that one falls while the screen is blank between the
two sheets; return trip ≤ 117 ms, scroll position restored. Desktop keeps the page sheet.

**Later (owner):** after Milestone B, Phase 10 audits overall performance and a11y scores and
adds them to CI as an amber warning (read and flagged, never blocking; brief §6). The
signature intro stays shelved until then. _(Reordered 2026-10-02: the CI reading moved to
Phase 9.1, the audit stays last; brief §6.)_

---

# Milestone B — database and admin

Plan: brief §6. Design: `docs/ADMIN-DESIGN-SPEC.md` (from `docs/design/ADMIN-*`,
`Admin.dc.html`, `Field.dc.html`, `admin-data.js`). One PR per step.

| Step | Branch | Scope | Status |
|---|---|---|---|
| B.0 | `docs/admin-plan` | Admin spec extracted and reconciled with the shipped site; brief §5/§6 restructured; CLAUDE.md | ✅ PR #12 |
| 6.1 | `feat/phase-6-model` | Content model v2 on fixtures: `published`, `status`, `active`, `listen`, `ctaLabel`, nullable read time, `settings`; experience by `sortOrder`; the site honours them | ✅ PR #13 |
| 6.2 | `feat/phase-6-supabase` | Supabase dev + prod, migrations, RLS, seed from fixtures, Storage buckets; Supabase repositories with the contract suite on both; production switched over with on-demand revalidation | ✅ PR #14 + #15 (switch-over) |
| 7 | `feat/phase-7-auth` | Supabase Auth, sign-in screen, `proxy.ts`, allowlist, sign-out, admin theme key | ✅ PR #17 |
| 8.1 | `feat/phase-8-shell` | Admin tokens, sidebar / header + sheet, routes, read-only lists | ✅ PR #22 |
| 8.2 | `feat/phase-8-editor` | Schema + validation module, Field, editor, save + revalidate, toasts, dirty guard | ✅ PR #23 |
| 8.3 | `feat/phase-8-actions` | Quick toggles, reorder, delete + Undo, restore, duplicate, rollback, 409 | ✅ PR #24 |
| 8.4 | `feat/phase-8-writing-media` | Markdown, slugs, read time, publish rules, uploads | ✅ PR #25 |
| 8.5 | `feat/phase-8-settings` | Site variants (slate blue, bottom-centre button, centre wheel, grain) + admin Settings | ✅ PR #26 · owner's test on dev: closed 2026-10-03 (findings → 9.3) |

**6.1 notes.** Domain: `Profile.ctaLabel`, `Project.published`, `Article.status` + `listen`,
`Quote.active`, new `Settings` + `SettingsRepository`; stored `readMinutes` is nullable and the
repository returns `max(1, round(words / 220))` when it is null (`lib/utils/read-time.ts`,
reused by the admin in 8.4). The repository contract now covers visibility (published / active /
linked only, a draft's slug is `null`), whole read times, settings, and experience by
`sortOrder` (seeded order unchanged). The stress set gains one of each hidden case. The site:
the hero's second button reads `ctaLabel` (empty hides it, Q-A19), Listen shows per article.
Shipped data keeps every value, so the site is unchanged. Also fixed the flaky axe spec: one
page per test with a 60 s budget (it timed out under parallel load; never a real violation).

**6.2 notes.** Schema in `supabase/migrations/` (one table per entity, snake_case; text ids
keep the fixtures' ids; articles get a uuid so slugs stay editable; soft delete; `updated_at`
triggers; CHECKs for the admin's limits: card line 110, description 320, quote 140, slug
format, published article needs a body or an external URL, one live article per slug).
RLS: anon reads only what the site shows; writes and hidden reads need `is_admin()` (the
`admin_user` allowlist, filled in Phase 7); anon write privileges revoked as well. Storage:
one public `media` bucket, admin-only writes, 10 MB cap (5 MB images checked by the upload
route, 8.4). [ASSUMED] One bucket rather than one per kind. `supabase/seed.sql` is generated
from the fixtures through the same row mappers the reads use (file snapshot keeps it in
sync). Supabase repositories repeat the RLS filters (defence in depth) and share the article
derivation with the fixtures (`lib/repositories/article-record.ts`). Tests: the migrations,
seed and RLS run in PGlite on every `npm run test` (no Docker; 7 tests then, 6 since the test consolidation); the contract + live
RLS suite runs against the dev project when `.env.local` has its keys. Pages stay
prerendered (`fetch` without a cache option is fetched once at build). Waiting on: the two
projects, `db push --include-seed`, Vercel env (`docs/SUPABASE.md`). Revalidation landed with
the admin's writes (8.2); dashboard edits still show only after a deploy or an admin save.
Dev (2026-10-02): both migrations pushed with `db push --db-url` (session pooler; no access
token), seed applied; live suite 15/15; fixture and Supabase builds render identical HTML on
home, three articles, sitemap and 404. A second migration grants `service_role` its tables
(with auto-expose off it had none; the secret-key test caught it). Project settings: Data API
on, auto-expose new tables off, automatic RLS on, sign-ups off.
Prod (2026-10-02): same settings; both migrations + seed pushed; read-only live suite 14/14
(planting tests off for prod); every repository result deep-equals the shipped fixtures.
Vercel: Production → `DATA_SOURCE=supabase` + prod URL and publishable key; Preview → the
same with dev. The secret key and DB URLs never go to Vercel. The switch-over PR's merge is
the production deploy that starts reading Supabase.

**7 notes.** `@supabase/ssr` cookie sessions. `proxy.ts` (matcher `/admin/:path*`,
`/api/admin/:path*`) refreshes the session and verifies the JWT (`getClaims`); signed out,
pages redirect to `/admin/sign-in` and the API answers 401 (`lib/auth/gate.ts`, unit tested).
Pages and handlers check again with `getAdmin()` (`getUser`, `getClaims` since 8.1, + the
`is_admin()` RPC, `lib/auth/server.ts`): the `app/admin/(signed-in)` layout and `/api/admin/session` (the
pattern for 8.2's handlers). Sign-in is a Server Action (works before hydration): the mockup's
empty-field message, Q-A18 for a wrong password, and a valid non-admin account is signed back
out with the same message, so the form never reveals which accounts exist. Sign-out ends this
device's session only. `/admin` was a temporary landing (session, theme toggle, View site, Sign
out) until 8.1 redirected it to Writing. Theme: one pre-paint script picks `admin-theme` under
`/admin`, `theme` elsewhere (Q-A7); the admin toggle names the mode it switches to. Tokens
`--field`, `--line`, `--line-input`, `--paper-fade-strong` added now (the sign-in needs
them). Auth uses the Supabase keys whatever `DATA_SOURCE` says; with none (CI) the admin
stays locked. Tests: gate unit tests; a live dev suite (`lib/auth/auth.test.ts` (removed), now part of `npm run test:live`: sign-ups off,
wrong password, allowlisted admin writes, a signed-in stranger can't write or read the
allowlist; two throwaway accounts, deleted after); smoke e2e: `/admin/*` → sign-in, empty
submit shows the message, `/api/admin/session` 401. Checked by hand on a build against dev
(390px): stranger and wrong password refused, admin lands, API 200, admin theme stored under
its own key and the site's untouched, sign-in bounces a signed-in admin to `/admin`, sign-out
→ sign-in and the API back to 401. Owner added the admin account in dev and prod (2026-10-02). Flagged: the live Supabase contract suite timed out once
(1 of 4 runs) when run alongside the new live auth suite; network-bound, not reproduced.

**8.1 notes.** The shell (ADMIN-DESIGN-SPEC §4–§7.1): the sidebar when wide; on phones a
sticky header and the Sections sheet, a native modal `<dialog>` (the browser traps focus,
closes it on Escape and returns focus to the trigger, §12). Routes as Q-A5: `/admin` →
Writing, `/admin/[section]` (a list, or a single record), `/admin/[section]/[id]` (an entry,
or `new`); unknown sections and ids 404. Lists: title, count line, View on site, + New, search
as you type, the status filters, rows (meta on the right when wide, under the title on
phones), both empty states, and the 4-group cap on Skills (Q-A22). Read-only: status pills
display only (quick toggles, reorder: 8.3); single records and entries show the real editor
bar over a temporary "editor arrives in 8.2" body. Admin tokens in `app/globals.css`;
visible scrollbars under `[data-admin]`. Section registry, row mapping and search/filter:
`lib/admin/` (rows reuse the site's date and kind formatters).

Data: `AdminRepositories` (`lib/domain/repositories.ts`), every collection with its hidden
rows, deleted rows excluded, same order as the site. Fixtures and Supabase implement it; over
Supabase it runs as the signed-in admin, so RLS is what lets hidden rows through. Articles
carry their id (uuid in the database, the slug over fixtures). `getAdminRepositories()`
follows `DATA_SOURCE` like the site (so `fixtures-stress` checks the admin's layouts);
`loadAdminContent()` reads all five lists once per request, for the nav counts and the page.
Tests: rows/filters/routes (`lib/admin/rows.test.ts`); admin reads ⊇ public reads in order,
on both fixture sets and live, where the signed-in admin sees the planted hidden rows. Unit
37 tests in 8 files; live 8. No signed-in e2e: CI has no Supabase keys, so the admin stays
locked there (the locked journey is unchanged).

Speed (owner: pages slow on desktop): each call to the dev project is ≈ 300 ms from here, and
the layout made three in a row. `getAdmin()` now verifies the token locally (`getClaims`, as
the proxy does) instead of asking Auth (`getUser`), and the allowlist check runs alongside the
list reads (RLS still decides what they return; nothing renders unless the check passes).
Warm admin pages 1.4 s → ≈ 450 ms in dev. Trade-off: a session signed out on another device
stays valid here until its token expires (≈ 1 h); every read and write is still checked by
RLS against the allowlist.

Flagged (site, not changed here): this Node's ICU formats September as "Sept" in `en-GB`, so
the Writing list shows "Sept 2026" where the mockup has "Sep". The admin uses the same
formatter, so both agree. A fixed month table would pin it; owner's call.

**8.2 notes.** Hero, About, Contact, Experience, Skills and Quotes edit and save end to end
(ADMIN-DESIGN-SPEC §5, §7.2–7.3, §9, §11).
- One schema module (`lib/admin/schema.ts`): the fields per section, `parseDraft` (only known
  fields, each of its own type) and `validate` (every §11 rule with the mockup's copy, plus
  Q-A23 for years). Drafts ↔ domain in `lib/admin/forms.ts`; load and save on the server in
  `lib/admin/save.ts`.
- Route handlers `PUT /api/admin/[section]` (single records), `POST /api/admin/[section]`
  (create; joins the end of the list) and `PUT /api/admin/[section]/[id]`, all through
  `handleSave`: admin check (401) → section (404) → parse (400) → validate (422 with the field
  errors) → write → `revalidatePath('/', 'layout')` → 200. The toast says saved only after
  that.
- Writes sit behind the repository boundary: `AdminRepositories` gains `profile`,
  `socialLinks` and `create` / `update` on collections, with `updatedAt` on every record.
  Supabase runs them as the signed-in admin (RLS). The admin implementations moved to
  `fixture-admin-repositories.ts` and `supabase-admin-repositories.ts`.
- The editor: Field (text, textarea with live count, url, email, year, toggle switch, tags;
  file, markdown, pills and range come with the forms that use them, 8.4/8.5), the bar's state
  pill (New / Unsaved changes / Saving… / Saved) with Discard and Save, the phones' bottom
  bar, the error summary, the side panel (side fields, View on site, Last saved), ⌘S / Ctrl+S,
  toasts, the confirm dialog (native modal `<dialog>`, `role="alertdialog"`), and the
  unsaved-changes guard on in-app links, Back and Sign out (`beforeunload` for the tab).
- Fixtures mode: Next gives pages and route handlers separate module instances, so the first
  try saved into one copy and read from another (a new entry 404'd). The composition root
  now keeps one working copy of each fixture set per process on `globalThis`; the site and
  the admin share it.

Checked in Chrome at 1440 and 390 with a throwaway admin account on the dev server: errors on
an empty create, create with ⌘S, the toast copy, the Unsaved pill, the leave guard (Keep
editing), Hero and Experience forms; no page errors. Tests: schema and forms
(`lib/admin/schema.test.ts`), the handler's statuses (`handle-save.test.ts`), admin writes on
a fixture copy and live as the signed-in admin (planted quote removed after). Unit 43 tests
in 10 files; live 9.

**8.3 notes.** The list actions (ADMIN-DESIGN-SPEC §7.1–7.3, §9), optimistic with rollback.
- Quick toggle: the status pill is a button (Projects Published ↔ Hidden, Writing Published
  ↔ Draft, Quotes Shown ↔ Skipped); `PATCH /api/admin/[section]/[id]` `{ visible }`; the
  toast says what changed and offers Undo (sends the toggle back). An article with no body
  and no external URL can't go live: "Add a body before publishing" (client and server, 422).
- Reorder: ↑/↓ on ordered lists while no search or filter is active ("Clear the search and
  filter to reorder."); moves apply at once and one `PATCH /api/admin/[section]/order`
  `{ ids }` goes 700ms after the last; "Order saved" or rollback. A stale id list is 409. A
  pending order is sent at once (`keepalive`) when the list is left or the page reloads
  (found in the browser check: the debounce otherwise dropped it).
- Delete: side panel "Delete {singular}" → confirm → `DELETE` (soft) → back to the list,
  toast with Undo → `POST /api/admin/restore`. Duplicate: `/new?from={id}`, built on the
  server ("(copy)" on the role or heading), guarded when there are unsaved edits.
- 409: saves send the `updatedAt` they started from; a mismatch keeps the draft and says
  "This entry changed on another device — reload" (Q-A6).
- Repositories: `patch`, `remove`, `restore`, `reorder` on collections; articles get
  `setStatus`, `remove`, `restore` (their form is 8.4). Fixtures keep stamps and soft-deleted
  entries in the dataset's `admin` bookkeeping, so they last across requests.

Checked in Chrome on the dev server (throwaway admin): toggle + Undo, reorder and back, a
reorder surviving a reload and an in-app navigation inside the 700ms window, Duplicate on
Skills and Experience, create, delete + Undo toast, and the 409 across two tabs; no page
errors. Fixed from it: the arrows' labels doubled a quote's marks. Tests: the write check now
covers patch, reorder, delete and restore (fixtures and live; the live cleanup renumbers the
quotes, since planted rows took positions), and the handler's 409. Unit 43 tests in 10 files;
live 9.

**8.4 notes.** Projects and Writing edit end to end; Hero gets the résumé, About the portrait
(ADMIN-DESIGN-SPEC §5, §8.1–8.6, §10, §11). Every section but Settings now has its form.
- Fields: Type and Status as pills (`role="radiogroup"`), the Markdown body (Write / Preview
  through the site's own renderer, "n words · m min"), publish date, read time ("Auto" =
  blank = the estimate, Q-A11), External URL (Q-A12), and the file field (drop zone or a
  row with thumbnail / PDF tile, Replace, remove). Field definitions moved to
  `lib/admin/fields.ts`; `schema.ts` keeps parsing and validation.
- Writing rules: the slug follows the title until edited by hand; slug format and
  uniqueness (client, with the other articles' slugs; server again, 422); publishing needs a
  body or an external URL; Save reads "Publish" when an article switches to Published.
  Duplicate adds "(copy)", `-copy` on the slug, Draft / Hidden.
- Articles have an id that survives slug edits (`AdminArticles.get/create/update`; fixtures
  pin `id` on first edit). The excerpt isn't edited (Q-A12).
- Uploads (§10): `POST /api/admin/upload` checks the admin and the limits (Q-A17, shared with
  the browser in `lib/admin/uploads.ts`) and returns a signed URL; the browser reads an
  image's size, uploads straight to the `media` bucket and the form stores the public URL.
  The portrait's alt is "Portrait of {name}" (Q-A9); an unchanged image keeps its focal
  point. `next.config.ts` lets `next/image` load that bucket of the environment's project.
  Uploads use Supabase whatever `DATA_SOURCE` says (like sign-in).

Checked in Chrome on the dev server (throwaway admin): a project's Type pill and cover upload
and save, a new article (slug follows the title, publish blocked without a body, Preview,
hand-edited slug kept, created and live at its URL), the Hero résumé upload; no page errors;
the test uploads removed from the bucket. A signed upload by plain `fetch` was verified
against dev first. Tests: writing rules, slugs, duplicates, images and upload limits
(`schema.test.ts`); article create / read / edit / publish / delete in the write check
(fixtures and live). Unit 45 tests in 10 files; live 9.

**8.5 notes.** Settings (ADMIN-DESIGN-SPEC §8.9, owner §14) and the site variants it switches.
Every admin section now has its form; the temporary editor body is gone.
- Site: the root layout reads the settings and sets `data-accent` and `--grain-opacity` on
  `<html>` (site, admin and 404 alike). The accent is a base plus a dark-mode mix
  (`--accent-dark-mix`: terracotta 24%, renders exactly as shipped; slate `#2F5D72` with 32%).
  The floating nav takes the button position (bottom right / bottom centre: the arc fans
  −158°…−22° and the dock parks lower) and the menu layout (arc, or the centre wheel: θ =
  −90° + 360° × i / n, R = 150px, the dock slides to the screen's centre over .72s). Motion
  helpers moved to `components/site/nav-motion.ts` (the component was over 200 lines).
- Admin: Accent, Grain (range 0–24, step 0.5, value shown beside the label), Navigation
  button and Menu layout; saves like any single record (409, toast, site marked stale).
- Q-A26: the wheel centres on the visible screen (`dvh`).
- Share cards and icons (owner, §14): they read the saved accent when they're generated, so a
  deploy picks up the setting (an admin save also marks them stale, so they follow on their
  next request). `lib/og/accent.ts` holds each accent's hex (`next/og` can't read CSS; a test
  keeps it equal to `tokens.css`). The static `app/favicon.ico` became a prerendered route
  drawing the same monogram, so it follows too.

Checked in Chrome on the dev server (throwaway admin): saved slate + bottom centre + centre
wheel + 12% grain, opened the wheel on the home page at 1440 and 390 in light and dark (centred,
items evenly round it, slate current item), then saved the shipped defaults back; no page
errors. Tests: settings round trip and the grain's steps (`schema.test.ts`), nav angles for
both positions and layouts (`utils.test.ts`), settings save in the write check (fixtures and
live), and the images' accent colours equal to `tokens.css` (`lib/seo.test.ts`). Unit 47 tests
in 10 files; live 9. A production build serves `/favicon.ico` (200, PNG).

**Phase 8 verification (brief §6). Closed by the owner, 2026-10-03:** the admin works; what's
left is minor bugs and UI/UX, which are Phase 9's (9.3).
- [x] Owner tested the whole admin on dev (desktop, `DATA_SOURCE=supabase`), entering a full
      set of fictional test content (`docs/admin-test-content/`, git-ignored, local only)
      through every section, field and list action. Findings → 9.3.
- [x] Server validation repeats every client rule (one schema module; the handlers'
      statuses are unit-tested).
- [x] A save confirms with a toast once the database has it (checked on the dev server).
- [x] Every Settings combination: the owner checked them on desktop (2026-10-03), after the
      earlier check of slate + bottom centre + centre wheel at 1440 and 390, light and dark.
- Carried into Phase 9 (open, not blocking the close):
  - [ ] The owner's smoke test of every admin feature on **prod, on a phone** (the same
        flows; real content later, once the owner's own portfolio is ready).
  - [ ] A save shows on the *deployed* site on the next reload (the production path:
        prerendered pages, `revalidatePath`); the prod smoke test covers it.
  - [x] axe on the admin screens, desktop and phone (flagged, never blocking), in CI as a
        dev test admin: Phase 9 roadmap items 1–2 (done in 9.4).

**What's left after Phase 8 (2026-10-02, owner's order, brief §6):**
1. ~~Phase 9.1, Lighthouse CI as an amber reading on every PR~~ — done (Phase 9 below).
2. Phase 9, the UI review and features: now planned in full in the **Phase 9 roadmap**
   below (owner, 2026-10-04).
3. Phase 10, the final audit, last: Lighthouse on the live site and the admin, fix what
   falls short (including P-1 in `docs/PERFORMANCE.md`), record the scores.

Owner revisions so far: ADMIN-DESIGN-SPEC §14 (style settings kept, tilt dropped; unshipped
shades tweaked to pass AA; "saved" = database confirmed, no reloads; the Phase 9 decisions of
2026-10-04). The §13 defaults the owner had left open are settled: articles keep External URL,
as either/or with a body (Q-A12); Name and Location stay on Hero, Footer note on Contact (Q-A8).

---

## Phase 9 — UI review and features

Order (owner, 2026-10-02; brief §6): Lighthouse CI first, then the UI review and features;
Phase 10, the final audit, last. The full plan is the **Phase 9 roadmap** below (owner,
2026-10-04): start every Phase 9 session there.

| Step | Branch | Scope | Roadmap | Status |
|---|---|---|---|---|
| 9.1 | `feat/phase-9-lighthouse` | Lighthouse CI on every PR as a reading (mobile + desktop), pinned scores, warnings under budget | — | ✅ |
| 9.4 | `feat/phase-9-test-infra` | Test infrastructure: a dev test admin; a blocking admin journey and admin axe in CI; the site's unaudited states | A (1–3) | ✅ |
| 9.3 | `fix/phase-9-admin-rules` (B and C, one PR at the owner's call), `feat/phase-9-site-ux` (D and E, one PR at the owner's call), `fix/phase-9-review-3` (their last review fixes), `feat/phase-9-media` (F) | The owner's findings from the admin test (list below) | B–F (4–23) | ✅ (B–F) |
| 9.2 | `feat/phase-9-site-meta` | Editable site title and description; the name's other hard-coded spots | G (24) | ✅ |
| 9.5 | `feat/phase-9-experience-markdown` (30), `feat/phase-9-contact-links` (31), `feat/phase-9-storage-cleanup` (32), `feat/phase-9-heat-map` (29e) | The re-evaluation outcomes and the features the owner chose | H (25–32) | under way: 30, 31, 32, 29e done |

Work order: 9.4 → 9.3 → 9.2 → 9.5, one PR per roadmap group or smaller. (9.4 comes first so
every later PR is checked by it.) The handwriting work (28a with the signature intro, 29c)
is the very last item of Phase 9.

### Phase 9 roadmap (owner, 2026-10-04): the final pass

Everything Phase 9 will do, with the owner's answers to every open question. A new session
picks up from the first unchecked item. Owner decisions are final (brief §0.1); record each
design change in DESIGN-SPEC §10 (site) or ADMIN-DESIGN-SPEC §14 (admin) as it lands. Item
numbers are stable: refer to them in PRs. Each item ticked off also adds a line to **the
owner's test list** (below "What's left of Phase 9"), in the same PR: what the owner should
try by hand to verify it.

**Checklist** (kept current with every PR; the items below hold the detail). 33 numbered
items, 5 of them decided with nothing to build (26, 27, 28b, 28c, 29a/b/d).

| Group | Items | Done | Left |
|---|---|---|---|
| A. Test infrastructure (9.4) | 1, 2, 2b, 3 | 1, 2, 2b, 3 | — |
| B. Bugs (9.3) | 4–7 | 4, 5, 6, 7 | — |
| C. Admin UI/UX (9.3) | 8–15 | 8, 9, 10, 11, 12, 13, 14, 15 | — |
| D. Site UI/UX (9.3) | 16–21 | 16, 17, 18, 19, 20, 21 | — |
| E. Drag to reorder (9.3) | 22 | 22 | — |
| F. Media (9.3) | 23 | 23 | — |
| G. Site title and description (9.2) | 24 | 24 | — |
| H. Re-evaluation outcomes (9.5) | 25, 28a, 29c, 29e, 30, 31, 32 | 29e, 30, 31, 32 | 25 (owner picks), then 28a + 29c last |
| I. Carried checks | 33 | — | 33 (the owner's; first on the owner's test list) |

**A. Test infrastructure (9.4, first)**
- [x] 1. **One test admin.** CI signs in to the admin with **one** account (owner,
      2026-10-04: one test user, a full admin; dev is test data): `e2e-admin@example.com`
      on the **dev** allowlist only, made by Claude with the secret key. Prod has no test
      account. (A read-only viewer role was built first, then removed at the owner's call,
      from the code and from both databases, history included: no schema change remains.)
- [x] 2. **Admin axe in CI**, mirroring `e2e/a11y.spec.ts` (WCAG 2.1 AA, light and dark,
      desktop and phone, a non-blocking warning): sign-in, every list, an editor of each
      kind, the delete and leave dialogs, the Sections sheet, Settings. Runs in `check` on
      the same **fixtures** build as the site's tests (owner: one build); only sign-in
      reaches dev. Skips when the secrets are missing. Repository secrets (owner, Settings →
      Secrets and variables → Actions): `E2E_SUPABASE_URL` and `E2E_SUPABASE_PUBLISHABLE_KEY`
      (dev's), `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`. No secret key in CI.
- [x] 2b. **Blocking admin journey** (owner, 2026-10-04: admin functionality tests that gate
      like the site's): in `e2e/smoke.spec.ts`, signed in as the test admin on the fixtures
      build, so saves change only the server's in-memory copy: create a quote, edit and
      save, take it out of rotation from the list, delete and undo, open Settings. Desktop
      and phone.
- [x] 3. **Site axe gaps**: audit the open experience row, the project modal and the open nav
      menu, which the site's spec never opens.

**B. Bugs (9.3)**: details in the 9.3 findings below.
- [x] 4. B1 · four skill groups at most, on create, duplicate and Undo; client and server.
- [x] 5. B2 · 4–6 items per skill group, a hard limit; client and server.
- [x] 6. B3 · an article has an External URL **or** a body, never both; client, server and a
      database check.
- [x] 7. B4 · every rule that can show early does, the same way in every section.

**C. Admin UI/UX (9.3)**
- [x] 8. #6 Save disabled when there is nothing to save.
- [x] 9. #8 The Markdown hint says Markdown is supported, nothing partial.
- [x] 10. #4 Toasts stack, and follow the theme and accent.
- [x] 11. #11 Autofocus: a delete confirmation focuses Delete; dialogs their primary action.
- [x] 12. #16 Reset to defaults on Settings.
- [x] 13. #9 Every button and request audited for double fires (owner: not just toggles):
      **debounce** where only the final state matters (toggles, reorder arrows, search and
      filter typing); an **in-flight lock** where each press is a real action (Save,
      Duplicate, Delete, Undo, uploads, sign-in, sign-out). The PR lists every one.
- [x] 14. #5 Delete from the list, for every kind of entry.
- [x] 15. #17 The leave dialog lists what changed.

**D. Site UI/UX (9.3)**
- [x] 16. #2 The no-image placeholder reads like "No preview to show".
- [x] 17. #3 The modal's date moves below the project name (the close button overlapped it).
- [x] 18. #14 A calmer quote rotation.
- [x] 19. #15 Menus close in reverse (items hide one by one, reverse order, behind the centre
      button); the button travels home only as the last one hides.
- [x] 20. #7 Press feedback rethought, site and admin alike: Claude presents two or three
      alternatives to the ripple (no artificial delays; reads at any speed), the owner picks.
- [x] 21. **Card line: dropped** (owner: a single line says too little on a card and could
      discourage opening it). Remove the field from the admin, the domain and the database;
      the modal uses Description. Nothing else needs it (projects have no pages); the
      migration drops the column after copying any summary into an empty description.
      **Owner rule (2026-10-04): drop any unused field, it adds confusion.** Audit every
      admin field and domain property for others that nothing on the site reads, and drop
      them the same way (the PR lists what was found).

**E. Drag to reorder (9.3 #12)**
- [x] 22. Drag to reorder the lists and the skill pills within a group (arrows stay for
      keyboards). Settles ADMIN-DESIGN-SPEC §13's "revisit drag-to-reorder after real use".

**F. Media (9.3 #1)**
- [x] 23. Paste images into image fields, alongside upload. Optional **modal media** for a
      project: a **list** of items (GIF, video or image) that rotates automatically like a
      carousel while the modal is open (owner, 2026-10-04); the card keeps its cover image,
      and the modal shows the cover when the list is empty. **As built** (the owner's later
      call, same day): swipe or click through, dots, no rotation unless the new Settings
      switch is on (F notes below).

**G. Site title and description (9.2)**
- [x] 24. Settings fields for the site title and description (root metadata, Open Graph);
      the name's other hard-coded spots (title template, preview images' alt text, the
      admin wordmark) read the profile's Name.

**H. Re-evaluation outcomes (9.5)**
- [ ] 25. **Skills layout.** Claude presents two or three alternatives to the four columns,
      like #7's press feedback; the columns stay until the owner picks one.
- 26. **External URL on articles: kept**, as either/or with a body (item 6). No pulling in
      articles from elsewhere. Decided, nothing to build.
- 27. **Name and Location on Hero, Footer note on Contact: kept** (Q-A8). Decided.
- [ ] 28a. **Handwriting out.** The Caveat hero word and signature aren't coming out well
      and aren't worth more iterations. Refine the fonts instead: the hero word moves to a
      non-handwritten treatment (Claude proposes options), and the signature becomes a proper
      signature font with a stroke-by-stroke animation, as if written by hand. Goes with
      29c. **Last in Phase 9** (owner: it will take time), together with 29c.
- 28b. **Experience stays rows** (no card/modal treatment). Decided.
- 28c. **The quote section stays** (with item 18's calmer rotation). Decided.
- 29a. Medium RSS blog: **skipped** (the Writing section and External URL cover it).
- 29b. `/uses` page: **skipped**, not needed.
- [ ] 29c. **Signature intro: build it**, with a Settings switch to turn it off, using the
      new signature font and stroke animation (28a); fix the hand-off shift and the load cost
      that shelved it (Phase 4 notes; `git stash` "wip: signature intro"). **Last in Phase 9**,
      after everything else; its Settings switch may land earlier (e.g. with item 24),
      inert until the intro exists.
- 29d. Draft preview on the site: **skipped**; the editor's Preview is enough.
- [x] 29e. **GitHub contribution heat map: build it.** Claude proposes where it sits; data
      from GitHub's API at build time (revalidated), never in the browser.
- [x] 30. **Experience descriptions in Markdown**, simple formatting: paragraphs, `- `
      lists, **bold**, *italic* and underline. Same renderer as articles, limited to these.
      Underline isn't part of standard Markdown, so the renderer gains it for **articles too**
      (owner: articles may use it); Claude picks the most standard syntax when building it
      (inline `<u>…</u>`, allowed through the sanitiser, unless something better fits).
- [x] 31. **Contact links as an editable list** (label, URL, order) instead of the four fixed
      slots, so any service (LeetCode…) can be added.
- [x] 32. **Keep storage clean**: deleting or replacing an image or résumé removes the old
      file from the `media` bucket.

**I. Carried checks**
- [ ] 33. The owner's smoke test of every admin feature on **prod, on a phone**; it also
      covers a save showing on the deployed site.

**Not in Phase 9:** P-1 (LCP) and the full Lighthouse audit, Phase 10.

### What's left of Phase 9 (as of 2026-10-04): start the next session here

Groups A–G (items 1–24) are built and merged. What is left to **build** is group H (9.5),
the enhancements below, in this order (done so far: 30, 31, 32, 29e):

| # | Item | What it needs | Owner input first? |
|---|---|---|---|
| 25 | **Skills layout** | Two or three alternatives to the four columns on a rough comparison page (as press feedback was); the columns stay until the owner picks | **yes: owner picks** |
| 28a | **Handwriting out** | The hero word leaves Caveat for a non-handwritten treatment (Claude proposes options); the signature becomes a proper signature font, drawn stroke by stroke | **yes: owner picks the hero-word treatment and the font** |
| 29c | **Signature intro** | With the new signature and stroke animation; a Settings switch to turn it off; fix the hand-off shift and load cost that shelved it (`git stash` "wip: signature intro"). **Last**, with 28a | no (after 28a) |

After these: **Phase 10**, revised by the owner (2026-10-04; brief §6): in the owner's
words, the one-time fixes the first audit highlights, and setting up the audit pipeline. It
closes the implementation and is never rerun as a gate.
- 10.1: a **standing audit** workflow, run by hand or weekly: Lighthouse on prod's public
  pages and on the dev admin signed in as the test admin (a list, an entry editor, a single
  form, Settings); warnings only. The signed-in admin's Lighthouse stays in this audit and
  off the per-PR step (axe and the journey already read the admin on every PR; brief §6).
- 10.2: the **one-time fixes** from its first run, P-1 (phone LCP) first; scores recorded.

Then the owner's end-to-end test round (the test list below, and everything else) runs on the tuned
site. Whatever it turns up, and every later request, is an ordinary PR: CI's per-PR
Lighthouse and axe steps read it, and Phase 10 stays closed.

What each check covers today, for reference (`.github/workflows/ci.yml`, `lighthouserc.cjs`):
smoke (blocking) and axe (a warning) cover the **site and the signed-in admin**, every admin
screen included; the per-PR **Lighthouse** covers home, an article and the admin's
**sign-in page only**, on a CI build with fixtures. The signed-in admin's Lighthouse scores
and anything about the deployment are what 10.1 adds.

### The owner's test list (a running list, not part of what's left to build)

This is **not** remaining Phase 9 work (owner, 2026-10-04). It is the list of things already
built that the owner will test and verify by hand, on a real phone and with real files,
later on, once the major functionality is done. **The rule:** every item ticked off in
Phase 9 from here on gets a line added here, in the PR that builds it, saying what to try.
Nothing on it blocks the build; whatever the owner flags from it becomes an ordinary fix.

- [ ] The smoke test of every admin feature on **prod, on a phone**, and a save showing on
      the deployed site (roadmap item 33).
- [ ] The **quote change** (one strip moving left): does it read as moving along a collection?
- [ ] The **nav close** (the opening's motion in reverse, softened), in the arc and the wheel.
- [ ] **Press feedback**: the ripple on primary buttons; Ring and Press-in from Settings, to
      settle on one over time.
- [ ] **Drag to reorder with a real finger**: list rows and skill chips.
- [ ] **Project modal on a real phone**: the fixed size (60% of the screen), the scroll when
      copy is long.
- [ ] **Modal media by hand**: swipe on a phone; ‹ › and the dots on desktop; the sample
      video and GIF playing; Settings → Project media (rotation on and off).
- [ ] **Uploads against live storage**: a pasted clipboard image into an image field; a real
      image, GIF and video through Projects → Modal media (the six-item limit included).
- [ ] **Site title and description**: edit them in Settings, and the Name in Hero; check the
      tab title and a share preview on the deployed site.
- [ ] **Experience descriptions in Markdown** (item 30): in the admin, write a description with
      a paragraph, a `- ` list, `**bold**`, `*italic*` and `<u>underline</u>`; check Preview,
      then the expanded row on the site. Try `<u>` in an article body too.
- [ ] **Contact links** (item 31): in Contact, add a link (say LeetCode), drag it to the top,
      remove another, save; check the order on the site. Clear a URL and see that link hide.
- [ ] **Storage cleanup** (item 32), with `DATA_SOURCE=supabase`: replace a project's cover
      and save, then look in Storage → `media` → `images/`: the old file is gone. Same for the
      portrait, the résumé and a removed modal media item. Delete a project: its files stay
      (Undo), and go on the next save made ten minutes or more later.
- [ ] **GitHub heat map** (item 29e): create a read-only GitHub token, put it in `.env.local`
      and in Vercel (Production and Preview) as `GITHUB_TOKEN`; enter your username in
      Settings → GitHub username. Check the map under Skills on a phone (half a year) and on
      a wide screen (the year), in both accents and both modes. Clear the username: it goes.
- [ ] Then remove the **sample media** from the first two projects in dev and prod
      (`docs/SUPABASE.md`) when real media goes in.

**9.5 notes (roadmap H).**
- Decisions taken at the start of the session (owner, 2026-10-04): the options-first items
  (25, 28a) get a rough comparison page and then a pause for the owner's pick; the heat map
  (29e) sits after Skills, in the site's accent (never GitHub's green), with no section of
  its own ("Contributions" may serve as its heading), fed by GitHub's GraphQL API with a
  read-only token; for this run each item is its own PR and commits do not wait for a diff
  review (the owner reviews the PRs).
- Item 30: `lib/utils/markdown.ts` gains an inline `underline` token (a bare, matched
  `<u>…</u>`; balanced by construction, so a stray tag can never leak out of its block) used
  by both renderers, and `renderSimpleMarkdown`, the same parser with every other construct's
  tokenizer switched off. `Experience` renders each summary on the server and hands
  `ExperienceRow` the HTML. Admin: `FieldDef.simple` on a `markdown` field. Stored summaries
  are plain text and read unchanged (a paragraph); no migration. The first fixture role now
  carries a list and emphasis (seed regenerated). Tests: unit 48 (+1: simple Markdown; the
  raw-HTML test also covers underline).

- Item 31: a `links` field type (`components/admin/links-field.tsx`; `LinkValue` in
  `lib/admin/fields.ts`), validated in the shared `validate()`. The admin repository's
  `socialLinks.setUrls` (removed) became `replace(links)`: over Supabase an upsert by id, then
  a soft delete of the live rows left out; no schema change (`social_link` always held
  label, url and order). The contract test adds, moves and removes a link; `test:live` ran
  green against dev (9). Unit tests stay 48 (the schema test's contact assertions changed).

- Item 32: `lib/admin/storage.ts` (what a record's files are, which are safe to remove,
  the bucket path of an upload) and `files.references()` / `files.remove()` on the admin
  repositories. `saveSingle` (Hero, About), `updateEntry` (projects) and a project delete
  call `releaseFiles` after the write. Migration `20261009000000_admin_reads_media.sql`
  (additive: a select policy on storage objects for the admin; a delete reaches only rows
  the role can select, so removes were silently deleting nothing). **Pushed to dev;
  prod is the owner's call before this PR merges** (`docs/SUPABASE.md`). Tests: unit 50
  (+2, `lib/admin/storage.test.ts`; the migration test also proves the admin's delete
  lands and a stranger's does not), live 10 (+1: a planted file removed by the signed-in
  admin). Dev's bucket still holds files orphaned before this (five images, two PDFs
  from the owner's testing): not swept.
- Item 29e: a `contributions` repository on the public `Repositories`
  (`get(username)` → a calendar or null). Fixtures return a made-up year
  (`fixtures/data/contributions.ts`); over Supabase it is
  `lib/repositories/github/github-contributions.ts` (GraphQL, `GITHUB_TOKEN`,
  `next: { revalidate }` of a day, null on any failure). `components/sections/contributions.tsx`
  renders it inside `Skills`. Settings gains `githubUsername` (migration
  `20261010000000_settings_github_username.sql`, additive, default empty; **pushed to dev;
  prod before the merge**, since the site's settings read names the column). The fixtures'
  settings carry the owner's username so fixture builds show the map; `DEFAULT_SETTINGS`
  leaves it empty. Tests: unit 52 (+2, the GitHub mapping and its failure paths; the
  contract checks the calendar's shape); smoke 8 and site axe 12 green on a fixtures build
  with the map on the page. Not yet tried against GitHub itself: no token exists yet.
- E2E server pinned to fixtures (found while testing item 31): `playwright.config.ts` now
  starts `next start` with `DATA_SOURCE=fixtures`. Before, a local run took the run-time
  value from `.env.local` (`supabase` on the owner's machine): the build was fixtures, but
  the admin journey saved to the **dev database**, and pages revalidated after a save
  re-rendered from it (and stayed in `.next`, failing later runs until a rebuild). CI was
  never affected (it has no `.env.local`). The ten "Smoke test quote" rows this session's
  runs left in dev were deleted.

**9.4 notes (roadmap A).**
- Roles, built then dropped (owner, 2026-10-04): a migration gave `admin_user` an
  `editor | viewer` role for a read-only CI account; once the owner chose one full test admin
  it had no use, so it was reverted in dev and prod (a revert migration, then both versions
  marked reverted in each history with `supabase migration repair`, and both files removed).
  Both databases are back to `main`'s two migrations; no app code changed.
- One build (owner): `check` builds on fixtures with the dev project's public keys. Sign-in
  always uses Supabase, whatever `DATA_SOURCE` says, while the site's and the admin's content
  are the fixtures, so the signed-in tests are deterministic and never write to dev.
- The test admin: `e2e-admin@example.com` in **dev** only, on the allowlist (the owner chose
  one account for every admin test). Credentials in four
  repository secrets and in `.env.local` for local runs (`.env.example` lists the names).
  `e2e/admin-account.ts` holds the credentials and the sign-in, shared by both specs.
- `e2e/admin-a11y.spec.ts`: one test per mode and viewport signs in once and audits sign-in,
  the four single forms, every list, an editor of each kind with its delete confirmation
  (opened, cancelled), a new project with the leave dialog (Keep editing), and on phones the
  Sections sheet; a soft assertion per screen names each failure. Runs in `check`'s axe step
  with the site's (non-blocking).
- `e2e/smoke.spec.ts` gains the admin journey (2b), and the home journey a Show more / Show
  less step (Projects and Writing page in threes and collapse; owner, 2026-10-04): both
  blocking. The articles journey's first click now retries while still on the home page: a
  row clicked before hydration was sometimes lost under parallel load (pre-existing flake,
  seen in repeated runs).
- `e2e/a11y.spec.ts` gains "home's open states" per mode: the open experience row, the
  project modal, the open nav menu.
- Results (2026-10-04): site open states clean; admin clean except **A-1** (the live pills'
  accent wash, 4.17–4.24:1), fixed with the owner's OK (wash 14% → 8%, 4.53 / 4.62;
  `docs/PERFORMANCE.md`), after which admin axe is clean. Tests: unit 47 and live 9,
  unchanged; e2e on one fixtures build: smoke 8 (the admin journey, stable over 6 repeats),
  site axe 12, admin axe 4.
- Local note: `.env.local` has `DATA_SOURCE=supabase` (the owner's admin testing), so build
  with `DATA_SOURCE=fixtures` before the e2e specs (`CLAUDE.md` commands). The server the
  specs start is pinned to fixtures at run time by `playwright.config.ts` (9.5 notes).

**9.3 notes, roadmap B (items 4–7; branch `fix/phase-9-admin-rules`).**
- B1: `isFull()` in `lib/admin/save.ts` counts the live entries of a capped list. Create
  (Duplicate saves through it) and `/api/admin/restore` answer 409 `{ full: true }`; the
  editor's toast and Undo's say "The skills grid holds 4 columns. Delete one to add another."
  At four, the editor has no Duplicate and `/admin/skills/new` returns to the list.
- B2: `minItems` / `maxItems` on the schema's tags field (4 and 6 for skill items), checked by
  the shared `validate()`, so client and server agree: "Add 4 to 6 items: there are `n`." The
  tag box takes no seventh and shows "`n` / 6". A stored group outside the range would still
  open and must be brought into range to save (none exists: see "Cleared to fit").
- B3: `validate()` puts "An article has a body or an External URL, not both. Clear one." on
  External URL. Migration `20261004000000_article_body_or_external.sql` adds the check; for a
  row holding both it first clears the External URL, which the site never used (the body
  wins on `/articles/[slug]`). Pushed to **dev** and **prod** (2026-10-04, the owner's OK), ahead
  of the merge (`docs/SUPABASE.md`, Day to day).
- Cleared to fit (owner, 2026-10-04: clear every entry outside the new limits). Dev and prod
  held no live entry outside them (four groups of 4–5 items, no article with both). Removed:
  dev's soft-deleted fifth group "Languages (copy)" (the B1 bug's leftover), and the stress
  fixtures' fifth group and 12-item group (now four groups, the long one with six items).
- B4: a field shows its error once edited, in every section; a filled field whose rule reads
  the edited one shows too (`RECHECKS` in `lib/admin/schema.ts`). Untouched fields wait for
  Save, as does the summary above the fields. Before this, nothing showed until a failed
  Save, then everything showed live: the mix the owner saw.
- Tests: unit 47, unchanged in count (the schema, save and migration tests gain assertions).

**9.3 notes, roadmap C (items 8–15; same branch and PR as B, owner's call).**
- 8: Save (both bars) is disabled unless the draft differs from the stored record; `⌘S` then
  does nothing. A new entry is compared with a blank one, so a Duplicate's copy is unsaved
  from the start (it also gets the leave guard).
- 9: the Markdown hint reads "Markdown supported".
- 10: `components/admin/toast.tsx` holds a stack (newest lowest, three at most), each with its
  own timer; the pill is the theme's surface with ink text and an accent-tinted border and
  Undo. A repeated plain message replaces the one showing; toasts with Undo each stay.
- 11: the confirm dialog opens focused on its filled button (Delete, Discard); a new entry
  focuses its first field on fine pointers; sign-in focuses Email.
- 12: **Reset to defaults** in Settings' side panel fills the form with `DEFAULT_SETTINGS`
  (now in `lib/domain/types.ts`, the fixtures' settings read it); Save applies it.
- 13, every button and request:
  - Debounced, final state only: status pills (700ms, raised from 400 then 500 at the owner's call;
    presses that cancel out send nothing; a pending one is sent with `keepalive` on
    leaving), reorder arrows (700ms, as before).
  - Locked while in flight: Save (a ref, since state lags a second press in one frame),
    Delete and Undo (per entry, `components/admin/delete-entry.ts`; Undo's toast goes on
    press), uploads (one per field), sign-in (`pending`), sign-out (`useFormStatus`).
  - Nothing to guard: search and filters (no request), Duplicate and Discard (navigation or
    local), the theme toggle, Reset to defaults, Write / Preview.
- 14: a bin button ends every list row; it shares the editor's confirm, toast and Undo
  through `delete-entry.ts`.
- 15: the leave dialog lists the changed fields' labels under "Changed".
- Checked in a browser on a fixtures build, desktop and phone, light and dark (a one-off
  spec, removed): each item above. Tests: unit 47, unchanged; the smoke journey now deletes
  its quote from the list (item 14) and presses the newest toast's Undo; e2e 24 passed.

**9.3 notes, roadmap D (items 16–21; branch `feat/phase-9-site-ux`).**
- 16: a project without an image reads "No preview to show", on the card and in the modal.
- 17: the modal's year sits under the project name; the type keeps its line. The modal now
  grows with its copy up to 88svh instead of scrolling inside a fixed height (owner,
  2026-10-04: the first two projects scrolled); past 88svh the body scrolls with a thin
  accent bar. On the stress fixtures a 3× long description fits on desktop without a scroll.
- 18: the quote change travels (owner, 2026-10-04, after a plain cross-fade was tried): the
  old quote slides left as it fades, then the new one arrives from the right; keyframes
  `quote-out` / `quote-in` in `styles/tokens.css`. Not watched in motion here: the owner
  judges it on the preview.
- 19: on close the nav's items go back one at a time in reverse order, each solid until it
  is behind the button (`components/site/nav-motion.ts`); the curtain lifts over the whole
  close; in the wheel layout the button travels home as the last item sets off. The nav's
  URL-hash effects moved to `lib/hooks/use-section-hash.ts` (the component's 200-line limit).
- 21: the Card line is gone from the admin form, the domain (`Project.summary`), the
  fixtures, the row mappers and the seed. Migration
  `20261005000000_drop_project_summary.sql` copies a summary into an empty description, then
  drops the column. **Not additive**: push it to dev and prod **after** this PR is merged and
  deployed (`docs/SUPABASE.md`, Day to day). Audit of every admin field and domain property
  against what the site reads: nothing else is unused (Location feeds the JSON-LD address,
  the unedited `excerpt` feeds article descriptions, Footer note the footer).
- 20, press feedback: **open, the owner picks.** Options put to the owner (2026-10-04):
  (a) *press-in*: the control scales to about 97% and darkens a step while held, releasing on
  a short ease, no ripple; (b) *ink wash*: the control's background fades to its pressed
  colour at once on pointer-down and fades back on release, no travelling circle;
  (c) *ring pulse*: one accent ring expands from the control's edge and fades on press.
  All three start on pointer-down and need no artificial delay before the action runs.
  The owner asked to compare them by pressing: a rough page with today's ripple and the three
  options on the site's own controls is published as a private Claude artifact ("Press
  Feedback Options"); the owner picks from it.
- Checked in a browser, desktop and phone (a one-off spec, removed). Tests: unit 47,
  unchanged (the seed snapshot regenerated); e2e 24 passed.

**9.3 notes, the owner's review of D and E (2026-10-04; same branch and PR).**
- 20, decided: the owner compared the options on the artifact page and **kept the ripple**,
  in the page's form: a wash of the control's own text colour that grows and fades at once.
  What was wrong was the old ripple's colours on primary buttons (an opaque cream wave over
  the accent fill, the text swapping colour under it) and the delays. So: the wash replaces
  the per-control tones and every `active:` colour swap; it runs in 300ms (was 380 + a
  300ms fade); the 100ms touch delay, the 180ms `afterRipple` lead (Show more, article rows,
  nav items, in-page links) and the nav item's delayed fill are gone. A new setting,
  **Press feedback** (Ripple · Ring · Press-in), switches the style on the site and the
  admin (`data-press` on `<html>`; `settings.press_feedback`, migration
  `20261006000000_settings_press_feedback.sql`, additive). Ink wash (option B) was dropped.
- 17: the modal may now fill the screen bar the stage padding before it scrolls (it was
  capped at 88svh, which a phone could reach).
- 18: the quote change is one strip moving left: old out and next in together, 72px, .8s.
  Verified that both keyframes run in the browser; the look is the owner's to judge.
- 19: the wheel's button left when the last item *set off*, so the items still out rode
  along with it. It now leaves once the last has hidden (measured: the dock holds until no
  item shows, then travels).
- 22: the drag was rebuilt: the held row or chip lifts and follows the pointer (transforms
  set straight on the element, no render per move), the others glide to their places
  (FLIP, 180ms), and it settles on release.
- 13: the status pills' window is 1200ms (was 700): Published → Draft → Published 600ms
  apart sends nothing (checked). The cost: a single toggle's toast comes 1.2s after the
  press; the pill itself flips at once.
- The owner's second review (2026-10-04), which replaces the lines above where they differ:
  - 17: the modal is **one fixed size again**, capped at 60% of the screen's height; it no
    longer grows. Copy that doesn't fit scrolls the body with the thin accent bar.
  - 19: the close is **the opening rewound**, in the arc and the wheel: same spans, mirrored
    curves, last item out first, the wheel's dock slide included (`nav-motion.ts`). The
    one-at-a-time close is gone.
  - 13: the pills' window is **300ms** (the owner: 200–400ms at most). Presses closer than
    that count as one; a final state equal to the original sends nothing (checked at 200ms).
  - 22: a drag sends **nothing while the row is held**; the order is saved once on the drop
    (checked: held 1.5s, no request; one request on release). Arrows keep their 700ms.
- Migrations: the Card line drop and the press-feedback column are on dev and **prod**
  (owner's go-ahead, 2026-10-04). Prod's deployed code selects the dropped column until
  this PR is merged and deployed, so the merge follows at once.
- Tests: unit 47, unchanged (seed snapshot regenerated); e2e 24 passed.

**9.3 notes, the owner's third review (2026-10-04; branch `fix/phase-9-review-3`).**
- 19: the close keeps the reversed order and paths and starts quick, then settles (the
  mirrored curve started slow and ended fast). The opening's own curve was tried and started
  too abruptly, so the close has a gentler one (`cubic-bezier(.32,.5,.3,1)`) over .96s.
- 17: a scrollbar showed on some modals with almost nothing to scroll. Measured on the dev
  content: a five-line Description overflowed the 420px wide body by 1px (the projects with
  images happened to have the longer copy). The wide modal is 460px, which fits a full
  six-line Description; all three dev projects measure no scroll. On a phone the 60% cap
  still scrolls long copy, as the owner allowed.
- 22: a drag stopped as soon as the pointer left the handle. Trading places moves the held
  element in the DOM, which drops its pointer capture. The drag now listens on the window
  until the pointer is let go (checked: a row dragged the length of the list with the
  pointer far from the handle, both ways).
- Process (owner): no auto-merge; a PR merges only when the owner says the work is done.
- Axe flake fixed: "home passes axe" intermittently reported the hero scroll cue's contrast
  (about 1 run in 6). The spec waited for the cue's opacity to be 0, which is also true
  before it first shows, so the fade-out could land mid-audit. The cue now carries its state
  (`data-cue`: waiting, shown, gone) and the spec waits for `gone`; 16 runs in a row pass.
- Tests: unit 47, unchanged; e2e 24 passed.

**9.3 notes, roadmap E (item 22; first on `feat/phase-9-drag-reorder`, then joined D's branch).**
- `components/admin/use-drag-sort.ts`: pointer events (mouse and touch), no library. Items
  carry `data-sort-id`; while a handle is held, the item under the pointer trades places once
  the pointer is past its middle (so items of unlike sizes don't swap back and forth).
- Lists: a six-dot handle beside the arrows on ordered lists; `useListActions` gains
  `moveTo`, which the arrows now go through too; the order is saved by the same debounced
  request. Skill chips drag by their text inside the tag box and save with the form.
- Fixed with it: an earlier save's refresh could overwrite a move made just after it (the
  server's older rows replaced the optimistic ones). Server rows are now skipped while a
  reorder is pending.
- Checked in a browser, desktop and phone (a one-off spec with real pointer input, removed):
  a list row dragged up two places and saved; put back with the arrows; a chip dragged past
  its neighbour. Not tried with a real finger: the owner's phone decides. Tests: unit 47,
  unchanged; e2e 24 passed (admin axe included: the handle adds no violation).

**9.3 notes, roadmap F (item 23; branch `feat/phase-9-media`).**
- Paste: the single-file field (`file-field.tsx`) and the new media list take a pasted image
  while the focus is inside the field; both zones read "Drop, paste or browse".
- Modal media: `Project.media` (`{ kind: 'image' | 'video', src }[]`, GIFs are images), up
  to six; `project.media jsonb`. Admin: a **Modal media** list on Projects
  (`media-field.tsx`): several files at once, drag to reorder, × to remove. Upload kind
  `media` (JPG, PNG, WebP, GIF, MP4, WebM, 10 MB); the bucket's allowed types widened.
- The modal (`project-media.tsx`), per the owner's call (2026-10-04) in place of an
  always-on carousel: a native scroll-snap strip (swipe on phones; ‹ › on hover or focus on
  wide screens; ← → with the strip focused), dots when there is more than one, videos muted
  and looping, only the item in view playing. **No auto-rotation by default**; a new setting,
  **Project media** (`settings.media_auto_rotate`), turns it on: 5s an image, a video until
  it ends, paused on hover or focus. Reduced motion: no rotation, no autoplay.
- Migration `20261007000000_project_media.sql` (additive: both columns and the bucket's
  types), pushed to dev and prod.
- Sample media for testing (owner): `public/samples/` (two photos, a GIF, an MP4, drawn and
  recorded in headless Chrome, about 265 KB). The first fixture project has one of each
  kind, the second two photos; the first two live projects in **dev and prod** were given
  the same (only where they had none).
- Limits, on both sides (owner: "is the limit respected?"): six items at most and no file
  twice, in the shared `validate()` the editor and every route handler run (a seventh is a
  422 even if the form is bypassed); the list also hides its add zone at six and drops what
  doesn't fit. File type and the 10 MB size are checked in the browser, by the upload route
  and by the bucket. Unit-tested (`schema.test.ts`).
- Coverage (owner): both fixture sets keep projects with several media items and projects
  with none at all (no media, no cover), asserted in `fixture-repositories.test.ts`; dev and
  prod likewise (their third project onward has none).
- Axe caught the strip as a scrolling region the keyboard couldn't reach; it is focusable
  when it holds more than one item.
- Checked in a browser, desktop and phone: next / swipe, the dots' count, no movement with
  the setting off, rotation with it on, the video playing in view, the admin list (remove,
  count). Tests: unit 47, unchanged (seed snapshot regenerated); e2e 24 passed, the axe specs included.

**9.2 notes (roadmap G, item 24; branch `feat/phase-9-site-meta`).**
- Settings gains **Site title** (required, 70) and **Site description** (200):
  `settings.site_title`, `settings.site_description` (migration
  `20261008000000_settings_site_meta.sql`, additive; the defaults are the old constants, so
  nothing changes until they are edited). The root layout's `generateMetadata` reads them.
  Reset to defaults leaves them alone: it puts back the look, not the words.
- The profile's **Name** now drives every spot that was hard-coded: the title template
  ("Article — Name"), authors and the Open Graph site name, the share cards' alt text, and
  the admin's wordmark (sidebar, phone header, sign-in).
- The share cards moved from the `opengraph-image` file convention to route handlers
  (`app/og/route.tsx`, `app/(site)/articles/[slug]/og/route.tsx`), named with their alt text
  in the pages' metadata: the convention's alt is a constant, and its `generateImageMetadata`
  broke the build under the `(site)` route group.
- Checked in a browser on a fixtures build: the shipped title, description and alt text;
  then, after editing Settings and Hero → Name in the admin, the new title, description,
  `og:title`, `og:site_name`, `og:image:alt`, the article's title suffix and the wordmark;
  both card URLs answer `image/png`. Tests: unit 47, unchanged in count (settings assertions
  added); e2e 24 passed.

**9.2 scope (owner, 2026-10-03).** The tab title and the search/share description are
hard-coded in `app/layout.tsx` (`NAME`, `DESCRIPTION`: "Tanishk Saxena — Software Engineer",
"…a frontend engineer in Delhi building quiet, careful software…"), so the admin can't change
them and they still describe the placeholder. Make both editable, probably as new Settings
fields (site title, site description), read by the root metadata (title default and template,
`description`, `openGraph`). Related, also hard-coded today: the name in the title template
(could come from the profile's Name), the preview images' alt text
(`app/opengraph-image.tsx`, `app/(site)/articles/[slug]/opengraph-image.tsx`, both since
replaced by route handlers, see the 9.2 notes), and the admin's
wordmark (`components/admin/{admin-header,admin-sidebar,sign-in-form}.tsx`). Found while
drafting the admin test content (`docs/admin-test-content/`, git-ignored, local only).

**9.3 findings (owner's admin test on dev, desktop, 2026-10-03).** Numbered as the owner
reported them; owner calls are final (record design changes in the specs' revision sections
as each lands). The roadmap above orders them and carries the decisions of 2026-10-04 (items
4–23); where the two differ, the roadmap wins.

Bugs:
- **B1 · Skill groups past four.** Duplicate creates a fifth group, past the hard limit of four.
  The cap lives only in the list page, which hides New at four
  (`app/admin/(signed-in)/[section]/page.tsx:38`); no route enforces it, though
  ADMIN-DESIGN-SPEC §8.7 says "enforced on the server too". Enforce it on create, duplicate and
  restore (Undo of a delete), client and server. The owner isn't sold on four skill columns
  either: explore a better layout in Phase 9, keep the columns until then.
- **B2 · Items per skill group (#13).** "Four to six per column" is only a hint today; the owner
  wants it a hard limit (4–6), enforced client and server.
- **B3 · External URL and body together (#19).** An article can be saved with both. Allow one
  or the other, never both (client, server, and a database check).
- **B4 · Validation timing (#18).** Some errors show as you type, others only after Save; make
  every rule that can show early show early, the same way in every section.

Admin UI/UX:
- **#6 Save disabled when clean**, like Discard.
- **#4 Toasts** stack when several are up (vertically or horizontally), and follow the theme and
  accent (pure white today).
- **#5 Delete from the list**, for every kind of entry (project, role, group, article, quote),
  not only from inside the editor.
- **#8 Markdown hint** above the article body: say it supports Markdown, instead of the partial
  syntax list (`## heading · > quote · blank line = paragraph`).
- **#9 Debounce** quick repeated actions: e.g. toggling Published on one row several times sends
  one request (the final state), not one per press. Widened (2026-10-04): every button and
  request, debounce or in-flight lock (roadmap item 13).
- **#11 Focus.** The admin lacks autofocus in general: a delete confirmation focuses its Delete
  button; a dialog focuses its primary action.
- **#12 Drag to reorder**: the skill pills within a group, and the lists (already an optional
  feature, now wanted).
- **#16 Reset to defaults** on the Settings page.
- **#17 Leave dialog shows the changes.** "Keep editing / Discard" lists what was changed.

Site UI/UX:
- **#2 No-image placeholder.** The project card's "Project image" label becomes something
  like "No preview to show".
- **#3 Modal close button vs. date.** The close button sometimes overlaps the project's date;
  move the date below the project name.
- **Card line (owner's question).** The project's Card line (`summary`) shows nowhere today
  except as the modal's fallback when Description is empty (the card shows image, name, type
  and year; projects have no pages, so no link previews either, despite the field's hint).
  Decided 2026-10-04: drop the field (roadmap item 21).
- **#7 Ripple effect.** Rethink the Material-style ripple, consistently across the site and
  admin: the delays added so it registers don't sit right, places without them finish before
  it shows, and on some buttons it looks wrong. Choose an effect that reads at any speed.
- **#14 Quote rotation** transition is too busy; make it calmer.
- **#15 Menu closing.** The arc and the wheel close in reverse (items hide one by one, in
  reverse circular order, behind the centre button), and only as the last one hides does the
  button travel back to its place.

Enhancements:
- **#1 Paste images** into image fields (alongside upload). And optional **modal media** for
  projects: a GIF, a video or a different image, shown in the modal only (the card keeps its
  image; the modal falls back to the card image when none is set). Widened (2026-10-04): a
  list that rotates like a carousel (roadmap item 23).

**9.1 notes.** `@lhci/cli` with `lighthouserc.cjs`: the production build (`next start`),
home, `/articles/second-render` (the fixture article with a full body) and `/admin/sign-in`
(CI can't sign in), three runs each (the median counts), mobile then desktop.
`npm run lighthouse` runs it all and `scripts/lighthouse-summary.mjs` writes the scores
table and a `::warning::` per page under budget (performance ≥ 95, accessibility 100). CI:
a separate `lighthouse` job beside `check`, so it neither slows nor gates the required
check; the step is `continue-on-error`; the table goes to the run's Summary page and a
pinned PR comment; the full reports are the `lighthouse-reports` artifact (7 days).
First reading (local, median of 3), in `docs/PERFORMANCE.md`: mobile performance 80 / 85 /
90 (home / article / sign-in, LCP 3.3–3.9 s: P-1), desktop 99 / 99 / 100; accessibility 100
everywhere; best practices 96 everywhere; sign-in SEO 63 (expected: `noindex`). So this PR
already shows the amber warning while CI stays green, which is 9.1's verification.

---

## Test consolidation ✅

| Step | Branch | Scope | Status |
|---|---|---|---|
| T.1 | `chore/tests-consolidate` | Fewer tests, same behaviours; live suite opt-in; reports in GitHub | ✅ PR #19 |
| T.2 | `test/report-polish` | Report per viewport; the flaky scroll-cue axe reading fixed | ✅ |

Owner asked for fewer, faster tests without losing anything important, and readable reports
in GitHub. Unit (offline, CI): 82 → 33 tests in 7 files (~8 s), every behaviour kept: the
repository contract 11 → 4 tests (each reads once), migration checks run their constraint
test once and RLS in both grant modes (15 → 6), small utils merged into
`lib/utils/utils.test.ts`, site + JSON-LD into `lib/seo.test.ts`. Live: the two dev-project
suites merged into `lib/repositories/supabase/live.test.ts` (19 → 8 tests), now opt-in
`npm run test:live` (it never ran in CI, and two live files side by side caused the one
timeout). E2E: smoke 6 → 3 journeys (with named steps); axe unchanged. Both run on desktop
and mobile (owner: a11y and perf are never judged on one device): 20 → 14 runs.

Reporting: Vitest and Playwright write JUnit to `reports/`. `scripts/test-summary.mjs` names
each e2e suite after its viewport and writes a table; `dorny/test-reporter@v3` puts every
test on the run's Summary page (one table per suite and viewport, test names prefixed
`[desktop]` / `[mobile]`); a pinned PR comment (`marocchino/sticky-pull-request-comment`)
shows unit, smoke × 2 viewports and axe × 2 viewports (passed / failed / skipped / summed test
time / gate), edited on every push. Neither decides the outcome; a11y failures show ⚠️, never
❌. Failures are also annotated on the PR's lines.

T.2 fixes: PR #19's report merged both viewports into one suite with duplicate test names, so
one of the 14 e2e results collapsed (13 shown); fixed by the viewport labels above. Its axe
run flagged `color-contrast` on the hero's scroll cue (desktop, light). Not a real contrast
failure (the cue is `--muted`, ≈ 5.2:1): the cue fades itself out ~5 s after load, and the
slower runner audited it mid-fade. The axe test now waits for the cue to finish before
auditing.

## Notes / decisions made during the build

- 2026-10-02, docs process (owner): docs move with the code in the same PR, by the five steps
  in `CLAUDE.md`'s working agreement (facts listed from the diff, old names and numbers
  grepped, state files walked, prose edited with the Edit tool, staged diff read back). This
  replaces the after-merge sweep, which twice left stale docs behind.
- 2026-10-02, after Phase 8 (owner): the steps still missed stale docs, so before every merge
  Claude reminds the owner to ask for a docs pass, and does it when asked (`CLAUDE.md`).

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
