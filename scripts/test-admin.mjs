// Creates the test admin in CI's local Supabase: an account (E2E_ADMIN_EMAIL /
// E2E_ADMIN_PASSWORD) on the allowlist, like the owner's. The signed-in e2e tests and the
// admin's Lighthouse reading sign in as it. Local only: it refuses any other Supabase.
// Usage (after `npx supabase start`): node scripts/test-admin.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const secret = process.env.SUPABASE_SECRET_KEY ?? '';
const email = process.env.E2E_ADMIN_EMAIL ?? '';
const password = process.env.E2E_ADMIN_PASSWORD ?? '';

if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
  throw new Error(`The test admin is made only in a local Supabase, not ${url}`);
}
if (!secret || !email || !password) {
  throw new Error('Needs SUPABASE_SECRET_KEY, E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
}

const service = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await service.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) throw error;
const listed = await service.from('admin_user').insert({ user_id: data.user.id });
if (listed.error) throw listed.error;
console.log(`Test admin ${email} created and allowlisted.`);
