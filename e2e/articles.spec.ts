import { expect, test } from '@playwright/test';

test('a writing row opens its article, and the back link returns to that row', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('#writing')
    .getByRole('link', { name: /second render/i })
    .click();
  await expect(page).toHaveURL(/\/articles\/second-render$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The second render is the one users feel',
  );

  await page.getByRole('link', { name: 'Writing', exact: true }).click();
  await expect(page).toHaveURL(/\/#post-second-render$/);
  await expect(page.locator('#post-second-render')).toBeInViewport();
});

test('a deep link to a row beyond the first page expands the list first', async ({ page }) => {
  // "code-review" is the 5th post: hidden until "Show more" in the default view.
  await page.goto('/#post-code-review');
  const row = page.locator('#post-code-review');
  await expect(row).toBeVisible();
  await expect(row).toBeInViewport();
});

test('an unknown article slug is a 404', async ({ page }) => {
  const response = await page.goto('/articles/no-such-article');
  expect(response?.status()).toBe(404);
});

test('the Listen control toggles to Stop and back', async ({ page }) => {
  // Stub the speech API: real voices differ by machine (CI has none, so speech errors out
  // instantly). The stub "speaks" until cancelled and records the text it was given.
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__spoken = '';
    w.SpeechSynthesisUtterance = class {
      text: string;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: (u: { text: string }) => (w.__spoken = u.text),
        cancel: () => {},
      },
    });
  });
  await page.goto('/articles/second-render');
  const listen = page.getByRole('button', { name: 'Listen' });
  await listen.click();
  expect(await page.evaluate(() => (window as unknown as { __spoken: string }).__spoken)).toContain(
    'The second render is the one users feel',
  );
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByRole('button', { name: 'Listen' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});
