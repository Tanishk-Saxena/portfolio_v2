import { defineConfig, devices } from '@playwright/test';
import { isLocalSupabase } from './lib/supabase-local';

// Smoke + a11y tests for the major flows (brief §2), on the production build: in the installed
// Chrome (GitHub's ubuntu runners have it) and in Playwright's WebKit (CI installs it). They run against
// a local Supabase only (CI's, loaded with the seed): the admin journeys write, so they refuse
// dev and prod.
const PORT = 3200;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!isLocalSupabase(supabaseUrl)) {
  throw new Error(
    `e2e runs only against a local Supabase (npx supabase start), not ${supabaseUrl ?? 'none'}`,
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI: annotations on the PR, plus JUnit for the run's test report (the workflow names the
  // file per step with PLAYWRIGHT_JUNIT_OUTPUT_FILE).
  reporter: process.env.CI
    ? [['list'], ['github'], ['junit', { includeProjectInTestName: true }]]
    : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    reducedMotion: 'reduce', // deterministic; the reduced-motion path must work anyway
  },
  projects: [
    // Every spec runs on all three: smoke and axe alike (owner: a11y and perf are never
    // judged on one device only). Chrome on desktop and phone (the runner's own Chrome), and
    // Safari's engine on an iPhone profile, since most phones visiting are iPhones.
    { name: 'desktop', use: { channel: 'chrome', viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: {
        channel: 'chrome',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false, // always the current build
    timeout: 60_000,
  },
});
