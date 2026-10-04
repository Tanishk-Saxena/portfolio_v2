import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// Axe (WCAG 2.1 AA, brief §3) on each page in both colour modes. One page per test, and a
// longer budget: axe is CPU-bound (~4 s on the home page alone), so under parallel workers a
// combined test overran the default 30 s and failed on time, never on a violation.
test.describe.configure({ timeout: 60_000 });

const PAGES = { home: '/', article: '/articles/second-render' };

async function audit(page: Page, label?: string) {
  // Audit the settled page: text caught mid-fade would be measured at partial opacity.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const found = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
  if (label) expect.soft(found, label).toEqual([]);
  else expect(found).toEqual([]);
}

async function open(page: Page, url: string, theme: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await page.goto(url);
  // The hero's scroll cue fades in, then out ~5 s after load. Wait until it has gone, or
  // the audit catches it mid-fade and reports its half-opacity text as low contrast. Its
  // state, not just its opacity: it is also at 0 before it first shows, and passing on that
  // let the fade-out land in the middle of the audit (an intermittent failure).
  const cue = page.locator('[data-cue]');
  if (await cue.count()) {
    await expect(cue).toHaveAttribute('data-cue', 'gone', { timeout: 15_000 });
    await expect(cue).toHaveCSS('opacity', '0');
  }
}

for (const theme of ['light', 'dark'] as const) {
  for (const [name, url] of Object.entries(PAGES)) {
    test(`${name} passes axe in ${theme} mode`, async ({ page }) => {
      await open(page, url, theme);
      await audit(page);
    });
  }

  // The states the page audit never opens (Phase 9 roadmap item 3).
  test(`home's open states pass axe in ${theme} mode`, async ({ page }) => {
    await open(page, '/', theme);

    await page.locator('#experience button[aria-expanded="false"]').first().click();
    await expect(page.locator('#experience button[aria-expanded="true"]')).toHaveCount(1);
    await audit(page, 'open experience row');

    await page.locator('.card-trigger').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await audit(page, 'project modal');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Jump to section' }).click();
    const menu = page.getByRole('navigation', { name: 'Sections' });
    await expect(menu.getByRole('link', { name: 'Skills' })).toBeVisible();
    await audit(page, 'open nav menu');
  });
}
