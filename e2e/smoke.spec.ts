import { expect, test } from '@playwright/test';

// Smoke tests: the site's major flows still work. Deliberately coarse: they check outcomes
// (a page opens, a thing appears), never timings, pixels or animation details, so UI
// iteration doesn't break them. Runs under reduced motion (config) for determinism. One
// journey per area, so each page loads once; a failing step is named in the report.

test('home: hydrates without errors, a project opens and closes, the nav jumps', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await test.step('the theme toggle works (proves hydration)', async () => {
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.getByRole('button', { name: 'Dark mode' }).click();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  });

  await test.step('a project opens in the modal and Escape closes it', async () => {
    await page.locator('.card-trigger').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  await test.step('the section nav jumps to a section', async () => {
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Jump to section' }).click();
    await page
      .getByRole('navigation', { name: 'Sections' })
      .getByRole('link', { name: 'Skills' })
      .click();
    await expect(page).toHaveURL(/#skills$/);
  });

  expect(errors).toEqual([]);
});

test('articles: one opens from its row, Back returns home, an unknown slug is a 404', async ({
  page,
}) => {
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

  const response = await page.goto('/articles/no-such-article');
  expect(response?.status()).toBe(404);
});

test('admin: locked — pages go to sign-in, the API answers 401', async ({ page, request }) => {
  await page.goto('/admin/writing');
  await expect(page).toHaveURL(/\/admin\/sign-in$/);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter your email and password.')).toHaveRole('alert');
  const api = await request.get('/api/admin/session');
  expect(api.status()).toBe(401);
});
