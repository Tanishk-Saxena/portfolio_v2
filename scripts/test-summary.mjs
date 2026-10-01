// Turns the JUnit files in reports/ into the short table CI pins to the PR (one comment,
// updated on every push). Usage: node scripts/test-summary.mjs <run url> > comment.md
import { existsSync, readFileSync } from 'node:fs';

const SUITES = [
  { file: 'unit.xml', label: 'Unit', gate: 'blocks merge' },
  { file: 'smoke.xml', label: 'E2E smoke (desktop + mobile)', gate: 'blocks merge' },
  { file: 'a11y.xml', label: 'Accessibility, axe (desktop + mobile)', gate: 'flag only' },
];

function tally(xml) {
  const cases = xml.match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g) ?? [];
  const failed = cases.filter((c) => /<(failure|error)\b/.test(c)).length;
  const skipped = cases.filter((c) => /<skipped\b/.test(c)).length;
  const time = Number(xml.match(/<testsuites\b[^>]*\btime="([\d.]+)"/)?.[1] ?? 0);
  return { passed: cases.length - failed - skipped, failed, skipped, time };
}

const rows = SUITES.map(({ file, label, gate }) => {
  const path = `reports/${file}`;
  if (!existsSync(path)) return `| ${label} | ⏭️ not run | | | | ${gate} |`;
  const t = tally(readFileSync(path, 'utf8'));
  const icon = t.failed === 0 ? '✅' : gate === 'flag only' ? '⚠️' : '❌';
  return `| ${label} | ${icon} | ${t.passed} | ${t.failed} | ${t.skipped} | ${t.time.toFixed(1)} s · ${gate} |`;
});

console.log(
  [
    '### Test results',
    '',
    '| Suite | | Passed | Failed | Skipped | Time · gate |',
    '|---|---|--:|--:|--:|---|',
    ...rows,
    '',
    `Every test, with failure details: [run summary](${process.argv[2] ?? ''}). ` +
      'Live Supabase tests run locally only (`npm run test:live`).',
  ].join('\n'),
);
