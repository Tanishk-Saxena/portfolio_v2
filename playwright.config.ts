import { defineConfig } from '@playwright/test';

// Smoke + a11y tests for the major flows (brief §2), on the production build and the locally
// installed Chrome (also on GitHub's ubuntu runners, so no browser download).
const PORT = 3200;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI: annotations on the PR, plus JUnit for the run's test report (the workflow names the
  // file per step with PLAYWRIGHT_JUNIT_OUTPUT_FILE).
  reporter: process.env.CI ? [['list'], ['github'], ['junit']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce', // deterministic; the reduced-motion path must work anyway
  },
  projects: [
    // Every spec runs on both: smoke and axe alike (owner: a11y and perf are never judged
    // on one device only).
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false, // always the current build
    timeout: 60_000,
  },
});
