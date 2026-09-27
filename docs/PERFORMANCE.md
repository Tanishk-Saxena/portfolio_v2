# Performance and accessibility ledger

Readings of the site's performance and accessibility over time, and the open items they
raise. Owner rule (brief §3): these are **always measured and flagged, never blocking**. A
miss never holds up a phase, a merge or a deploy; it becomes an open item here and is
addressed separately. Phase 10 (after Milestone B) is the dedicated audit, and adds a
Lighthouse reading to CI as an amber warning.

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

Accessibility: axe runs in CI on home and article, both modes, desktop and mobile (a warning
when it fails, never red). Last result: clean.

## Open items

### P-1 · LCP above 2.0 s on lab mobile (open, flagged)

The real network is fast; the simulated LCP comes from the modelled main-thread and JS
cost on a slow phone. **Next:** read Speed Insights field data once there are a few days of
visits; if real phones are under 2.0 s, lower the priority. Levers, in order:

1. Newsreader `opsz` axis costs 72 KB (128 vs 56 KB); the owner decides fidelity vs bytes.
2. Caveat preload (50 KB) could drop (the signature intro is shelved).
3. The grain layer's full-viewport blend (paint cost).
4. The hydration JS footprint (TBT 170–340 ms).
