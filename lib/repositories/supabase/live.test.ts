import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  checkAdminRepositories,
  checkAdminWrites,
  runRepositoryContract,
} from '../repository-contract';
import { createPublicClient } from './client';
import { createSupabaseAdminRepositories } from './supabase-admin-repositories';
import { createSupabaseRepositories } from './supabase-repositories';

/*
 * Everything that needs the real dev project in .env.local, in one file so the network
 * calls run one after another. Skips without keys (CI). Never point this at production:
 * with the secret key it plants rows and throwaway accounts, and removes them after.
 */

try {
  process.loadEnvFile('.env.local'); // never overrides variables already set (CI secrets)
} catch {
  // no .env.local: rely on the environment
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const secret = process.env.SUPABASE_SECRET_KEY ?? '';
const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } };
const client = (k = key) => createClient(url, k, NO_SESSION);

describe.skipIf(!url || !key)('Supabase dev project', () => {
  runRepositoryContract('supabase', () => createSupabaseRepositories(createPublicClient()));

  it('anonymous visitors cannot write, upload or read the allowlist', async () => {
    const db = createPublicClient();
    const results = await Promise.all([
      db.from('quote').insert({ text: 'x', author: 'y' }),
      db.from('profile').update({ name: 'hijacked' }).eq('id', true),
      db.from('experience').delete().neq('id', ''),
      db.storage
        .from('media')
        .upload(`test/anon-${Date.now()}.txt`, new Blob(['x'], { type: 'text/plain' })),
    ]);
    for (const result of results) expect(result.error).not.toBeNull();
    expect((await createSupabaseRepositories(db).profile.get()).name).not.toBe('hijacked');
    const { data } = await db.from('admin_user').select('user_id');
    expect(data ?? []).toEqual([]);
  });

  // The secret key plants what anonymous visitors must never see, and the test accounts.
  describe.skipIf(!secret)('with the secret key', () => {
    let service: SupabaseClient; // made in beforeAll: the body runs even when skipped
    const tag = `rls-test-${Date.now()}`;
    const password = `pw-${randomUUID()}`;
    const accounts = {
      admin: `admin-test-${randomUUID()}@example.com`,
      stranger: `stranger-test-${randomUUID()}@example.com`,
    };
    const userIds: string[] = [];

    beforeAll(async () => {
      service = client(secret);
      for (const [role, email] of Object.entries(accounts)) {
        const { data, error } = await service.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        userIds.push(data.user.id);
        if (role === 'admin') {
          const listed = await service.from('admin_user').insert({ user_id: data.user.id });
          if (listed.error) throw listed.error;
        }
      }
    });

    afterAll(async () => {
      await service.from('project').delete().eq('id', tag);
      await service.from('quote').delete().eq('id', tag);
      await service.from('quote').delete().eq('author', tag); // the admin-write check's
      // Reorder renumbers the live quotes, planted ones included: close the gaps they leave.
      const { data: left } = await service
        .from('quote')
        .select('id')
        .is('deleted_at', null)
        .order('sort_order');
      for (const [i, q] of (left ?? []).entries()) {
        await service
          .from('quote')
          .update({ sort_order: i + 1 })
          .eq('id', q.id);
      }
      await service.from('article').delete().like('slug', `${tag}%`); // planted + admin-written
      await service.from('social_link').delete().eq('id', `${tag}-link`); // the admin-write check's
      // Deleting a user cascades to admin_user.
      for (const id of userIds) await service.auth.admin.deleteUser(id);
    });

    async function signedIn(email: string) {
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

    it('unpublished, inactive, draft and deleted rows never reach the site', async () => {
      const planted = await Promise.all([
        service.from('project').insert({ id: tag, title: tag, kind: 'side-project', year: 2026 }),
        service.from('quote').insert({ id: tag, text: tag, author: tag, active: false }),
        service.from('article').insert({ slug: tag, title: tag, body: 'Draft.', status: 'draft' }),
      ]);
      for (const p of planted) expect(p.error).toBeNull();

      const site = createSupabaseRepositories(createPublicClient());
      expect((await site.projects.list()).map((p) => p.id)).not.toContain(tag);
      expect((await site.quotes.list()).map((q) => q.id)).not.toContain(tag);
      expect(await site.articles.getBySlug(tag)).toBeNull();

      // The signed-in admin reads them all (RLS lets the hidden rows through).
      const admin = await checkAdminRepositories(
        createSupabaseAdminRepositories(await signedIn(accounts.admin)),
        site,
      );
      expect(admin.projects.map((p) => p.id)).toContain(tag);
      expect(admin.quotes.map((q) => q.id)).toContain(tag);
      expect(admin.articles.find((a) => a.slug === tag)?.status).toBe('draft');

      // Published but soft-deleted is hidden too, and anon sees nothing even unfiltered.
      await service
        .from('article')
        .update({ status: 'published', deleted_at: new Date().toISOString() })
        .eq('slug', tag);
      expect(await site.articles.getBySlug(tag)).toBeNull();
      const raw = await createPublicClient().from('article').select('slug').eq('slug', tag);
      expect(raw.data).toEqual([]);
    });

    it('auth: sign-ups are off and a wrong password is refused', async () => {
      const signup = await client().auth.signUp({
        email: `signup-test-${randomUUID()}@example.com`,
        password,
      });
      if (signup.data.user) userIds.push(signup.data.user.id); // clean up if the setting is wrong
      expect(signup.error).not.toBeNull();

      const wrong = await client().auth.signInWithPassword({
        email: accounts.admin,
        password: 'wrong',
      });
      expect(wrong.error?.code).toBe('invalid_credentials');
    });

    it('the signed-in admin creates and edits entries and saves the profile', async () => {
      await checkAdminWrites(createSupabaseAdminRepositories(await signedIn(accounts.admin)), tag);
    }, 30_000); // ~20 round trips

    it('storage cleanup: the admin removes an uploaded file, and only an upload', async () => {
      const bucket = service.storage.from('media');
      const path = `images/${randomUUID()}.png`;
      const planted = await bucket.upload(path, new Blob(['x'], { type: 'image/png' }));
      expect(planted.error).toBeNull();
      const stored = async () => (await bucket.list('images', { search: path.slice(7) })).data;
      expect(await stored()).toHaveLength(1);

      const admin = createSupabaseAdminRepositories(await signedIn(accounts.admin));
      // The live project's files are all accounted for, so none of them is up for removal.
      const kept = await admin.files.references();
      expect(kept).not.toContain(bucket.getPublicUrl(path).data.publicUrl);
      await admin.files.remove(['/resume.pdf', bucket.getPublicUrl(path).data.publicUrl]);
      expect(await stored()).toHaveLength(0);
    });

    it('auth: only the allowlisted account can write; a signed-in stranger cannot', async () => {
      const admin = await signedIn(accounts.admin);
      expect((await admin.rpc('is_admin')).data).toBe(true);
      const written = await rewriteProfile(admin);
      expect(written.error).toBeNull();
      expect(written.data).toHaveLength(1);

      const stranger = await signedIn(accounts.stranger);
      expect((await stranger.rpc('is_admin')).data).toBe(false);
      expect((await rewriteProfile(stranger)).data ?? []).toHaveLength(0); // RLS filters it out
      expect(
        (await stranger.from('quote').insert({ text: 'x', author: 'y' })).error,
      ).not.toBeNull();
      expect((await stranger.from('admin_user').select('user_id')).data ?? []).toEqual([]);
    });
  });
});
