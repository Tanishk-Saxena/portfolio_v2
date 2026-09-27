import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Axe (WCAG 2.1 AA, brief §3) on each page in both colour modes.

async function audit(page: Page) {
  // Audit the settled page: text caught mid-fade would be measured at partial opacity.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test(`home and article pass axe in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await page.goto('/');
    await audit(page);
    await page.goto('/articles/second-render');
    await audit(page);
  });
}
