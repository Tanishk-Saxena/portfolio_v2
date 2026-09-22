# Portfolio Site — Project Brief

**Version:** 2 (supersedes everything earlier)
**Status:** design mockup complete; `docs/DESIGN-SPEC.md` extracted and resolved; build in progress

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
| Data (later) | **Supabase** — Postgres + Auth + Storage |
| Data (now) | **Typed in-repo fixtures** — see §5 |
| Auth (later) | Supabase Auth, single-admin allowlist, no public signup |
| Hosting | **Vercel** (tentative; deployment is finalised in Phase 5, after everything works locally) |
| Testing | Vitest + Testing Library; Playwright for critical paths |

Verify current stable versions before scaffolding rather than trusting this file.

---

## 3. Non-negotiable constraints

Gates, not aspirations. A phase is not complete if it breaks one.

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
      project.repository.ts       // Phase 2 implementation
      ...
      data/                       // the hardcoded content itself
    supabase/
      project.repository.ts       // Phase 6 implementation
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
  admin/                          // Phase 7+, route group, auth-guarded
components/
  sections/                       // one per page section
  ui/                             // primitives: Button, Card, Field, ...
  admin/
lib/
  domain/  repositories/  utils/
styles/
  tokens.css                      // design tokens, both modes, reduced-motion
types/
docs/
  PROJECT-BRIEF.md  DESIGN-SPEC.md  design/
```

### Conventions
- Files `kebab-case.ts`. Components `PascalCase`, one per file.
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

Reconciled against the mockup (see `docs/DESIGN-SPEC.md` §7, which is authoritative).

| Entity | Fields |
|---|---|
| `profile` | name, eyebrow, headline, headline_highlight, standfirst, about_lead, about_paragraphs[], portrait (image, nullable), resume_url, email, contact_statement, location, footer_note |
| `experience` | role, org, start_date, end_date (null = current), summary, sort_order |
| `skill_group` | title, items[], sort_order |
| `project` | title, kind (`open-source` \| `side-project` \| `client-work`), year, summary, description, tags[], image (nullable), repo_url, live_url (nullable), sort_order |
| `article` | slug, title, excerpt, published_at, read_minutes, body (Markdown, nullable), external_url (nullable) |
| `quote` | text, author, sort_order |
| `social_link` | label, url, sort_order |

`education` is dropped (not in the mockup). `image` = `{ src, alt, width, height }`.

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

**Phase 6 — Supabase**
Schema transcribed from the fixtures, RLS policies, seed from the fixture data,
Supabase repository implementations, composition root switched over.
*Verify:* the fixture repositories' test suite passes unchanged against the
Supabase implementations; anonymous writes are rejected at the database level;
the public site is byte-for-byte unchanged to a visitor.

**Phase 7 — Admin auth**
Middleware guard, login, session handling, single-admin allowlist.
*Verify:* unauthenticated `/admin` redirects; a non-allowlisted account cannot
get in; **RLS is the real boundary, the route guard is defence in depth.**

**Phase 8 — Admin portal**
⚠️ **The admin portal design does not exist yet.** It gets its own design pass in
Claude Design before this phase starts, producing a `docs/ADMIN-DESIGN-SPEC.md`.
Do not improvise a UI.

Functional requirements, independent of how it looks: CRUD for every entity,
image upload to Storage, drag-to-reorder for anything with `sort_order`,
validation, and optimistic updates. Same accessibility bar as the public site.

**Phase 9 — Optional**
Blog (on-site posts or Medium RSS), `/uses`, whatever still seems worth it.

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
- **Ledger:** `docs/PROGRESS.md` tracks the current phase and step, what's done and what's
  next. Update it before proposing each commit.
- Don't block on questions. Make a reasonable call, tag it `[ASSUMED]`, and keep going.
  The owner iterates on the output.
- Push back on decisions that look wrong, but do it in the summary, not as a blocker.
- When something can't be verified, say so instead of guessing. "Matches the
  design" is not a claim to make without actually comparing the two images.
- Commit at the end of every phase.