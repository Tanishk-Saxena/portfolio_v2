/*
 * Lighthouse CI (brief §6 Phase 9.1): a reading on every PR, never a gate (brief §3).
 * `scripts/lighthouse.mjs` drives it: it starts the production build over the local Supabase,
 * signs in as the test admin, and passes the URLs, the device and the session through the
 * environment. Three runs per page (the median counts), mobile and desktop.
 *
 * Budgets (brief §6): the site's pages, performance ≥ 95 and accessibility 100; the admin's,
 * accessibility 100 only (a private tool: its speed is read, not a target). Warnings only;
 * scripts/lighthouse-summary.mjs reports them.
 */
const headers = process.env.LH_HEADERS ? JSON.parse(process.env.LH_HEADERS) : undefined;

module.exports = {
  ci: {
    collect: {
      url: JSON.parse(process.env.LH_URLS ?? '[]'),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
        ...(process.env.LH_DEVICE === 'desktop' && { preset: 'desktop' }),
        ...(headers && { extraHeaders: headers }),
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: '^(?!.*/admin/).*$',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.95 }],
            'categories:accessibility': ['warn', { minScore: 1 }],
          },
        },
        {
          matchingUrlPattern: '/admin/',
          assertions: { 'categories:accessibility': ['warn', { minScore: 1 }] },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: `.lighthouseci/${process.env.LH_DEVICE}-${process.env.LH_GROUP}`,
    },
  },
};
