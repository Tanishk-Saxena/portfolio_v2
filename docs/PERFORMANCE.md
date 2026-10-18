# Performance and accessibility

Always measured and flagged, never blocking (brief §3). Targets: Lighthouse mobile
performance ≥ 95, accessibility 100; LCP < 2.0 s; CLS < 0.1; axe clean.

How it's read: CI's `lighthouse` job on every PR (home, an article, the admin sign-in, and
the signed-in admin: Writing, an editor, Hero, Settings; mobile and desktop; median of 3);
axe in CI on the site, its open states and every signed-in admin screen, both modes and
viewports; all over CI's local Supabase with the seed's stress cases. Vercel Speed Insights
reads the live site (real visitors). No audit, ever: anything real content could break is
closed in code (brief §3). The admin's budget is accessibility only; its speed is read.

## Readings

Scores: performance / accessibility / best practices / SEO. Lab = simulated slow 4G, mid-tier
phone.

| Date | Where | Page | Scores | LCP | CLS | Notes |
|---|---|---|---|---|---|---|
| 2026-09-27 | live, mobile | home / article | 83–86 / 100 / 100 / 100 · 83–89 | 3.3–3.6 s / 3.5 s | 0 | |
| 2026-10-02 | local build, mobile | home / article / sign-in | 80 / 85 / 90; a11y 100; BP 96 | 3.3–3.9 s | 0 | first Lighthouse CI reading; BP 96 = localhost's http |
| 2026-10-18 | live, mobile | home / article | 88 / 87; a11y, BP, SEO 100 | 3.2 / 3.6 s | ≤ 0.002 | the Phase 10 reading |
| 2026-10-18 | live, desktop | home / article | 100 / 100 / 100 / 100 | 0.7 s | ≤ 0.002 | |
| 2026-10-18 | local, over dev, signed in, mobile | Writing / editor / Hero / Settings | 69 / 64 / 80 / 78; a11y 100 | 3.7–4.1 s | 0 | a private tool: flagged, not a target; SEO 63 = `noindex` |
| 2026-10-18 | same, desktop | the same four | 98–99; a11y 100 | 0.9 s | 0 | |
| 2026-10-18 | CI, local Supabase + seed, mobile | home / article / sign-in | 88 / 92 / 96; a11y 100; BP 96 | 2.7–3.5 s | ≤ 0.002 | first per-PR reading on one data path (PR #51); BP 96 = http on localhost |
| 2026-10-18 | same, mobile, signed in | Writing / editor / Hero / Settings | 91–94; a11y 100 | 3.0–3.5 s | 0 | higher than the laptop reading above, which went over the network to dev |
| 2026-10-18 | same, desktop | all seven | 97–100; a11y 100 | 0.6–0.7 s | ≤ 0.002 | |

Axe: clean on the site and the admin (last: 2026-10-18).

**Reading the home page settled.** On a fresh home visit the hero's entrance waits for the
signature intro (~3.6 s). Lighthouse audits right after load, so it once sampled the hero's
text mid-fade and scored accessibility 96 for "contrast" that no visitor sees at rest. The
site pages are therefore audited 4 s after load (`pauseAfterLoadMs`, `lighthouserc.cjs`), as
the axe tests wait for animations to end; load metrics come from the trace, unchanged.

## Open items

### P-1 · Phone lab LCP above 2.0 s (open, flagged)

The LCP is text (the hero heading, the article's first paragraph) with no load delay; it is
all render delay. The simulator charges every request that finished before the paint to LCP:
on slow 4G the text waits for the fonts (≈200 KB) and the JS (≈150 KB gzipped, mostly React
and the Next runtime). Real networks are fast, so **Speed Insights field data is the judge**:
if real phones are under 2.0 s, P-1 is closed.

Measured (2026-10-18; don't retry):
- **Done:** Caveat no longer preloaded (−50 KB; home ≈4.1 → 3.6 s locally). Once the owner
  picks one script face, delete the other (`lib/fonts.ts`).
- **Not taken:** dropping Newsreader's `opsz` (−74 KB, ≤ 0.15 s; it is the display type's
  look); a narrower weight range (same file; Turbopack refuses it); deferring the grain (no
  effect). Slow first paints on the owner's Windows machine are Chrome's GPU process starting
  late, not the site.
- Left: the framework's own JS. The 38 KB polyfill chunk is `noModule` (modern browsers skip
  it).

### A-1 · Admin live pills under 4.5:1 (fixed, 2026-10-04)

Accent text on the 14% accent wash measured 4.17 / 4.24:1. With the owner's OK the wash is 8%
(4.53 / 4.62:1), one token shared by the tag chips.
