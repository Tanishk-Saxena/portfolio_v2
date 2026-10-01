import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Axe (WCAG 2.1 AA, brief §3) on each page in both colour modes. One page per test, and a
// longer budget: axe is CPU-bound (~4 s on the home page alone), so under parallel workers a
// combined test overran the default 30 s and failed on time, never on a violation.
test.describe.configure({ timeout: 60_000 });

const PAGES = { home: '/', article: '/articles/second-render' };

for (const theme of ['light', 'dark'] as const) {
  for (const [name, url] of Object.entries(PAGES)) {
    test(`${name} passes axe in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
      await page.goto(url);
      // The hero's scroll cue fades itself out ~5 s after load. Wait for it to finish, or a
      // slow runner audits it mid-fade and reports its half-opacity text as low contrast.
      const cue = page.getByText('Scroll', { exact: true }).locator('..');
      if (await cue.count()) await expect(cue).toHaveCSS('opacity', '0', { timeout: 15_000 });
      // Audit the settled page: text caught mid-fade would be measured at partial opacity.
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      );
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual(
        [],
      );
    });
  }
}
