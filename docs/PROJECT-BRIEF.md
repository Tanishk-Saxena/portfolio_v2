# Project brief

Everything non-visual: what this is, the stack, the rules, the content model, the working
agreement. Visual and behavioural design: `docs/DESIGN-SPEC.md` (site) and
`docs/ADMIN-DESIGN-SPEC.md` (admin). Status: `docs/PROGRESS.md`.

## 0. Precedence and standing direction

1. **Owner revisions win over everything**: `docs/DESIGN-SPEC.md` §10 (site) and
   `docs/ADMIN-DESIGN-SPEC.md` §14 (admin). Record new ones there.
2. Then **what ships** and the specs. (The original Claude Design mockups were the first
   source; they were removed from the repo on 2026-10-18 and are in git history under
   `docs/design/`.)
3. Then this brief.

Standing direction from the owner:
- **Meet rules by intent, invisibly where possible.** Keep the design's look and feel; reach a
  rule's goal some other way (an invisible 44px hit area, not a bigger button). Hard floors
  (WCAG 2.1 AA contrast, keyboard access, reduced motion) are always met.
- **Performance by intent.** The site must never lag on an older phone; that is not a mandate
  to strip motion. A short, contained, user-initiated animation of a non-composited property is
  fine. Not fine: layout thrash, scroll-linked JS, animating many elements' layout at once,
  heavy filters on large areas.
- **Motion is a feature**: quiet, warm, careful; small distances, soft easing, never bouncy.
- **Don't block on questions.** Make a reasonable call, tag it `[ASSUMED]` in the spec, keep
  going. Push back in the summary, not as a blocker.
- **Simplicity and reliability first** (2026-10-18): no process or tooling that repeats what
  the PR checks already cover; test the paths prod runs.

## 1. What this is

A portfolio site for a software developer, plus an auth-secured admin to edit all of its
content. Two readers: a recruiter skimming on a phone for 40 seconds, and an engineer reading
the detail. The custom admin is part of the demonstration.

The developer: frontend engineer at ION Group, India, about two years in; TypeScript and
Angular (some AngularJS) building dense, real-time trading UIs; also backend, some data science
and ML, DSA, CI/CD.

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript, `strict` |
| Styling | Tailwind v4, driven by CSS-custom-property tokens (`styles/tokens.css`, `app/globals.css` `@theme`) |
| Data | Supabase: Postgres, Auth, Storage. Two projects: **dev** and **prod** (`docs/SUPABASE.md`) |
| Auth | Supabase Auth, email + password, sign-ups off, an allowlist (`lib/auth/`, `proxy.ts`) |
| Hosting | Vercel: production at https://tanishk-saxena.vercel.app, a preview per branch |
| Testing | Vitest (+ Testing Library, PGlite); Playwright + axe in Chrome and Safari's engine; Lighthouse CI; all beyond unit tests against a local Supabase in CI. Dependabot for updates |

## 3. Constraints

**Functionality is a gate**: CI is red while something is broken. **Performance and
accessibility are targets**, always measured and flagged (amber in CI, open items in
`docs/PERFORMANCE.md`), never blocking.

- **Performance:** LCP < 2.0 s on simulated 4G mid-tier mobile; CLS < 0.1; no entrance may hide
  the LCP text (LCP ignores `opacity: 0`, clipped and masked content); fonts self-hosted via
  `next/font` with size-adjusted fallbacks; images with explicit dimensions.
- **Accessibility:** WCAG 2.1 AA; everything keyboard-operable with a visible focus ring;
  icon-only controls named; 44×44 touch targets; `prefers-reduced-motion` gives a static but
  fully usable site; axe clean. **By construction**: whatever content or a setting can change
  is made accessible in code (the article renderer, the admin's validation, names derived from
  content, clamps), so real content never needs an audit.
- **Mobile first:** built at 390px first; nothing load-bearing depends on hover.
- **Motion:** prefer `transform` and `opacity`; no scroll hijacking (no Lenis and the like);
  View Transitions for page changes.
- **Content robustness:** every component survives a long name, an empty optional field and
  more items than the design showed.

## 4. Architecture

**The repository boundary is the core rule.** Components never call Supabase or import the
seed. All data goes through the interfaces in `lib/domain/repositories.ts`, returning the
types in `lib/domain/types.ts`. `lib/container.ts` is the one composition root. Every
repository method is `async`. (ESLint enforces the boundary.)

**One data path** (owner, 2026-10-18: simplicity and reliability over plug-and-play): the app
always runs on Supabase (`lib/repositories/supabase/`), the path production runs; which
project is only a matter of keys (dev, prod, or CI's throwaway local one). Tests go through the
same path: CI starts a local Supabase loaded with the seed (`lib/seed`: the shipped
placeholders plus stress cases at the real limits) and runs the repository contract, RLS, the
e2e journeys and Lighthouse against it. Tests that write refuse any Supabase that isn't local.

```
app/(site)/            the public page and /articles/[slug]
app/admin/, app/api/admin/   the admin and its write endpoints (each re-checks getAdmin())
proxy.ts               optimistic /admin + /api/admin guard; RLS is the real boundary
components/{sections,ui,site,article,admin}/
lib/{domain,repositories,admin,auth,utils}/
lib/seed/              the one dataset: shipped placeholders + stress cases
styles/tokens.css      every token, both modes, reduced motion
supabase/              migrations, seed.sql (generated from lib/seed), config
```

Conventions:
- kebab-case files; one PascalCase component per file; **≤ 200 lines per component file**.
- Server Components by default; `'use client'` only where interaction needs it.
- Tailwind utilities do the styling; hand-written CSS only in `tokens.css` (inside
  `@layer base` / `@layer components`, since unlayered rules beat utilities) or where
  utilities can't express it. **No magic values**: extend the tokens instead.
- Colour utilities are `paper`, `surface`, `ink`, `muted`, `accent`, `accent-fill`; dark mode is
  `[data-theme='dark']` (`@custom-variant dark`).
- `typecheck` runs `next typegen` first (`LayoutProps` / `PageProps` are generated).
- Conventional commits. Never commit `.env*` or any key.

## 5. Content model

Every entity has `id`, `created_at`, `updated_at`, `deleted_at` (soft delete), and a
`sort_order` where the owner controls order. Public reads return only published / active,
non-deleted rows. `image` = `{ src, alt, width, height }` (+ optional focal point).

| Entity | Fields |
|---|---|
| `profile` | name, eyebrow, headline, headline_highlight, standfirst, cta_label, about_lead, about_paragraphs[], portrait, resume_url, email, contact_statement, location, footer_note |
| `experience` | role, org, start_date, end_date (null = current), summary (simple Markdown), sort_order |
| `skill_group` | title, items[] (4–6), sort_order; at most 4 groups |
| `project` | title, kind (`open-source` \| `side-project` \| `client-work`), year, description (≤ 320), tags[], image, media[] (≤ 6 images/GIFs/videos), repo_url, live_url, published, sort_order |
| `article` | slug, title, excerpt, published_at, read_minutes (null = estimated), body (Markdown) **or** external_url, status (`draft` \| `published`), listen |
| `quote` | text (≤ 140), author, active, sort_order |
| `social_link` | label, url (empty = hidden), sort_order |
| `settings` | accent, grain, menu_layout, media_auto_rotate, script_font, signature_intro, site_title, site_description, github_username |

Standing decisions:
- Projects have no detail route: the modal plus the repo README are the write-up.
- An article with a body lives at `/articles/[slug]`; one without links to its `external_url`.
- Contact is `mailto:` plus social links: no form, no inbox.
- Content shipped as placeholders (the mockup's copy and placeholder media); the owner enters
  real content through the admin.

## 6. Phases

All built (2026-10-18). One line each; what happened and why: the ledger's **History**.

- **Milestone A, the public site** — 0 repo and design extraction; 1 foundation (tokens, CI);
  2 domain and fixtures; 3 the site; 4 motion; 5 ship (Vercel, metadata, OG, sitemap, JSON-LD,
  analytics).
- **Milestone B, database and admin** — 6 content model v2 and Supabase; 7 admin auth; 8 the
  admin portal (every section, uploads, Settings).
- **9, UI review and features** — Lighthouse CI on every PR (a reading); signed-in admin e2e
  and axe in CI; the owner's findings; site title and description; the re-evaluation outcomes
  (items in the ledger's roadmap index).
- **10, final audit** — one Lighthouse reading of prod and the signed-in admin, and the cheap
  fixes (Caveat no longer preloaded). **No standing audit** (owner, 2026-10-18): per-PR
  Lighthouse and axe, and Speed Insights on the live site, already cover it. P-1 stays a
  flagged item.
- **After 10, one data path** (2026-10-18) — the fixture repositories and `DATA_SOURCE`
  removed; CI tests against a local Supabase with the seed; signed-in admin Lighthouse on every
  PR; accessibility closed in code for anything content can change (§3).

Next: the owner's end-to-end test round. After that every fix or request is an ordinary PR.

## 7. Out of scope

Contact form and inbox, project detail routes, case studies, i18n, comments, guestbook,
newsletter, an RSS blog, `/uses`, draft preview on the site.

## 8. Working agreement

- No approval needed to build. **Before every commit, the owner reviews the diff**; commit
  only once approved.
- Trunk-based: short-lived `<type>/<desc>` branches, a PR into `main`, CI green; **the owner
  merges** (`CONTRIBUTING.md`).
- **Docs move with the code**, in the same PR, by the steps in `CLAUDE.md`.
- When something can't be verified, say so. Don't claim "matches the design" without
  comparing.
