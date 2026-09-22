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
- `docs/DESIGN-SPEC.md` — exact values extracted from the mockup, plus resolved decisions tagged `[ASSUMED]` (§9 lists them). Build from this.

Precedence: **the mockup wins every contradiction** (brief §0.1). Meet the brief's rules by intent, invisibly where possible.

Owner's standing direction (brief §0.1): keep the site smooth on older phones without stripping motion. Motion is a crafted feature, subtle in tone. Don't block on questions: make a call, tag it `[ASSUMED]`, keep going.

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

- Tokens live in `styles/tokens.css` (ship values from DESIGN-SPEC §1.1a: muted `#6D655C`, accent `#A9491F`, dark accent = accent + 24% white, `accent-fill` for filled surfaces in both modes).
- Fonts: Newsreader display/long-form, IBM Plex Sans UI/body, Caveat 600 only for the signature and the hero's highlighted word.
- Single breakpoint at 760px, via container queries on the `page` container (`@wide:`); mobile (390px) first; measure 1140px (760px articles).

## Constraints that gate every phase

- LCP < 2.0s, CLS < 0.1. Don't hide the LCP text behind an opacity-0 entrance.
- WCAG 2.1 AA, keyboard operable, 44px hit areas (invisible extension is fine), `prefers-reduced-motion` gives a static but fully usable site.
- No scroll hijacking. Prefer transform/opacity; small contained exceptions per brief §0.1.
- Components must survive variable-length content (long titles, empty optional fields, extra items).

## Working agreement

Phases in order: build → verify → commit → next phase, no approval gate. Don't claim something "matches the design" without comparing against the mockup. The admin UI has no design yet — never improvise one.
