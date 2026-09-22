# Progress ledger

Current state of the build. Updated before every commit; each commit waits for the owner's
diff review (brief §8).

**Now:** Phase 1 — Foundation ✅ committed · next: Phase 2 — Domain and fixtures

---

## Phase 0 — Repo and design extraction ✅

- [x] Scaffold Next.js 16 · `1d1e936`
- [x] Brief, handoff and mockups in `docs/` · `cfdb3ce`
- [x] `docs/DESIGN-SPEC.md` extracted; open items resolved as `[ASSUMED]` · `cbc3cd2`
- [x] Owner direction recorded (brief §0.1, spec Revision 2) · `85874fd`

## Phase 1 — Foundation (in progress)

| Step | Scope | Status |
|---|---|---|
| 1.1 | Tooling: Prettier (+ Tailwind plugin), Vitest + Testing Library, `lint`/`typecheck`/`format`/`test`/`check` scripts, GitHub Actions CI, ESLint ignores `docs/**`, ledger + working-agreement updates | ✅ verified, awaiting review |
| 1.2 | Token layer: `styles/tokens.css` (both modes, bands, focus ring, reduced motion, grain, keyframes), `app/globals.css` `@theme` mapping, `next/font` setup, root layout + pre-paint theme script | ✅ verified, awaiting review |
| 1.3 | `/tokens` verification page (every token, both modes side by side); template assets removed; home stub at `app/(site)/page.tsx` | ✅ verified, awaiting review |
| 1.4 | Verify: lint ✅ typecheck ✅ format ✅ test ✅ build ✅ locally; `/tokens` serves both modes and the built CSS carries the tokens ✅; CI lint-rejection test runs once pushed | partial (needs push) |
Verification checklist (brief §6, adjusted: everything local first):
- [x] Local production build serves the token page in both modes
- [ ] CI rejects a deliberately introduced lint error (runs once the repo is pushed)
- Deployment (host choice and setup) is **deferred to Phase 5**, by owner decision.

## Phase 2 — Domain and fixtures (next)

Domain types from spec §7 · repository interfaces (all async) · fixture implementations ·
`lib/container.ts` · interface-level tests · awkward-content fixtures.

## Phase 3 — Public site · Phase 4 — Motion · Phase 5 — Ship

Not started.

---

## Notes / decisions made during the build

- `@types/node` bumped to `^24` (Vitest 5 peer requirement; local Node is 26).
- Tailwind colour utilities are named `paper`, `surface`, `ink`, `muted`, `accent`, `accent-fill`
  (e.g. `bg-paper`, `text-ink`), so `bg-bg` / `text-text` are avoided.
- Dark mode is attribute-driven: `@custom-variant dark` on `[data-theme='dark']`.
