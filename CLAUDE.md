# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

Personal portfolio for Tanishk Saxena (frontend engineer, TypeScript/Angular trading UIs) plus, later, an auth-secured admin portal. The repo is currently a bare `create-next-app` scaffold (Next.js 16, React 19, Tailwind v4, TypeScript strict). No application code exists yet — `app/` is still the template.

Read these before doing any work; they are the source of truth:

- `docs/PROJECT-BRIEF.md` — stack, architecture rules, content model, phased plan, non-negotiable constraints. **Everything non-visual.**
- `docs/design/HANDOFF.md` — build checklist, tokens, breakpoints, a11y requirements for the design.
- `docs/design/DESIGN.md` — design rationale, section structure, signature interactions, still-open design options.
- `docs/design/artifacts/*.dc.html` — the Claude Design mockups (`Portfolio`, `Article`, `Mobile preview`, `Dev notes` = behaviour spec). Single-file HTML rendered via `support.js`; they are a *reference spec*, not code to port. Open them in a browser to inspect behaviour.
- `docs/DESIGN-SPEC.md` — referenced by the brief but **not written yet** (Phase 0 output: exact values extracted from the mockup).

Precedence: the mockup wins over the brief on structure (which sections exist, what they contain); fix the brief when they disagree. Known conflict to resolve: the brief says on-site posts live at `/blog/[slug]`, the handoff says `/articles/[id]`.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build
npm run lint     # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit # typecheck (no script yet)
```

No test runner is installed yet. The brief specifies Vitest + Testing Library, and Playwright for critical paths; typecheck/format scripts and CI are Phase 1 work.

## Architecture (planned — see brief §4)

- **Repository boundary is the core rule.** Components never import fixtures or call Supabase. All data goes through interfaces in `lib/domain/repositories.ts` returning domain types from `lib/domain/types.ts`. Implementations live in `lib/repositories/{fixtures,supabase}/`; `lib/container.ts` is the single composition root (ideally env-switched). Every repository method is `async`, even over sync fixtures. Repository tests target the interface so the same suite runs against both implementations.
- Layout: `app/(site)/page.tsx` (single-page public site), `app/admin/` (Phase 7+), `components/{sections,ui,admin}/`, `styles/tokens.css` (all tokens, both modes, reduced-motion).
- Styling: Tailwind utilities driven by CSS-custom-property tokens (Tailwind v4 `@theme` in CSS; there is no `tailwind.config`). Hand-written CSS only in `tokens.css` or where utilities can't express it. No magic values.
- Conventions: kebab-case filenames, one PascalCase component per file, ≤200 lines per component file, Server Components by default, conventional commits.

## Design essentials

- Tokens — light: paper `#F5F0E7`, paper2 `#EDE6DA`, ink `#23201C`, muted `#7A7268`, accent `#B4532A`. Dark: paper `#191714`, paper2 `#221F1A`, ink `#EDE7DB`, muted `#938A7D`, accent derived (light accent mixed with 16% white, never hand-picked).
- Fonts: Newsreader (300/400) display/long-form, IBM Plex Sans (400/500) UI/body, Caveat (600) only for the signature and the hero's highlighted word. The scaffold's Geist fonts are placeholders to replace.
- Single hard breakpoint at 760px; mobile (390px) first; measure 1140px (760px articles).

## Constraints that gate every phase

- LCP < 2.0s, CLS < 0.1. Entrance animations must not hide the LCP text (no opacity-0 or clip/mask on it).
- WCAG 2.1 AA, keyboard operable, 44px targets, `prefers-reduced-motion` gives a static but fully usable site.
- Animate `transform`/`opacity` only; no scroll hijacking libraries.
- Components must survive variable-length content (long titles, empty optional fields, extra bullets).

## Working agreement (from the brief)

Work one phase at a time and do not work ahead; each phase gets a short plan plus verification checklist approved before implementation. Use plan mode for changes touching more than two files. Push back on decisions that look wrong. Don't claim something "matches the design" without actually comparing against the mockup. Commit at the end of each phase. The admin UI has no design yet — never improvise one.
