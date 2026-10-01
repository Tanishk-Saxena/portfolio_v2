import { describe, expect, it } from 'vitest';
import type { Repositories } from '@/lib/domain/repositories';

/*
 * The repository contract, written against the interfaces only. Every implementation
 * (fixtures and Supabase) runs this same suite; Supabase passing it unchanged is what
 * proved the migration (brief §4 rule 4).
 */

/** Ascending (dir 1) or descending (dir -1); equal neighbours are fine either way. */
const isSortedBy = <T>(items: T[], key: (item: T) => number | string, dir: 1 | -1 = 1) =>
  items.every((item, i) => {
    if (i === 0) return true;
    const [prev, cur] = [key(items[i - 1]), key(item)];
    return dir === 1 ? prev <= cur : prev >= cur;
  });

export function runRepositoryContract(name: string, make: () => Repositories) {
  describe(`repository contract — ${name}`, () => {
    it('every method returns a Promise', () => {
      const r = make();
      const calls: unknown[] = [
        r.profile.get(),
        r.experience.list(),
        r.projects.list(),
        r.articles.list(),
        r.articles.getBySlug('anything'),
        r.skills.listGroups(),
        r.quotes.list(),
        r.socialLinks.list(),
        r.settings.get(),
      ];
      for (const call of calls) expect(call).toBeInstanceOf(Promise);
    });

    it('profile is complete, and the highlight appears in the headline', async () => {
      const p = await make().profile.get();
      expect(p.name.trim()).not.toBe('');
      expect(p.email).toMatch(/@/);
      if (p.headlineHighlight) expect(p.headline).toContain(p.headlineHighlight);
    });

    it('experience date ranges are valid', async () => {
      for (const e of await make().experience.list())
        if (e.endDate) expect(e.endDate >= e.startDate).toBe(true);
    });

    it('experience, projects, skill groups, quotes and social links come back in sortOrder', async () => {
      const r = make();
      for (const list of [
        await r.experience.list(),
        await r.projects.list(),
        await r.skills.listGroups(),
        await r.quotes.list(),
        await r.socialLinks.list(),
      ]) {
        expect(isSortedBy(list, (x: { sortOrder: number }) => x.sortOrder)).toBe(true);
      }
    });

    it('articles: newest first, unique slugs, no body in the list', async () => {
      const list = await make().articles.list();
      expect(isSortedBy(list, (a) => a.publishedAt, -1)).toBe(true);
      expect(new Set(list.map((a) => a.slug)).size).toBe(list.length);
      for (const a of list) expect(a).not.toHaveProperty('body');
    });

    it('articles: every entry has a body or an external URL, and hasBody tells the truth', async () => {
      const r = make();
      for (const summary of await r.articles.list()) {
        const article = await r.articles.getBySlug(summary.slug);
        expect(article?.slug).toBe(summary.slug);
        expect(article!.hasBody || article!.externalUrl !== null).toBe(true);
        expect(article!.hasBody).toBe(article!.body !== null && article!.body.trim() !== '');
      }
    });

    it('only what the site shows comes back: published, active, linked', async () => {
      const r = make();
      expect((await r.projects.list()).every((p) => p.published)).toBe(true);
      expect((await r.articles.list()).every((a) => a.status === 'published')).toBe(true);
      expect((await r.quotes.list()).every((q) => q.active)).toBe(true);
      expect((await r.socialLinks.list()).every((l) => l.url.trim() !== '')).toBe(true);
    });

    it('every article has a whole, positive read time', async () => {
      for (const a of await make().articles.list()) {
        expect(Number.isInteger(a.readMinutes)).toBe(true);
        expect(a.readMinutes).toBeGreaterThanOrEqual(1);
      }
    });

    it('settings are a complete record within range', async () => {
      const s = await make().settings.get();
      expect(['terracotta', 'slate']).toContain(s.accent);
      expect(['right', 'centre']).toContain(s.navPosition);
      expect(['arc', 'wheel']).toContain(s.menuLayout);
      expect(s.grain).toBeGreaterThanOrEqual(0);
      expect(s.grain).toBeLessThanOrEqual(24);
    });

    it('getBySlug returns null for an unknown slug', async () => {
      expect(await make().articles.getBySlug('__no-such-article__')).toBeNull();
    });

    it('returned data is a copy: mutating it never leaks into later calls', async () => {
      const r = make();
      const profile = await r.profile.get();
      profile.name = 'mutated';
      const projects = await r.projects.list();
      projects.length = 0;
      expect((await r.profile.get()).name).not.toBe('mutated');
      expect((await r.projects.list()).length).toBeGreaterThan(0);
    });
  });
}
