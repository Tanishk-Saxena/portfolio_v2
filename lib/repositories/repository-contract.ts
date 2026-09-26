import { describe, expect, it } from 'vitest';
import type { Repositories } from '@/lib/domain/repositories';

/*
 * The repository contract, written against the interfaces only. Every implementation
 * (fixtures now, Supabase in Phase 6) runs this same suite; when Supabase passes it
 * unchanged, the migration is done (brief §4 rule 4).
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
      ];
      for (const call of calls) expect(call).toBeInstanceOf(Promise);
    });

    it('profile is complete, and the highlight appears in the headline', async () => {
      const p = await make().profile.get();
      expect(p.name.trim()).not.toBe('');
      expect(p.email).toMatch(/@/);
      if (p.headlineHighlight) expect(p.headline).toContain(p.headlineHighlight);
    });

    it('experience: current role first, then newest start date; ranges are valid', async () => {
      const list = await make().experience.list();
      const firstEnded = list.findIndex((e) => e.endDate !== null);
      if (firstEnded !== -1)
        expect(list.slice(firstEnded).every((e) => e.endDate !== null)).toBe(true);
      for (const group of [list.filter((e) => !e.endDate), list.filter((e) => e.endDate)]) {
        expect(isSortedBy(group, (e) => e.startDate, -1)).toBe(true);
      }
      for (const e of list) if (e.endDate) expect(e.endDate >= e.startDate).toBe(true);
    });

    it('projects, skill groups, quotes and social links come back in sortOrder', async () => {
      const r = make();
      for (const list of [
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
