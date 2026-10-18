// Reports the Lighthouse CI run (scripts/lighthouse.mjs, brief §6 Phase 9.1). Two jobs:
//  1. Writes the scores table CI pins to the PR (the median run of each page, per device).
//  2. Prints a GitHub warning for every page under its budget, so a miss shows as amber.
// It never fails: Lighthouse is a reading, not a gate (brief §3).
// Usage: node scripts/lighthouse-summary.mjs <out.md>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// brief §6: the site's pages are held to both; the admin's speed is read, not a target.
const BUDGETS = {
  site: { performance: 95, accessibility: 100 },
  admin: { accessibility: 100 },
};
const RUNS = ['mobile-site', 'mobile-admin', 'desktop-site', 'desktop-admin'];
const out = process.argv[2] ?? 'reports/lighthouse.md';

const pct = (score) => (score == null ? '–' : Math.round(score * 100));
const page = (url) => new URL(url).pathname;

const rows = [];
const warnings = [];
for (const run of RUNS) {
  const [device, group] = run.split('-');
  const manifest = `.lighthouseci/${run}/manifest.json`;
  if (!existsSync(manifest)) {
    rows.push(`| ${device} | ⏭️ ${group} not run | | | | | | |`);
    continue;
  }
  const budget = BUDGETS[group];
  const reps = JSON.parse(readFileSync(manifest, 'utf8')).filter((r) => r.isRepresentativeRun);
  for (const rep of reps) {
    const { summary: s, url } = rep;
    const report = JSON.parse(readFileSync(rep.jsonPath, 'utf8'));
    const lcp = report.audits['largest-contentful-paint']?.numericValue;
    const cls = report.audits['cumulative-layout-shift']?.numericValue;
    const misses = Object.entries(budget).filter(([key, min]) => pct(s[key]) < min);
    for (const [key, min] of misses) {
      warnings.push(`${page(url)} (${device}): ${key} ${pct(s[key])}, budget ${min}`);
    }
    const perf = `${budget.performance ? (misses.length ? '⚠️ ' : '✅ ') : ''}${pct(s.performance)}`;
    rows.push(
      `| ${device} | ${page(url)} | ${perf} | ${misses.some(([k]) => k === 'accessibility') ? '⚠️ ' : ''}${pct(s.accessibility)} | ${pct(s['best-practices'])} | ${pct(s.seo)} | ${lcp == null ? '–' : `${(lcp / 1000).toFixed(1)} s`} | ${cls == null ? '–' : cls.toFixed(3)} |`,
    );
  }
}

const table = [
  '### Lighthouse (reading, never blocks)',
  '',
  `Budgets: the site's pages, performance ≥ ${BUDGETS.site.performance} and accessibility ${BUDGETS.site.accessibility}; the admin's, accessibility ${BUDGETS.admin.accessibility} (its speed is shown, not a target). Median of 3 runs against the production build over CI's local Supabase (the seed); the admin signed in as the test admin. ⚠️ = under budget. Full reports: the run's \`lighthouse-reports\` artifact.`,
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
