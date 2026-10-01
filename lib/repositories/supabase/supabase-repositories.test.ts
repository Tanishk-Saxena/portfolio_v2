import { createClient } from '@supabase/supabase-js';
import { afterAll, describe, expect, it } from 'vitest';
import { runRepositoryContract } from '../repository-contract';
import { createPublicClient } from './client';
import { createSupabaseRepositories } from './supabase-repositories';

/*
 * Runs against the dev Supabase project named in .env.local, and skips when none is
 * configured. Never point this at production: the RLS checks write test rows.
 */

try {
  process.loadEnvFile('.env.local'); // never overrides variables already set (CI secrets)
} catch {
  // no .env.local: rely on the environment
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configured = Boolean(url && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const secret = process.env.SUPABASE_SECRET_KEY;

describe.skipIf(!configured)('Supabase', () => {
  runRepositoryContract('supabase', () => createSupabaseRepositories(createPublicClient()));

  describe('RLS: anonymous visitors only read', () => {
    const anon = () => createPublicClient();

    it('cannot insert, update or delete content', async () => {
      const db = anon();
      const insert = await db.from('quote').insert({ text: 'x', author: 'y' });
      const update = await db.from('profile').update({ name: 'hijacked' }).eq('id', true);
      const remove = await db.from('experience').delete().neq('id', '');
      for (const result of [insert, update, remove]) expect(result.error).not.toBeNull();
      expect((await createSupabaseRepositories(db).profile.get()).name).not.toBe('hijacked');
    });

    it('cannot read the admin allowlist', async () => {
      const { data } = await anon().from('admin_user').select('user_id');
      expect(data ?? []).toEqual([]);
    });

    it('cannot upload media', async () => {
      const { error } = await anon()
        .storage.from('media')
        .upload(`test/anon-${Date.now()}.txt`, new Blob(['x'], { type: 'text/plain' }));
      expect(error).not.toBeNull();
    });
  });

  // Needs the secret key to plant hidden rows, then checks the public reads never see them.
  describe.skipIf(!secret)('hidden rows stay hidden', () => {
    const admin = () =>
      createClient(url!, secret!, { auth: { persistSession: false, autoRefreshToken: false } });
    const tag = `rls-test-${Date.now()}`;

    afterAll(async () => {
      const db = admin();
      await db.from('project').delete().eq('id', tag);
      await db.from('quote').delete().eq('id', tag);
      await db.from('article').delete().eq('slug', tag);
    });

    it('unpublished, inactive, draft and deleted rows never reach the site', async () => {
      const db = admin();
      const planted = await Promise.all([
        db.from('project').insert({ id: tag, title: tag, kind: 'side-project', year: 2026 }),
        db.from('quote').insert({ id: tag, text: tag, author: tag, active: false }),
        db.from('article').insert({ slug: tag, title: tag, body: 'Draft.', status: 'draft' }),
      ]);
      for (const p of planted) expect(p.error).toBeNull();

      const site = createSupabaseRepositories(createPublicClient());
      expect((await site.projects.list()).map((p) => p.id)).not.toContain(tag);
      expect((await site.quotes.list()).map((q) => q.id)).not.toContain(tag);
      expect(await site.articles.getBySlug(tag)).toBeNull();

      // Published but soft-deleted is hidden too, and anon sees nothing even unfiltered.
      await db
        .from('article')
        .update({ status: 'published', deleted_at: new Date().toISOString() })
        .eq('slug', tag);
      expect(await site.articles.getBySlug(tag)).toBeNull();
      const raw = await createPublicClient().from('article').select('slug').eq('slug', tag);
      expect(raw.data).toEqual([]);
    });
  });
});
