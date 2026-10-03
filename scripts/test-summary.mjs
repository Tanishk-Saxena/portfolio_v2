// Prepares the CI test report (.github/workflows/ci.yml). Two jobs, in this order:
//  1. Names each Playwright suite after its viewport ("smoke.spec.ts — desktop"), in place,
//     so the run summary shows one table per viewport instead of merging both.
//  2. Prints the short table CI pins to the PR: unit, then e2e per viewport.
// Usage: node scripts/test-summary.mjs <run url> > reports/comment.md
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const FILES = [
  { file: 'unit.xml', label: 'Unit', gate: 'blocks merge', viewports: false },
  { file: 'smoke.xml', label: 'E2E smoke', gate: 'blocks merge', viewports: true },
  {
    file: 'a11y.xml',
    label: 'Accessibility (axe): site + admin',
    gate: 'flag only',
    viewports: true,
  },
];

const SUITE = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g;
const attr = (attrs, name) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '';

/** Playwright writes the project only as `hostname`; put it in the suite name. */
function labelViewports(xml) {
  return xml.replace(/<testsuite\b([^>]*)>/g, (tag, attrs) => {
    const name = attr(attrs, 'name');
    const host = attr(attrs, 'hostname');
    if (!host || name.endsWith(` — ${host}`)) return tag;
    return tag.replace(`name="${name}"`, `name="${name} — ${host}"`);
  });
}

function tally(body) {
  const cases = body.match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g) ?? [];
  const failed = cases.filter((c) => /<(failure|error)\b/.test(c)).length;
  const skipped = cases.filter((c) => /<skipped\b/.test(c)).length;
  return { passed: cases.length - failed - skipped, failed, skipped };
}

const rows = [];
for (const { file, label, gate, viewports } of FILES) {
  const path = `reports/${file}`;
  if (!existsSync(path)) {
    rows.push(`| ${label} | ⏭️ not run | | | | | ${gate} |`);
    continue;
  }
  let xml = readFileSync(path, 'utf8');
  if (viewports) writeFileSync(path, (xml = labelViewports(xml)));

  // Unit: one row for the whole run. E2E: one row per viewport (the suite's hostname).
  const groups = new Map();
  for (const [, attrs, body] of xml.matchAll(SUITE)) {
    const key = viewports ? attr(attrs, 'hostname') : '';
    const g = groups.get(key) ?? { passed: 0, failed: 0, skipped: 0, time: 0 };
    const t = tally(body);
    g.passed += t.passed;
    g.failed += t.failed;
    g.skipped += t.skipped;
    g.time += Number(attr(attrs, 'time') || 0);
    groups.set(key, g);
  }
  for (const [host, g] of groups) {
    const icon = g.failed === 0 ? '✅' : gate === 'flag only' ? '⚠️' : '❌';
    const name = host ? `${label} — ${host}` : label;
    rows.push(
      `| ${name} | ${icon} | ${g.passed} | ${g.failed} | ${g.skipped} | ${g.time.toFixed(1)} s | ${gate} |`,
    );
  }
}

console.log(
  [
    '### Test results',
    '',
    '| Suite | | Passed | Failed | Skipped | Test time | Gate |',
    '|---|---|--:|--:|--:|--:|---|',
    ...rows,
    '',
    `Every test, with failure details: [run summary](${process.argv[2] ?? ''}). ` +
      'Test time adds up each test; e2e tests run in parallel, so the step takes less. ' +
      'Live Supabase tests run locally only (`npm run test:live`).',
  ].join('\n'),
);
