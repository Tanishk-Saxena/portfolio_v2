# Portfolio Site — Project Brief

**Version:** 2 (supersedes everything earlier)
**Status:** Milestone A live; Milestone B done (Phase 8 closed by the owner's admin test, 2026-10-03); Phase 9.1 (Lighthouse CI) and 9.4 (test infrastructure: signed-in admin e2e in CI, a blocking journey and axe) done; the rest of Phase 9 planned in full (the ledger's Phase 9 roadmap, owner, 2026-10-04), the owner's findings (9.3) and the site title and description (9.2) done; the re-evaluation outcomes (9.5) next, in a new session, from the ledger's "What's left of Phase 9" list; then Phase 10, the final audit. Current step: `docs/PROGRESS.md`

---

## 0. Read this first

All earlier planning and design documents for this project are **void**. Any
earlier visual direction, palette, typography or interaction concept is
discarded and must not be reintroduced.

There is exactly one source of truth for how this looks: the **Claude Design
mockup**, and the `docs/DESIGN-SPEC.md` extracted from it. This brief covers
everything that is *not* visual — stack, architecture, data, phases, rules.

Where this brief and the mockup disagree about structure (which sections exist,
what a section contains), **the mockup wins** and this document gets corrected.

### 0.1 Standing direction from the owner (overrides anything below that conflicts)

> **Owner revisions win over the mockup.** Changes the owner settled after building and
> testing on real devices are recorded in `docs/DESIGN-SPEC.md` §10. They are final and
> override the mockup and everything below.

- **The mockup wins every contradiction**: visual, structural *and* behavioural. The
  mockups are very close to the intended result. When a rule in this brief would change
  what the mockup does, keep the mockup's look and feel, and meet the rule's *intent*
  some other way (e.g. a larger invisible hit area instead of a bigger button). Hard
  accessibility floors (WCAG 2.1 AA contrast, keyboard access, reduced motion) are still
  met, as invisibly as possible.
- **Understand the sentiment of the performance rules; don't apply them literally.** The
  goal is a site that never lags on a mid-range or older phone. It is **not** a mandate to
  strip out motion. A short, contained, user-initiated animation of a non-composited
  property (one accordion row's height, one image's blur on hover) is fine. What is not
  fine: continuous layout thrash, scroll-linked JS work, animating many elements'
  layout at once, heavy filters on large areas, or anything that janks scrolling.
  Hover-only effects can be richer, because hover-capable devices are rarely the weak ones.
- **Motion is a feature. Craft it, with subtlety.** The tone is quiet, warm and careful:
  small distances, soft easing, nothing bouncy or showy. Within that, motion should be
  refined: spring-like settles, choreographed staggers, micro-interactions that reward
  attention. Always subtle, never absent.
- **Keep momentum. Don't block.** Iteration beats perfection. Take the owner's input as a
  starting point and build on it. Make reasonable calls and record them (tag assumptions
  `[ASSUMED]` in the spec) rather than stopping to ask design questions. Phases still run
  in order, in small steps; **each commit waits for the owner's diff review** (§8).

---

## 1. What this is

A personal portfolio website for a software developer, plus an auth-secured
admin portal for editing its content.

Two readers to serve at once: a recruiter skimming on a phone for 40 seconds,
and an engineer who might actually read the detail.

The custom admin exists because building it is part of the demonstration, not
because an off-the-shelf CMS wouldn't work.

### About the developer (for copy and framing)

- Frontend engineer at ION Group, India. Roughly two years in the industry.
- Day job: TypeScript and Angular (plus some AngularJS), building trading
  interfaces — dense, real-time, data-heavy UI where performance genuinely matters.
- Also covers backend, some data science and ML, DSA, and CI/CD at project level.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js** (App Router, latest stable) |
| Language | **TypeScript**, `strict: true` |
| Styling | **Tailwind CSS**, driven by design tokens as CSS custom properties |
| Data | **Supabase**: Postgres + Auth + Storage. Live since Phase 6.2 (dev + prod projects, `docs/SUPABASE.md`) |
| Fixtures | **Typed in-repo fixtures** (§5): the seed, the local default and the test data |
| Auth | Supabase Auth, single-admin allowlist, no public signup. Live since Phase 7 (`lib/auth/`, `proxy.ts`) |
| Hosting | **Vercel**: production at https://tanishk-saxena.vercel.app, a preview per branch |
| Testing | Vitest + Testing Library; Playwright for critical paths |

Verify current stable versions before scaffolding rather than trusting this file.

---

## 3. Constraints

**Functionality** is a gate: a phase is not complete, and CI is not green, while something is
broken. **Performance and accessibility** (owner, Phase 5) are targets that are always
measured and always flagged, but never block a phase, a merge or a deploy (a slow site beats
no site). Misses are tracked as open items in `docs/PERFORMANCE.md` and addressed
separately; in CI they show as warnings (amber), never red.

### Performance
- **LCP under 2.0s** on simulated 4G / mid-tier mobile.
- **CLS under 0.1.** Reserve space for every image and every sticky element.
- No entrance animation may delay the largest text from painting. **LCP ignores
  elements at `opacity: 0`, and clipped or masked content is not painted** — so
  a hero fade or wipe costs its own duration in LCP. Animate properties that
  don't hide text.
- Fonts self-hosted via `next/font`, variable, subset, with `size-adjust`
  fallback metrics so swapping doesn't shift layout.
- Below-the-fold content lazy-loaded; images with explicit dimensions.

### Accessibility
- **WCAG 2.1 AA.** Body text ≥ 4.5:1, large text and UI ≥ 3:1.
- Everything interactive reachable and operable by keyboard, with a visible
  focus ring.
- Icon-only controls always carry accessible names.
- Touch targets ≥ 44×44px.
- `prefers-reduced-motion` handled in the token layer from Phase 1. Reduced
  motion must leave a fully usable site, not a broken one.
- Axe clean, plus a manual keyboard pass and one screen-reader pass before ship.

### Mobile
Mobile is the **primary** target. Every component is designed and built at
390px first; desktop is the enhancement. Nothing load-bearing may depend on
hover or a cursor.

### Motion
- Prefer `transform` and `opacity`. Never animate layout on many elements at once or
  on scroll. Per §0.1, a single contained, user-initiated animation of another property
  (an accordion's height, a hovered image's blur) is allowed when the mockup calls
  for it.
- **No scroll hijacking.** No Lenis, Locomotive or ScrollSmoother. Native scroll
  plus CSS scroll-driven animation.
- Springs for user-initiated interaction; duration easing for entrances.
- View Transitions API for any page-to-page navigation.

### Content robustness
Content is variable-length and unknown at build time. Every component must
survive a long name, an empty optional field, and five bullets where the mockup
showed two. A layout that only works with perfect placeholder text is a bug.

---

## 4. Architecture guardrails

### The repository boundary — the most important rule in this document

All data access goes through **repository interfaces**. Components never import
fixtures directly and never call Supabase directly.

```
lib/
  domain/
    types.ts                      // domain models — Project, Experience, ...
    repositories.ts               // the interfaces
  repositories/
    fixtures/
      fixture-repositories.ts     // in-memory implementation (Phase 2)
      fixture-admin-repositories.ts // the admin's reads and writes over fixtures (Phase 8)
      ...
      data/                       // the shipped content, the stress set
    supabase/
      supabase-repositories.ts    // the database implementation (Phase 6)
      supabase-admin-repositories.ts // the admin's, run as the signed-in admin (Phase 8)
      rows.ts, seed.ts, client.ts // row mapping, seed generation, the client
      ...
  container.ts                    // composition root: picks the implementation
```

Rules that make the later swap a non-event:

1. **Every repository method is `async` and returns a Promise**, even though
   fixtures are synchronous. If components are written against sync calls, the
   migration to Supabase becomes a rewrite of every component.
2. **Domain types only.** No fixture-shaped or Supabase-row-shaped type ever
   reaches a component.
3. **One composition root.** Switching the whole app from fixtures to Supabase
   is a change in `lib/container.ts` and nothing else. Ideally driven by an env
   var so both can be run side by side during migration.
4. Repository tests are written against the interface, so the same test suite
   runs against both implementations. If the Supabase implementation passes the
   fixture implementation's tests, the migration is done.

Do not let this erode. It is the entire reason Phase 1 can ship before the
database exists.

### File structure

```
app/
  (site)/page.tsx                 // the public page
  admin/                          // auth-guarded; sign-in (Phase 7), the portal (Phase 8; routes: ADMIN-DESIGN-SPEC §6)
  api/admin/                      // session check (Phase 7); write endpoints (Phase 8, ADMIN-DESIGN-SPEC §9)
proxy.ts                          // optimistic /admin + /api/admin guard (Next 16's middleware)
lib/auth/                         // Supabase session clients, getAdmin(), the gate
components/
  sections/                       // one per page section
  ui/                             // primitives: Button, Card, Field, ...
  admin/
lib/
  domain/  repositories/  utils/
  admin/                          // shared field schemas + validation (client and server)
styles/
  tokens.css                      // design tokens, both modes, reduced-motion
types/
docs/
  PROJECT-BRIEF.md  DESIGN-SPEC.md  design/
```

### Conventions
- Files in kebab-case (`project-card.tsx`). Components `PascalCase`, one per file.
- **Component files ≤ 200 lines.** Past that, extract.
- **Server Components by default.** `'use client'` only where interaction
  genuinely requires it.
- **No granular CSS.** Tailwind utilities do the work. Hand-written CSS is
  limited to `tokens.css` and things utilities genuinely cannot express.
- **No magic values.** Colours, spacing and type come from tokens. If something
  needs a value that isn't in the system, fix the system.
- Conventional commits. Lint, typecheck and tests block merge in CI.
- Never commit `.env*` or any Supabase key.

---

## 5. Content model

Fixtures in Phase 2 mirror this exactly, so the Phase 6 schema is a
transcription rather than a redesign. All entities carry `id`, and a
`sort_order` wherever ordering is user-controlled.

Reconciled against the site mockup (`docs/DESIGN-SPEC.md` §7) and the admin schema
(`docs/ADMIN-DESIGN-SPEC.md` §8, which is authoritative for Milestone B). **Bold** fields
arrive with Milestone B (Phase 6.1).

| Entity | Fields |
|---|---|
| `profile` | name, eyebrow, headline, headline_highlight, standfirst, **cta_label**, about_lead, about_paragraphs[], portrait (image, nullable), resume_url, email, contact_statement, location, footer_note |
| `experience` | role, org, start_date, end_date (null = current), summary, sort_order (**now the display order**) |
| `skill_group` | title, items[], sort_order (at most 4 groups) |
| `project` | title, kind (`open-source` \| `side-project` \| `client-work`), year, description (≤320; the ≤110 `summary` card line was dropped in Phase 9, item 21), tags[], image (nullable), media[] (modal media: `{ kind, src }`, up to 6; Phase 9, item 23), repo_url, live_url (nullable), **published**, sort_order |
| `article` | slug, title, excerpt, published_at, read_minutes (**nullable = estimated**), body (Markdown, nullable), external_url (nullable), **status** (`draft` \| `published`), **listen** |
| `quote` | text (≤140), author, **active**, sort_order |
| `social_link` | label, url, sort_order (edited as four fixed links; empty = hidden) |
| **`settings`** | accent (`terracotta` / `slate`), grain, nav_position (`right` / `centre`), menu_layout (`arc` / `wheel`), press_feedback (`ripple` / `ring` / `press`), media_auto_rotate, site_title (≤70), site_description (≤200) (single record; the last five added in Phase 9) |

`education` is dropped (not in the mockup). `image` = `{ src, alt, width, height }`.
Every table also gets `created_at`, `updated_at`, `deleted_at` (soft delete). Public reads
return only published / active, non-deleted rows.

### Content strategy (owner decision)
All content ships as **placeholders**: the mockup's own copy, verbatim, plus placeholder
media and a placeholder résumé PDF. The same placeholders seed Supabase in Phase 6. Real
content is then entered by the owner through the admin portal (Phase 8), not in code.
Nothing blocks on the owner supplying content.

### Standing content decisions
- **Projects have no detail route.** The modal plus the GitHub README are the
  write-up.
- **Articles use a nullable-body pattern.** `body` present → on-site route at
  `/articles/[slug]` (mockup route). `body IS NULL` → the row links to
  `external_url` (e.g. Medium). Both render identically in the Writing list.
- **Contact is `mailto:` plus social links.** No form, no email service, no spam
  handling, no inbox.

---

## 6. Phases

Incremental. Each phase ends with a verification checklist that must pass before
the next begins. **Do not work ahead.**

### Milestone A — a live public site, no database

The goal of this milestone is a deployed, complete, good-looking portfolio.
All content comes from hardcoded fixtures. No Supabase, no auth, no admin.

**Phase 0 — Repo and design extraction**
Scaffold Next.js, git init, `docs/` folder. Pull the Claude Design mockup in and
write `docs/DESIGN-SPEC.md`: exact hexes for both modes, font families and any
variable-font axis settings, type scale at mobile and desktop, spacing scale,
radii, shadows, and every animation with its property, duration and easing.
Save reference screenshots to `docs/design/`.
*Verify:* the spec contains values, not adjectives. Anything undetermined is
listed explicitly rather than guessed.

**Phase 1 — Foundation**
Token layer from the spec (both modes, reduced-motion), Tailwind theme wired to
those tokens, TypeScript strict, lint/format/typecheck scripts, CI that blocks on
all three. (Deployment moved to Phase 5 — everything works locally first.)
*Verify:* a local production build renders a token test page showing every token in
both modes; CI rejects a deliberately introduced lint error.

**Phase 2 — Domain and fixtures**
Domain types, repository interfaces, fixture implementations, composition root,
realistic content covering the developer's actual career. Content must include
deliberately awkward cases: a long role title, an entry with five bullets, a
project with no live URL, an empty optional field.
*Verify:* repository tests pass against the interface; no component imports
fixture data; every method returns a Promise.

**Phase 3 — Public site**
Every section built from the mockup and served through the repositories. Mobile
layout first, then desktop. No motion yet.
*Verify:* side-by-side against `docs/design/` screenshots at 390px and 1440px —
compared by eye, not asserted; Lighthouse mobile ≥ 95 performance and 100
accessibility; axe clean.

**Phase 4 — Motion and the signature interaction**
Everything in the motion section of the spec.
*Verify:* LCP unchanged from Phase 3; reduced motion gives a static but fully
usable site; the signature interaction works on touch and by keyboard.

**Phase 5 — Ship**
Deployment (host choice finalised here), metadata, OG images, sitemap, robots,
structured data (`Person`), analytics, résumé PDF, custom domain.
*Verify:* rich-results test passes; OG card renders correctly in a real preview;
tested on an actual phone, not a simulator.

**Milestone A is a shippable product.** It can sit live indefinitely while
Milestone B is built.

### Milestone B — database and admin

The goal: nothing on the site is hard-coded. One signed-in owner edits every piece of
copy, media and ordering from a phone or a laptop, and a save is live on the site when
the admin says "Saved". The admin design is done: **`docs/ADMIN-DESIGN-SPEC.md`** (built
from `docs/design/ADMIN-*` and the admin mockups) is the source of truth for it.

**Phase 6 — Content model and Supabase**
- 6.1 *Content model v2, still on fixtures.* Add the admin's fields to the domain,
  fixtures and contract (ADMIN-DESIGN-SPEC §8): `published`, `status`, `active`,
  `listen`, `cta_label`, nullable `read_minutes`, `settings`; experience ordered by
  `sort_order`. The site honours them (hidden entries don't render, Listen per article,
  the CTA label). Settings are stored now; their variants arrive in 8.5. Visually identical with the shipped data.
- 6.2 *Supabase.* Projects (dev + prod), SQL migrations in the repo, RLS (anon reads
  published, non-deleted rows; writes only for the allowlisted admin), seed from the
  fixtures, Storage buckets; Supabase implementations of the public interfaces, with the
  same contract suite run against both; `DATA_SOURCE=supabase`; production switched
  over, pages still prerendered and revalidated on demand (ADMIN-DESIGN-SPEC §9).
*Verify:* the contract suite passes against Supabase unchanged; anonymous writes are
rejected by the database; the public site is unchanged to a visitor.

**Phase 7 — Admin auth**
Supabase Auth (email + password, sign-ups off, one allowlisted account), the designed
sign-in screen, session cookies, `proxy.ts` guard for `/admin/*` and `/api/admin/*`,
sign-out, the admin layout's own theme key.
*Verify:* unauthenticated `/admin` redirects to sign-in and `/api/admin/*` returns 401;
a non-allowlisted account cannot get in; **RLS is the real boundary, the guard is
defence in depth.**

**Phase 8 — Admin portal** (ADMIN-DESIGN-SPEC is the design; one PR per step)
- 8.1 *Shell and lists.* Admin tokens (`--field`, `--line`), the sidebar (wide) and
  header + Sections sheet (phones), routes per section, list pages: search, filters,
  counts, row layouts, empty states. Read-only.
- 8.2 *Editor and saving.* The shared schema/validation module, the Field component
  (every type but file and markdown), the editor bar, side panel, state pill, bottom bar,
  validation summary, create and save through `/api/admin/*` with revalidation, toasts,
  the unsaved-changes guard, ⌘S/Ctrl+S. Covers Hero, About, Contact, Experience, Skills,
  Quotes end to end.
- 8.3 *List actions.* Quick status toggles, reorder (debounced), soft delete with
  confirm + Undo, restore, duplicate, optimistic updates with rollback, 409 on
  concurrent edits, focus trap in the dialog and sheet.
- 8.4 *Writing and media.* Markdown Write/Preview, slug from title, read-time estimate,
  publish rules; uploads to Storage by signed URL (portrait, covers, résumé). Covers
  Projects and Writing end to end.
- 8.5 *Settings and hand-over.* The site builds the style variants it lacks (slate blue
  with its AA dark shade, bottom-centre nav button, centre-wheel menu, adjustable grain),
  the admin Settings page switches them site-wide; then the owner replaces the placeholder
  content through the admin, on a real phone.
*Verify:* every section can be created, edited, reordered, hidden and deleted from a
390px phone; a save confirms with a toast once the database has it, and shows on the
live site on the next reload; every Settings combination works in both modes; server validation
rejects everything the client rejects; axe on the admin screens (flagged, not blocking).

Order after Phase 8 (owner, 2026-10-02): the UI review comes before the final audit, so the
audit measures the finished site; Lighthouse CI comes first, so every UI change shows its
scores as it lands and nothing has to be measured twice.

**Phase 9 — UI review and features**
- 9.1 *Lighthouse CI.* Lighthouse runs on every PR alongside the axe suite as a **reading,
  not a blocker**, against a budget (performance ≥ 95, accessibility 100 on mobile). A
  miss is flagged as a warning (amber), visible on the PR, but never fails the build.
  *Verify:* a deliberately regressing PR shows the warning with its scores and still passes.
- The rest is planned item by item in the ledger's **Phase 9 roadmap** (owner, 2026-10-04),
  which carries every decision. In order:
  - 9.4 *Test infrastructure*: a dev test admin, so CI runs a blocking signed-in admin
    journey and axe on every admin screen (on the fixtures build); the site states its axe
    spec never opened.
  - 9.3 *The owner's findings from the Phase 8 admin test*: bugs (skill-group and item caps,
    External URL or body, validation timing), admin and site UI/UX, drag to reorder, pasted
    images and rotating modal media.
  - 9.2 *Editable site title and description* as Settings fields.
  - 9.5 *Re-evaluation outcomes*: handwriting replaced (a signature font drawn stroke by
    stroke; a new hero-word treatment), the signature intro with a Settings switch, a GitHub
    contribution heat map, Markdown experience descriptions, contact links as a list,
    storage cleanup, options for the skills layout. Skipped by the owner: Medium RSS blog,
    `/uses`, draft preview on the site.
  Watch each PR's Lighthouse reading.

**Phase 10 — Final audit (the last step)**
Measure the whole site's overall performance and accessibility scores (Lighthouse
performance / accessibility / best practices / SEO) on the deployed public pages and the
admin portal, fix what falls short (including P-1, `docs/PERFORMANCE.md`), and record the
scores in the ledger.
*Verify:* the scores meet §3 on the live site.

---

## 7. Out of scope

Contact form and inbox. Project detail routes. Case studies. i18n. Comments,
guestbook, newsletter.

---

## 8. Working agreement

- Phases run in order. Each phase has a short plan and a verification checklist, but
  approval is **not** required to start building (§0.1).
- **Small, spaced-out commits.** Before every commit, the owner reviews the diff. Present
  a summary and wait for approval.
- **Branching:** trunk-based with short-lived feature branches merged into `main` by pull
  request only, CI green, no `develop`. Full rules and safeguards in `CONTRIBUTING.md`.
- **Ledger:** `docs/PROGRESS.md` tracks the current phase and step, what's done and what's
  next. Update it before proposing each commit.
- **Docs move with the code.** Any doc that states a fact a PR changes is updated in that
  same PR, following the five steps in `CLAUDE.md` (working agreement).
- Don't block on questions. Make a reasonable call, tag it `[ASSUMED]`, and keep going.
  The owner iterates on the output.
- Push back on decisions that look wrong, but do it in the summary, not as a blocker.
- When something can't be verified, say so instead of guessing. "Matches the
  design" is not a claim to make without actually comparing the two images.
- Commit at the end of every phase.