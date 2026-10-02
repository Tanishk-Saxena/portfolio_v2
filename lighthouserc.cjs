/*
 * Lighthouse CI (brief §6 Phase 9.1): a reading on every PR, never a gate (brief §3). Runs
 * against the production build (`next start`), three runs per page (the median counts), on
 * mobile (Lighthouse's default, below) and desktop (`npm run lighthouse` reruns with the
 * desktop preset): a11y and perf are never judged on one device. Misses are warnings;
 * scripts/lighthouse-summary.mjs reports them.
 */
const port = 3200;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npx next start -p ${port}`,
      startServerReadyPattern: 'Ready',
      url: [
        `http://localhost:${port}/`,
        `http://localhost:${port}/articles/second-render`, // the fixture article with a full body
        `http://localhost:${port}/admin/sign-in`, // CI has no Supabase keys: the admin stays locked
      ],
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      // The budget (brief §6): performance ≥ 95, accessibility 100. Warnings only.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['warn', { minScore: 1 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/mobile' },
  },
};
