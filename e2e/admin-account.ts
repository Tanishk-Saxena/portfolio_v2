import { type Page } from '@playwright/test';

/*
 * The dev project's test admin (an editor) that the signed-in admin tests use: smoke and
 * axe (Phase 9 roadmap items 1–2b). CI passes the credentials from repository secrets;
 * locally they live in `.env.local`. The tests run on a fixtures build, so sign-in goes
 * through the dev project while every save changes only the server's in-memory copy of
 * the fixtures, never the dev database.
 */

try {
  process.loadEnvFile('.env.local'); // never overrides variables already set (CI secrets)
} catch {
  // no .env.local: rely on the environment
}

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? '';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';
export const NO_ADMIN = !ADMIN_EMAIL || !ADMIN_PASSWORD;
export const NO_ADMIN_REASON = 'needs E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD';

/** Signs in through the form and lands on the admin's start page. */
export async function signIn(page: Page) {
  await page.goto('/admin/sign-in');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/admin\/writing/);
}
