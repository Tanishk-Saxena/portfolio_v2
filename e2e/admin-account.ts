import { type Page } from '@playwright/test';

/*
 * The test admin the signed-in tests use (smoke, axe, the admin's Lighthouse reading): an
 * allowlisted account in CI's local Supabase, made by `scripts/test-admin.mjs` from
 * E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Its saves are real writes, to that throwaway
 * database only.
 */

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? '';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('The signed-in tests need E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
}

/** Signs in through the form and lands on the admin's start page. */
export async function signIn(page: Page) {
  await page.goto('/admin/sign-in');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/admin\/writing/);
}
