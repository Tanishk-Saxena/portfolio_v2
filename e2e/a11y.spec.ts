import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Axe must be clean (brief §3, WCAG 2.1 AA) on every page, in both colour modes, including
// the states that only exist after interaction (open modal, open nav).

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
  expect(summary).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    });

    test('home page', async ({ page }) => {
      await page.goto('/');
      await audit(page);
    });

    test('home page with an experience row open', async ({ page }) => {
      await page.goto('/');
      await page.locator('#experience').getByRole('button').first().click();
      await audit(page);
    });

    test('project modal open', async ({ page }) => {
      await page.goto('/');
      await page.locator('.card-trigger').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await audit(page);
    });

    test('floating nav open', async ({ page }) => {
      await page.goto('/');
      await page.locator('#projects').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Jump to section' }).click();
      await audit(page);
    });

    test('article page', async ({ page }) => {
      await page.goto('/articles/second-render');
      await audit(page);
    });
  });
}
