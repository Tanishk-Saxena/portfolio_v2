import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { NO_ADMIN, NO_ADMIN_REASON, signIn } from './admin-account';

/*
 * Axe (WCAG 2.1 AA, brief §3) on every admin screen, in both colour modes, signed in as the
 * test admin (`admin-account.ts`; Phase 9 roadmap item 2), on the same fixtures build as the
 * site's tests. Skips without the credentials. Nothing here writes: the dialogs are opened
 * and cancelled.
 *
 * One test per colour mode and viewport walks every screen (signing in once), with a soft
 * assertion per screen so the report names each one that fails.
 */

test.describe.configure({ timeout: 240_000 });
test.skip(NO_ADMIN, NO_ADMIN_REASON);

const COLLECTIONS = ['writing', 'projects', 'experience', 'skills', 'quotes'] as const;
const SINGLES = ['hero', 'about', 'contact', 'settings'] as const;
const SINGULAR = {
  writing: 'article',
  projects: 'project',
  experience: 'role',
  skills: 'group',
  quotes: 'quote',
};

async function audit(page: Page, screen: string) {
  // Audit the settled page: text caught mid-fade would be measured at partial opacity.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect
    .soft(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
      screen,
    )
    .toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test(`admin passes axe in ${theme} mode`, async ({ page }, info) => {
    const phone = info.project.name === 'mobile';
    await page.addInitScript((t) => localStorage.setItem('admin-theme', t), theme);

    await page.goto('/admin/sign-in');
    await audit(page, 'sign-in');
    await signIn(page);

    for (const slug of SINGLES) {
      await page.goto(`/admin/${slug}`);
      await audit(page, slug);
    }

    for (const slug of COLLECTIONS) {
      await page.goto(`/admin/${slug}`);
      await audit(page, `${slug} list`);

      const entry = page.locator(`a[href^="/admin/${slug}/"]:not([href$="/new"])`).first();
      if (await entry.count()) {
        await page.goto((await entry.getAttribute('href')) ?? '');
        await audit(page, `${slug} editor`);
        // The delete confirmation, cancelled.
        await page.getByRole('button', { name: `Delete ${SINGULAR[slug]}` }).click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await audit(page, `${slug} delete dialog`);
        await page.getByRole('button', { name: 'Cancel' }).click();
      }
    }

    await page.goto('/admin/projects/new');
    await audit(page, 'new project editor');
    // The leave dialog: an unsaved edit, then Back.
    await page.getByRole('textbox').first().fill('Unsaved');
    await page.getByRole('link', { name: 'Back to list' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await audit(page, 'leave dialog');
    await page.getByRole('button', { name: 'Keep editing' }).click();

    if (phone) {
      await page.goto('/admin/writing');
      await page
        .getByRole('button', { name: /open sections/i })
        .first()
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await audit(page, 'sections sheet');
    }
  });
}
