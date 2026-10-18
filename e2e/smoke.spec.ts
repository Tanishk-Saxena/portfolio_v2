import { expect, test } from '@playwright/test';
import { signIn } from './admin-account';

// Smoke tests: the site's major flows still work. Deliberately coarse: they check outcomes
// (a page opens, a thing appears), never timings, pixels or animation details, so UI
// iteration doesn't break them. Runs under reduced motion (config) for determinism. One
// journey per area, so each page loads once; a failing step is named in the report.

test('home: hydrates without errors, a project opens and closes, lists page, the nav jumps', async ({
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

  await test.step('Show more pages Projects and Writing in threes; Show less collapses', async () => {
    for (const [id, items] of [
      ['#projects', '.card-trigger'],
      ['#writing', 'a[href^="/articles/"]'],
    ] as const) {
      const section = page.locator(id);
      const shown = section.locator(items);
      await expect(shown).toHaveCount(3);
      const more = section.getByRole('button', { name: 'Show more' });
      const less = section.getByRole('button', { name: 'Show less' });
      // Each press shows more, until the button turns into Show less (the seed: 9 and 12).
      for (let count = 3, presses = 0; !(await less.isVisible()); presses++) {
        expect(presses).toBeLessThan(5);
        await more.click();
        await expect.poll(() => shown.count()).toBeGreaterThan(count);
        count = await shown.count();
      }
      await less.click();
      await expect(shown).toHaveCount(3);
    }
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
  // A row clicked before the page hydrates can be lost under load (parallel runs): click again
  // while still on the home page. The outcome is what's tested, not the first click.
  await expect(async () => {
    if (!page.url().includes('/articles/')) {
      await page
        .locator('#writing')
        .getByRole('link', { name: /second render/i })
        .click({ timeout: 2_000 });
    }
    await expect(page).toHaveURL(/\/articles\/second-render$/, { timeout: 5_000 });
  }).toPass({ timeout: 30_000 });
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

// Signed in as the test admin (`admin-account.ts`), writing to CI's local Supabase. Each
// viewport makes its own quote, so the two runs never touch the same row.
test('admin: signed in — create, edit, toggle, delete and undo, settings', async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  const text = `Smoke test quote (${info.project.name} ${Date.now()})`;
  const title = `“${text}”`; // how the list names a quote row
  // "Create" for a new entry, "Save" once it exists; phones have their own bar.
  const save = page.getByRole('button', { name: /^(Create|Save)$/ }).locator('visible=true');

  await test.step('signs in', () => signIn(page));

  await test.step('creates a quote', async () => {
    await page.goto('/admin/quotes/new');
    await page.getByRole('textbox', { name: /^Quote/ }).fill(text);
    await page.getByRole('textbox', { name: /^Attribution/ }).fill('Smoke');
    await save.click();
    await expect(page.getByText('Saved, live on the site')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/quotes\/(?!new)[^/]+$/);
  });

  await test.step('edits and saves it again', async () => {
    await page.getByRole('textbox', { name: /^Attribution/ }).fill('Smoke, edited');
    await save.click();
    await expect(page.getByText('Saved, live on the site')).toBeVisible();
    // A save refreshes the admin's shell; let that land before typing a new address (WebKit
    // reports the refresh's URL update as a competing navigation if it lands mid-`goto`).
    await page.waitForLoadState('networkidle');
  });

  await test.step('takes it out of rotation from the list', async () => {
    await page.goto('/admin/quotes');
    await page.getByRole('button', { name: `Shown. Take out of rotation: ${title}` }).click();
    await expect(page.getByText('Saved, out of rotation')).toBeVisible();
    await expect(
      page.getByRole('button', { name: `Skipped. Put in rotation: ${title}` }),
    ).toBeVisible();
  });

  await test.step('deletes it, then undoes the delete', async () => {
    await page.getByRole('button', { name: `Delete quote: ${title}` }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    await expect(page.getByText('Deleted, removed from the site')).toBeVisible();
    // Toasts stack, newest lowest: the delete's Undo is the last one.
    await page.getByRole('button', { name: 'Undo' }).last().click();
    await expect(page.getByText('Restored')).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('button', { name: `Skipped. Put in rotation: ${title}` }),
    ).toBeVisible();
  });

  await test.step('opens Settings', async () => {
    await page.goto('/admin/settings');
    await expect(page.getByText('Accent', { exact: true })).toBeVisible();
  });
});

// Every kind of save, end to end: a single form, an upload, an article published from the
// editor, a style setting; each checked on the site itself. Desktop only: Hero, About and
// Settings are single records, and two viewports saving them at once would collide (409).
test('admin: saves reach the site — a form, an upload, an article, a setting', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'single records: one writer at a time');
  test.setTimeout(120_000);
  const stamp = Date.now();
  const save = page
    .getByRole('button', { name: /^(Create|Save|Publish)$/ })
    .locator('visible=true');
  // The toast, then the shell's refresh settled, before the next address is typed.
  const saved = async (text: string | RegExp) => {
    await expect(page.getByText(text).last()).toBeVisible();
    await page.waitForLoadState('networkidle');
  };
  // A save marks the pages stale; the next visit renders them again.
  const onSite = async (path: string, check: () => Promise<void>) =>
    expect(async () => {
      await page.goto(path);
      await check();
    }).toPass({ timeout: 20_000 });

  await test.step('signs in', () => signIn(page));

  await test.step('Hero: a single form saves and the home page shows it', async () => {
    const eyebrow = `Smoke eyebrow ${stamp}`;
    await page.goto('/admin/hero');
    await page.getByRole('textbox', { name: /^Eyebrow/ }).fill(eyebrow);
    await save.click();
    await saved('Saved, live on the site');
    await onSite('/', () => expect(page.getByText(eyebrow)).toBeVisible());
  });

  await test.step('About: a portrait uploads to Storage and shows on the site', async () => {
    await page.goto('/admin/about');
    // A real photo (the repo's sample): the admin reads its size before uploading.
    await page.getByLabel('Portrait').setInputFiles('public/samples/photo-1.jpg');
    await expect(page.getByRole('button', { name: 'Remove file' })).toBeVisible({
      timeout: 15_000,
    });
    await save.click();
    await saved('Saved, live on the site');
    await onSite('/', async () => {
      const portrait = page.locator('#about img[alt^="Portrait of"]');
      await expect(portrait).toBeVisible();
      expect(await portrait.getAttribute('src')).toContain('storage');
    });
  });

  await test.step('Writing: an article published from the editor has its own page', async () => {
    const title = `Smoke article ${stamp}`;
    await page.goto('/admin/writing/new');
    await page.getByRole('textbox', { name: /^Title/ }).fill(title);
    await page.getByRole('textbox', { name: /^Body/ }).fill('## A heading\n\nA paragraph.');
    await page.getByRole('radio', { name: 'Published' }).click();
    await save.click();
    await saved(`Live at /articles/smoke-article-${stamp}`);
    await onSite(`/articles/smoke-article-${stamp}`, () =>
      expect(page.getByRole('heading', { level: 1 })).toHaveText(title),
    );
  });

  await test.step('Settings: the accent changes the site, then goes back', async () => {
    for (const [label, accent] of [
      ['Slate blue', 'slate'],
      ['Terracotta', 'terracotta'],
    ] as const) {
      await page.goto('/admin/settings');
      await page.getByRole('radio', { name: label }).click();
      await save.click();
      await saved('Saved, live on the site');
      await onSite('/', () => expect(page.locator('html')).toHaveAttribute('data-accent', accent));
    }
  });
});
