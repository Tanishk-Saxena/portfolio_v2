# Performance and accessibility ledger

Readings of the site's performance and accessibility over time, and the open items they
raise. Owner rule (brief §3): these are **always measured and flagged, never blocking**. A
miss never holds up a phase, a merge or a deploy; it becomes an open item here and is
addressed separately. Since Phase 9.1, CI's `lighthouse` job reads every PR (home, the
article, the admin sign-in; mobile and desktop; median of 3) and pins the scores to the PR,
with a warning under budget; `npm run lighthouse` runs the same locally. Phase 10
(2026-10-18) read the deployed prod site and the signed-in admin once and made its one-time
fixes; there is no standing audit (owner): the per-PR reading and Vercel Speed Insights (real
visitors) cover the live site (brief §6).

Targets (brief §3): Lighthouse mobile performance ≥ 95, accessibility 100; LCP < 2.0 s;
CLS < 0.1; axe clean.

## Readings

Lab = Lighthouse mobile (simulated slow 4G, mid-tier phone). Field = Vercel Speed Insights
(real visitors). Scores are performance / accessibility / best practices / SEO.

| Date | Where | Page | Scores | LCP | FCP | TBT | CLS | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-09 (Phase 3) | local build | home | 70–86 / 100 / 100 / 100 | 2.4–3.8 s | ≈ LCP | — | 0 | laptop runs, ±15 run to run |
| 2026-09 (Phase 3) | local build | article | 87–91 / 100 / 100 / 100 | — | — | — | 0 | |
| 2026-09-27 | live, lab (local Chrome; PSI API out of quota) | home | 83–86 / 100 / 100 / 100 | 3.3–3.6 s | 1.5–1.7 s | 200–220 ms | 0 | network chain 475 ms; nothing blocks the fonts |
| 2026-09-27 | live, lab | article | 83–89 / 100 / 100 / 100 | 3.5 s | 1.1–1.3 s | 170–340 ms | 0 | LCP = first body paragraph; 710 ms render delay |
| 2026-10-02 (9.1) | local build, `npm run lighthouse`, mobile | home | 80 / 100 / 96 / 100 | 3.8 s | — | — | 0 | median of 3; first Lighthouse CI reading |
| 2026-10-02 (9.1) | same, mobile | article | 85 / 100 / 96 / 100 | 3.9 s | — | — | 0 | |
| 2026-10-02 (9.1) | same, mobile | admin sign-in | 90 / 100 / 96 / 63 | 3.3 s | — | — | 0 | SEO 63 is expected: the admin is `noindex` |
| 2026-10-02 (9.1) | same, desktop | home / article / sign-in | 99 / 99 / 100 perf; a11y 100; BP 96 | 0.7–0.9 s | — | — | 0 | best practices 96 on every page: for Phase 10 |
| 2026-10-18 (10) | live, lab, Lighthouse CI by hand, mobile | home | 88 / 100 / 100 / 100 | 3.2 s | 1.5 s | 120–180 ms | 0.002 | median of 3; the Phase 10 reading, before its fixes |
| 2026-10-18 (10) | same, mobile | article | 87 / 100 / 100 / 100 | 3.6 s | 1.1 s | 110–140 ms | 0 | best practices 100 live: the 96 was localhost's http |
| 2026-10-18 (10) | same, desktop | home / article | 100 / 100 / 100 / 100 | 0.7 s | 0.3 s | 0 | 0 | |
| 2026-10-18 (10) | local build over dev, signed in, Lighthouse CI by hand, mobile | Writing / an editor / Hero / Settings | 69 / 64 / 80 / 78 perf; a11y 100; BP 96; SEO 63 | 3.7–4.1 s | — | — | 0 | the private tool: same JS cost as P-1, flagged, not a target; SEO 63 is `noindex`; BP 96 is localhost's http |
| 2026-10-18 (10) | same, desktop | the same four | 98–99 perf; a11y 100 | 0.9 s | — | — | 0 | |

Accessibility: axe runs in CI on home and article, both modes, desktop and mobile (a warning
when it fails, never red). Last result: clean. 2026-10-02: one false reading on PR #19 (scroll
cue audited mid-fade, desktop light); the test now waits for the cue to finish (PROGRESS, T.2).
Since 9.4 (2026-10-04) it also opens the experience row, the project modal and the nav menu:
clean. The **admin** is audited too, in the same CI step (signed in as the dev project's test
admin, on the fixtures build; every screen, both modes, both viewports). First reading, 2026-10-04: one
finding, A-1 below, on four screens, fixed the same day; now clean.

## Open items

### A-1 · Admin live pills under 4.5:1 (fixed, 2026-10-04)

Accent text on the accent wash (`--color-wash-accent`, accent at 14% over the paper) measured
**4.17:1** light and **4.24:1** dark at 12–12.5px, under AA's 4.5:1: the live status pill in
the Writing, Projects and Quotes lists ("Published", "Shown") and the editor's "New" state
pill. Fixed with the owner's OK (ADMIN-DESIGN-SPEC §14, shipped values): the wash is 8%
(4.53 light, 4.62 dark), one token in `app/globals.css`, shared by the tag chips. Admin axe
clean after it.

### P-1 · LCP above 2.0 s on lab mobile (open, flagged)

The real network is fast; the simulated LCP comes from the modelled main-thread and JS
cost on a slow phone. **Next:** read Speed Insights field data once there are a few days of
visits; if real phones are under 2.0 s, lower the priority.

**Phase 10 (2026-10-18), what was measured.** The LCP element is text (the hero heading,
the article's first paragraph) with no load delay: it is all render delay. Lighthouse's
simulator charges every request that finished before the observed paint to LCP, so on
simulated slow 4G the heading waits for the fonts (≈245 KB) and the JS (≈150 KB gzipped,
mostly React and the Next runtime; the 38 KB polyfill chunk is `noModule` and never loads in
a modern browser). Slow observed first paints on the local machine (up to 2.4 s) were Chrome's
GPU process starting late, not the page. Levers, as tried (local lab LCP, median of 3):

1. **Done:** Caveat is no longer preloaded (`lib/fonts.ts`): 50 KB off the first paint, home
   ≈4.1 → 3.6 s. It still loads, behind its size-adjusted fallback, when Settings picks it;
   once the owner settles on one face, drop the other entirely.
2. Newsreader's `opsz` axis: 132 KB with it, 58 KB without, for ≤0.15 s. **Not taken**: the
   optical sizing is the display type's look. A narrower weight range saves nothing (Google
   serves the same 132 KB file) and Turbopack's `next/font` refuses a range.
3. The grain layer: deferring it until after `load` changed nothing. **Not taken.**
4. The hydration JS: the framework's floor; nothing app-specific is large. Open.
