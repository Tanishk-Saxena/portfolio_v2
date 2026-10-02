import { describe, expect, it } from 'vitest';
import type { AdminRepositories, Repositories } from '@/lib/domain/repositories';

/*
 * The repository contract, written against the interfaces only. Every implementation
 * (fixtures and Supabase) runs this same suite; Supabase passing it unchanged is what
 * proved the migration (brief §4 rule 4). Each test reads what it needs once, so the live
 * run makes few round trips.
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
    it('every method is async, and returned data is a copy', async () => {
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
      await Promise.all(calls);

      const profile = await r.profile.get();
      profile.name = 'mutated';
      const projects = await r.projects.list();
      projects.length = 0;
      expect((await r.profile.get()).name).not.toBe('mutated');
      expect((await r.projects.list()).length).toBeGreaterThan(0);
    });

    it('single records are complete: profile and settings', async () => {
      const r = make();
      const [p, s] = await Promise.all([r.profile.get(), r.settings.get()]);
      expect(p.name.trim()).not.toBe('');
      expect(p.email).toMatch(/@/);
      if (p.headlineHighlight) expect(p.headline).toContain(p.headlineHighlight);
      expect(['terracotta', 'slate']).toContain(s.accent);
      expect(['right', 'centre']).toContain(s.navPosition);
      expect(['arc', 'wheel']).toContain(s.menuLayout);
      expect(s.grain).toBeGreaterThanOrEqual(0);
      expect(s.grain).toBeLessThanOrEqual(24);
    });

    it('lists come back in sortOrder, holding only what the site shows', async () => {
      const r = make();
      const [experience, projects, skills, quotes, links] = await Promise.all([
        r.experience.list(),
        r.projects.list(),
        r.skills.listGroups(),
        r.quotes.list(),
        r.socialLinks.list(),
      ]);
      for (const list of [experience, projects, skills, quotes, links]) {
        expect(isSortedBy(list, (x: { sortOrder: number }) => x.sortOrder)).toBe(true);
      }
      for (const e of experience) if (e.endDate) expect(e.endDate >= e.startDate).toBe(true);
      expect(projects.every((p) => p.published)).toBe(true);
      expect(quotes.every((q) => q.active)).toBe(true);
      expect(links.every((l) => l.url.trim() !== '')).toBe(true);
    });

    it('articles: published, newest first, unique slugs, readable by slug', async () => {
      const r = make();
      const list = await r.articles.list();
      expect(list.every((a) => a.status === 'published')).toBe(true);
      expect(isSortedBy(list, (a) => a.publishedAt, -1)).toBe(true);
      expect(new Set(list.map((a) => a.slug)).size).toBe(list.length);
      for (const a of list) {
        expect(a).not.toHaveProperty('body');
        expect(Number.isInteger(a.readMinutes) && a.readMinutes >= 1).toBe(true);
      }
      const full = await Promise.all(list.map((a) => r.articles.getBySlug(a.slug)));
      for (const [i, article] of full.entries()) {
        expect(article?.slug).toBe(list[i].slug);
        expect(article!.hasBody || article!.externalUrl !== null).toBe(true);
        expect(article!.hasBody).toBe(article!.body !== null && article!.body.trim() !== '');
      }
      expect(await r.articles.getBySlug('__no-such-article__')).toBeNull();
    });
  });
}

/**
 * The admin's reads hold everything the site shows plus the hidden rows, in the same order.
 * Run over the same data as `site`.
 */
export async function checkAdminRepositories(admin: AdminRepositories, site: Repositories) {
  const [experience, projects, articles, skills, quotes] = await Promise.all([
    admin.experience.list(),
    admin.projects.list(),
    admin.articles.list(),
    admin.skills.listGroups(),
    admin.quotes.list(),
  ]);
  for (const list of [experience, projects, skills, quotes]) {
    expect(isSortedBy(list, (x: { sortOrder: number }) => x.sortOrder)).toBe(true);
  }
  expect(isSortedBy(articles, (a) => a.publishedAt, -1)).toBe(true);
  expect(new Set(articles.map((a) => a.id)).size).toBe(articles.length);

  const ids = <T>(list: T[], key: (x: T) => string) => list.map(key);
  const [siteProjects, siteArticles, siteQuotes] = await Promise.all([
    site.projects.list(),
    site.articles.list(),
    site.quotes.list(),
  ]);
  expect(ids(projects, (p) => p.id)).toEqual(
    expect.arrayContaining(ids(siteProjects, (p) => p.id)),
  );
  expect(ids(articles, (a) => a.slug)).toEqual(
    expect.arrayContaining(ids(siteArticles, (a) => a.slug)),
  );
  expect(ids(quotes, (q) => q.id)).toEqual(expect.arrayContaining(ids(siteQuotes, (q) => q.id)));
  return { experience, projects, articles, skills, quotes };
}
