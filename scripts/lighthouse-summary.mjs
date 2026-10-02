// Reports the Lighthouse CI run (lighthouserc.cjs, brief §6 Phase 9.1). Two jobs:
//  1. Writes the scores table CI pins to the PR (the median run of each page, per device).
//  2. Prints a GitHub warning for every page under budget, so a miss shows on the PR as amber.
// It never fails: Lighthouse is a reading, not a gate (brief §3).
// Usage: node scripts/lighthouse-summary.mjs <out.md>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const BUDGET = { performance: 95, accessibility: 100 }; // brief §6
const DEVICES = ['mobile', 'desktop'];
const out = process.argv[2] ?? 'reports/lighthouse.md';

const pct = (score) => (score == null ? '–' : Math.round(score * 100));
const page = (url) => new URL(url).pathname;

const rows = [];
const warnings = [];
for (const device of DEVICES) {
  const manifest = `.lighthouseci/${device}/manifest.json`;
  if (!existsSync(manifest)) {
    rows.push(`| ${device} | ⏭️ not run | | | | | | |`);
    continue;
  }
  const runs = JSON.parse(readFileSync(manifest, 'utf8')).filter((r) => r.isRepresentativeRun);
  for (const run of runs) {
    const { summary: s, url } = run;
    const report = JSON.parse(readFileSync(run.jsonPath, 'utf8'));
    const lcp = report.audits['largest-contentful-paint']?.numericValue;
    const cls = report.audits['cumulative-layout-shift']?.numericValue;
    const misses = Object.entries(BUDGET).filter(([key, min]) => pct(s[key]) < min);
    for (const [key, min] of misses) {
      warnings.push(`${page(url)} (${device}): ${key} ${pct(s[key])}, budget ${min}`);
    }
    rows.push(
      `| ${device} | ${page(url)} | ${misses.length ? '⚠️' : '✅'} ${pct(s.performance)} | ${pct(s.accessibility)} | ${pct(s['best-practices'])} | ${pct(s.seo)} | ${lcp == null ? '–' : `${(lcp / 1000).toFixed(1)} s`} | ${cls == null ? '–' : cls.toFixed(3)} |`,
    );
  }
}

const table = [
  '### Lighthouse (reading, never blocks)',
  '',
  `Budget: performance ≥ ${BUDGET.performance}, accessibility ${BUDGET.accessibility}. Median of 3 runs against the production build, on fixtures; ⚠️ = under budget. Full reports: the run's \`lighthouse-reports\` artifact.`,
  '',
  '| Device | Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |',
  '|---|---|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, table);
for (const w of warnings) console.log(`::warning title=Lighthouse::${w}`);
console.log(table);
