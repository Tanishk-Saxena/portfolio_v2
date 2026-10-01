import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/*
 * Admin auth against the dev Supabase project in .env.local (Phase 7 verify): sign-ups are
 * off, only an allowlisted account is the admin, and RLS (not the proxy) stops anyone else
 * writing. Plants two throwaway accounts and deletes them. Skips without the secret key.
 * Never point this at production.
 */

try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local: rely on the environment
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const secret = process.env.SUPABASE_SECRET_KEY ?? '';
const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } };

const client = (k = key) => createClient(url, k, NO_SESSION);

describe.skipIf(!url || !key || !secret)('admin auth (dev project)', () => {
  const service = client(secret);
  const password = `pw-${randomUUID()}`;
  const accounts = {
    admin: `admin-test-${randomUUID()}@example.com`,
    stranger: `stranger-test-${randomUUID()}@example.com`,
  };
  const ids: string[] = [];

  beforeAll(async () => {
    for (const [role, email] of Object.entries(accounts)) {
      const { data, error } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      ids.push(data.user.id);
      if (role === 'admin') {
        const { error: listError } = await service
          .from('admin_user')
          .insert({ user_id: data.user.id });
        if (listError) throw listError;
      }
    }
  });

  afterAll(async () => {
    // Deleting the user cascades to admin_user.
    for (const id of ids) await service.auth.admin.deleteUser(id);
  });

  async function signedIn(email: string): Promise<SupabaseClient> {
    const db = client();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return db;
  }

  // Touches one harmless column on the singleton: sets the name to itself.
  async function rewriteProfile(db: SupabaseClient) {
    const { data: current } = await client().from('profile').select('name').single();
    return db.from('profile').update({ name: current?.name }).eq('id', true).select('id');
  }

  it('has public sign-ups turned off', async () => {
    const { data, error } = await client().auth.signUp({
      email: `signup-test-${randomUUID()}@example.com`,
      password,
    });
    if (data.user) ids.push(data.user.id); // clean up if the setting is wrong
    expect(error).not.toBeNull();
  });

  it('rejects a wrong password', async () => {
    const { error } = await client().auth.signInWithPassword({
      email: accounts.admin,
      password: 'wrong',
    });
    expect(error?.code).toBe('invalid_credentials');
  });

  it('treats the allowlisted account as the admin, who can write', async () => {
    const db = await signedIn(accounts.admin);
    expect((await db.rpc('is_admin')).data).toBe(true);
    const { data, error } = await rewriteProfile(db);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('lets a signed-in stranger read like anyone, but never write', async () => {
    const db = await signedIn(accounts.stranger);
    expect((await db.rpc('is_admin')).data).toBe(false);
    const { data } = await rewriteProfile(db);
    expect(data ?? []).toHaveLength(0); // RLS filters the row out of the update
    const insert = await db.from('quote').insert({ text: 'x', author: 'y' });
    expect(insert.error).not.toBeNull();
    const { data: allowlist } = await db.from('admin_user').select('user_id');
    expect(allowlist ?? []).toEqual([]);
  });
});
