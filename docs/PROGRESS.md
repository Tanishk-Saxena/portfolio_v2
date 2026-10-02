# Progress ledger

Current state of the build. Updated before every commit; each commit waits for the owner's
diff review (brief §8).

**Now:** Phase 9.1 (Lighthouse CI) complete · next: Phase 9 — the UI review and features (owner's gaps, optional features); alongside, Phase 8 verification (owner tests the admin and enters real content on a phone; admin axe pass; every Settings combination). Phase 10, the final audit, is last

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
| 8.5 | `feat/phase-8-settings` | Site variants (slate blue, bottom-centre button, centre wheel, grain) + admin Settings; owner enters real content on a phone | ✅ PR #26 · hand-over: owner |

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

**Phase 8 verification (brief §6), still open:**
- [ ] Owner tests the whole admin (sign in at `/admin`; `DATA_SOURCE=supabase` so saves reach
      the dev database) and flags gaps; fixes go in follow-up PRs.
- [ ] Owner replaces the placeholder content through the admin, on a phone.
- [ ] axe on the admin screens, desktop and phone (flagged, never blocking). It can't run in
      CI, where the admin stays locked without Supabase keys: run it locally, signed in with
      a throwaway admin as the browser checks above did.
- [ ] Every Settings combination in both modes (so far: the defaults, and slate + bottom
      centre + centre wheel at 1440 and 390, light and dark).
- [x] Server validation repeats every client rule (one schema module; the handlers'
      statuses are unit-tested).
- [x] A save confirms with a toast once the database has it (checked on the dev server).
- [ ] …and shows on the *deployed* site on the next reload: the dev server renders every
      request, so the production path (prerendered pages, `revalidatePath`) is still
      unchecked. Check on a Vercel preview, which reads the dev project.

**What's left after Phase 8 (2026-10-02, owner's order, brief §6):**
1. ~~Phase 9.1, Lighthouse CI as an amber reading on every PR~~ — done (Phase 9 below).
2. Phase 9, the UI review: the owner's gaps from testing, plus whichever optional features
   they pick (RSS blog, `/uses`, signature intro, drag-to-reorder, draft preview, heat map).
3. Phase 10, the final audit, last: Lighthouse on the live site and the admin, fix what
   falls short (including P-1 in `docs/PERFORMANCE.md`), record the scores.

Owner revisions so far: ADMIN-DESIGN-SPEC §14 (style settings kept, tilt dropped; unshipped
shades tweaked to pass AA; "saved" = database confirmed, no reloads). Defaults still open for
the owner (§13): articles keep an External URL field (Q-A12); Name/Location on Hero and
Footer note on Contact (Q-A8).

---

## Phase 9 — UI review and features

Order (owner, 2026-10-02; brief §6): Lighthouse CI first, then the UI review and features;
Phase 10, the final audit, last.

| Step | Branch | Scope | Status |
|---|---|---|---|
| 9.1 | `feat/phase-9-lighthouse` | Lighthouse CI on every PR as a reading (mobile + desktop), pinned scores, warnings under budget | ✅ |
| 9.x | — | The owner's UI gaps from testing; the optional features they pick | next |

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
