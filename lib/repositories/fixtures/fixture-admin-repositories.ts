import { randomUUID } from 'node:crypto';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import type { Stamped } from '@/lib/domain/types';
import { toSummary } from '../article-record';
import type { FixtureDataset } from './dataset';

/*
 * The admin over a FixtureDataset. Writes change the dataset passed in: in local dev the
 * container passes its shared working copy, so an edit shows on the site until the server
 * restarts; tests pass a clone. Fixtures store no timestamps, so these live only as long as
 * this instance (one request in the app): "Last saved" shows over Supabase only.
 */

const copy = <T>(value: T): T => structuredClone(value);
const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export function createFixtureAdminRepositories(data: FixtureDataset): AdminRepositories {
  const stamps = new Map<string, string>();
  const stamp = <T extends object>(key: string, value: T): Stamped<T> => ({
    ...copy(value),
    updatedAt: stamps.get(key) ?? null,
  });
  const touch = (key: string) => stamps.set(key, new Date().toISOString());

  function collection<T extends { id: string; sortOrder: number }>(
    name: string,
    items: () => T[],
  ): AdminCollection<T> {
    const key = (id: string) => `${name}:${id}`;
    return {
      list: async () =>
        items()
          .toSorted(bySortOrder)
          .map((item) => stamp(key(item.id), item)),
      create: async (values) => {
        const sortOrder = Math.max(0, ...items().map((i) => i.sortOrder)) + 1;
        const item = { ...copy(values), id: randomUUID(), sortOrder } as T;
        items().push(item);
        touch(key(item.id));
        return stamp(key(item.id), item);
      },
      update: async (id, values) => {
        const item = items().find((i) => i.id === id);
        if (!item) return null;
        Object.assign(item, copy(values));
        touch(key(id));
        return stamp(key(id), item);
      },
    };
  }

  return {
    profile: {
      get: async () => stamp('profile', data.profile),
      update: async (profile) => {
        data.profile = copy(profile);
        touch('profile');
        return stamp('profile', data.profile);
      },
    },
    socialLinks: {
      list: async () => copy(data.socialLinks).sort(bySortOrder),
      setUrls: async (urls) => {
        for (const link of data.socialLinks) if (link.id in urls) link.url = urls[link.id];
      },
    },
    experience: collection('experience', () => data.experience),
    projects: collection('projects', () => data.projects),
    articles: {
      list: async () =>
        data.articles
          .map((a) => ({ id: a.slug, ...toSummary(a) }))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    },
    skills: collection('skills', () => data.skillGroups),
    quotes: collection('quotes', () => data.quotes),
  };
}
