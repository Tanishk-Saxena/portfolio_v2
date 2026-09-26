import { expect, test } from '@playwright/test';

// Critical interaction paths: everything here must work by keyboard (brief §3).

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('floating nav opens by keyboard, traps focus, and Escape returns focus', async ({ page }) => {
  const fab = page.getByRole('button', { name: 'Jump to section' });
  await expect(fab).toBeHidden(); // not shown while the hero is on screen

  await page.locator('#projects').scrollIntoViewIfNeeded();
  await expect(fab).toBeVisible();

  await fab.focus();
  await page.keyboard.press('Enter');
  await expect(fab).toHaveAttribute('aria-expanded', 'true');
  const nav = page.getByRole('navigation', { name: 'Sections' });
  const current = nav.locator('a[aria-current="true"]');
  await expect(current).toBeFocused();

  // Tab from the last item wraps within the menu, never escaping into the page.
  for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(
    () =>
      !!document.activeElement?.closest('nav[aria-label="Sections"]') ||
      document.activeElement?.getAttribute('aria-label') === 'Jump to section',
  );
  expect(inside).toBe(true);

  await page.keyboard.press('Escape');
  await expect(fab).toHaveAttribute('aria-expanded', 'false');
  await expect(fab).toBeFocused();
});

test('choosing a destination jumps there and closes the menu', async ({ page }) => {
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Jump to section' }).click();
  await page
    .getByRole('navigation', { name: 'Sections' })
    .getByRole('link', { name: 'Skills' })
    .click();
  await expect(page).toHaveURL(/#skills$/);
  await expect(page.locator('#skills')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Jump to section' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('project modal traps focus and returns it to the card', async ({ page }) => {
  const trigger = page.locator('.card-trigger').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('Marginalia');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('show more reveals the next three projects and focuses the first new one', async ({
  page,
}) => {
  const cards = page.locator('#projects article');
  await expect(cards).toHaveCount(3);
  await page.locator('#projects').getByRole('button', { name: 'Show more' }).click();
  await expect(cards).toHaveCount(6);
  await expect(page.locator('.card-trigger').nth(3)).toBeFocused();
});

test('experience rows expand and collapse with aria-expanded', async ({ page }) => {
  const row = page.locator('#experience').getByRole('button').first();
  await expect(row).toHaveAttribute('aria-expanded', 'false');
  await row.press('Enter');
  await expect(row).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#experience').getByText('Own the design system')).toBeVisible();
  await row.press('Enter');
  await expect(row).toHaveAttribute('aria-expanded', 'false');
});

test('theme toggle flips data-theme and remembers the choice', async ({ page }) => {
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  const before = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  const after = await page.locator('html').getAttribute('data-theme');
  expect(after).not.toBe(before);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', after!);
});
