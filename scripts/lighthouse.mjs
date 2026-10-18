// Lighthouse on every PR (`npm run lighthouse`, after a build): the site's home and an
// article and the admin's sign-in page, signed out; then the admin signed in as the test
// admin (a list, an entry editor, a single form, Settings); mobile and desktop. Starts `next start` over the
// local Supabase, signs in through the form, and hands the session to Lighthouse as a
// Cookie header. The session belongs to CI's throwaway Supabase, gone when the job ends.
// A reading, never a gate: scripts/lighthouse-summary.mjs writes the table and the warnings.
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const NEXT = 'node_modules/next/dist/bin/next';
const LHCI = 'node_modules/@lhci/cli/src/cli.js';
const { E2E_ADMIN_EMAIL: email, E2E_ADMIN_PASSWORD: password } = process.env;

async function start() {
  const server = spawn(process.execPath, [NEXT, 'start', '-p', String(PORT)], {
    stdio: 'ignore',
  });
  for (let i = 0; i < 120; i++) {
    try {
      await fetch(BASE);
      return server;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('next start did not answer within a minute');
}

function stop(server) {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F']);
  } else {
    spawnSync('pkill', ['-P', String(server.pid)]);
    server.kill();
  }
}

/** Signs in as the test admin; returns the session cookie and the admin pages to read. */
async function adminSession() {
  if (!email || !password) throw new Error('needs E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/admin/sign-in`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/admin\/writing/);
    const editor = await page
      .locator('a[href^="/admin/writing/"]:not([href$="/new"])')
      .first()
      .getAttribute('href');
    const cookies = await page.context().cookies();
    return {
      cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      pages: ['/admin/writing', editor, '/admin/hero', '/admin/settings'].filter(Boolean),
    };
  } finally {
    await browser.close();
  }
}

rmSync('.lighthouseci', { recursive: true, force: true });
const server = await start();
try {
  const session = await adminSession();
  // Signed out (the site, and the sign-in page, which sends an admin onwards) and signed in.
  const runs = {
    site: { paths: ['/', '/articles/second-render', '/admin/sign-in'] },
    admin: { paths: session.pages, headers: { Cookie: session.cookie } },
  };
  for (const device of ['mobile', 'desktop']) {
    for (const [group, { paths, headers }] of Object.entries(runs)) {
      spawnSync(process.execPath, [LHCI, 'autorun'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          LH_URLS: JSON.stringify(paths.map((path) => `${BASE}${path}`)),
          LH_DEVICE: device,
          LH_GROUP: group,
          ...(headers && { LH_HEADERS: JSON.stringify(headers) }),
        },
      });
    }
  }
} finally {
  stop(server);
}
spawnSync(process.execPath, ['scripts/lighthouse-summary.mjs', 'reports/lighthouse.md'], {
  stdio: 'inherit',
});
