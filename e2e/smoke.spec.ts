import { expect, test } from '@playwright/test';

// Smoke tests: the site's major flows still work. Deliberately coarse: they check outcomes
// (a page opens, a thing appears), never timings, pixels or animation details, so UI
// iteration doesn't break them. Runs under reduced motion (config) for determinism.

test('home loads, hydrates, and has no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: 'Dark mode' }).click(); // proves hydration
  await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  expect(errors).toEqual([]);
});

test('a project opens in the modal and closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card-trigger').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the section nav jumps to a section', async ({ page }) => {
  await page.goto('/');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Jump to section' }).click();
  await page
    .getByRole('navigation', { name: 'Sections' })
    .getByRole('link', { name: 'Skills' })
    .click();
  await expect(page).toHaveURL(/#skills$/);
});

test('an article opens from its row, and Back returns to the home page', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('#writing')
    .getByRole('link', { name: /second render/i })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The second render is the one users feel',
  );
  await page.getByRole('link', { name: 'Writing', exact: true }).click();
  await expect(page.locator('#writing')).toBeVisible();
});

test('an unknown article is a 404', async ({ page }) => {
  const response = await page.goto('/articles/no-such-article');
  expect(response?.status()).toBe(404);
});

test('the admin is locked: pages go to sign-in, the API answers 401', async ({ page, request }) => {
  await page.goto('/admin/writing');
  await expect(page).toHaveURL(/\/admin\/sign-in$/);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter your email and password.')).toHaveRole('alert');
  const api = await request.get('/api/admin/session');
  expect(api.status()).toBe(401);
});
