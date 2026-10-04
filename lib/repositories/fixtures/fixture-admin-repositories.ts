import { randomUUID } from 'node:crypto';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import { profileFiles, projectFiles } from '@/lib/admin/storage';
import type { Project, Stamped } from '@/lib/domain/types';
import { type ArticleRecord, toSummary } from '../article-record';
import type { FixtureDataset } from './dataset';

/*
 * The admin over a FixtureDataset. Writes change the dataset passed in: in local dev the
 * container passes its shared working copy, so an edit shows on the site until the server
 * restarts; tests pass a clone. Timestamps and soft-deleted entries live in the dataset's
 * `admin` bookkeeping, so they last across requests too.
 */

const copy = <T>(value: T): T => structuredClone(value);
const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export function createFixtureAdminRepositories(data: FixtureDataset): AdminRepositories {
  const books = (data.admin ??= { stamps: {}, trash: {} });
  const stamp = <T extends object>(key: string, value: T): Stamped<T> => ({
    ...copy(value),
    updatedAt: books.stamps[key] ?? null,
  });
  const touch = (key: string) => {
    books.stamps[key] = new Date().toISOString();
  };

  /** Soft delete: out of the array (so the site skips it), into the trash for Undo. */
  function trash<T extends { id?: string; slug?: string }>(name: string, items: T[], i: number) {
    const [item] = items.splice(i, 1);
    books.trash[`${name}:${item.id ?? item.slug}`] = item;
  }
  function untrash<T>(name: string, id: string, items: T[]) {
    const item = books.trash[`${name}:${id}`] as T | undefined;
    if (!item) return false;
    delete books.trash[`${name}:${id}`];
    items.push(item);
    return true;
  }

  function collection<T extends { id: string; sortOrder: number }>(
    name: string,
    items: () => T[],
  ): AdminCollection<T> {
    const key = (id: string) => `${name}:${id}`;
    const find = (id: string) => items().find((i) => i.id === id);
    const change = async (id: string, values: object) => {
      const item = find(id);
      if (!item) return null;
      Object.assign(item, copy(values));
      touch(key(id));
      return stamp(key(id), item);
    };
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
      update: change,
      patch: change,
      remove: async (id) => {
        const i = items().findIndex((item) => item.id === id);
        if (i < 0) return false;
        trash(name, items(), i);
        return true;
      },
      restore: async (id) => untrash(name, id, items()),
      reorder: async (ids) => {
        ids.forEach((id, i) => {
          const item = find(id);
          if (item) item.sortOrder = i + 1;
        });
      },
    };
  }

  // Fixture articles store no id: the slug stands in until an edit pins it (`id`), so the
  // admin's URL survives a slug change.
  const idOf = (a: ArticleRecord) => a.id ?? a.slug;
  const article = (id: string) => data.articles.find((a) => idOf(a) === id);
  const values = (a: ArticleRecord, id: string) =>
    stamp(`writing:${id}`, {
      id,
      slug: a.slug,
      title: a.title,
      body: a.body,
      externalUrl: a.externalUrl,
      status: a.status,
      publishedAt: a.publishedAt,
      readMinutes: a.readMinutes,
      listen: a.listen,
    });

  return {
    profile: {
      get: async () => stamp('profile', data.profile),
      update: async (profile) => {
        data.profile = copy(profile);
        touch('profile');
        return stamp('profile', data.profile);
      },
    },
    settings: {
      get: async () => stamp('settings', data.settings),
      update: async (settings) => {
        data.settings = copy(settings);
        touch('settings');
        return stamp('settings', data.settings);
      },
    },
    socialLinks: {
      list: async () => copy(data.socialLinks).sort(bySortOrder),
      replace: async (links) => {
        data.socialLinks = links.map((link, i) => ({ ...link, sortOrder: i + 1 }));
      },
    },
    // Fixtures have no bucket: their files are served by the site, so nothing is removed.
    files: {
      references: async () => {
        const trashed = Object.entries(books.trash)
          .filter(([key]) => key.startsWith('projects:'))
          .map(([, project]) => project as Project);
        return [
          ...profileFiles(data.profile),
          ...[...data.projects, ...trashed].flatMap(projectFiles),
        ];
      },
      remove: async () => {},
    },
    experience: collection('experience', () => data.experience),
    projects: collection('projects', () => data.projects),
    articles: {
      list: async () =>
        data.articles
          .map((a) => stamp(`writing:${idOf(a)}`, { id: idOf(a), ...toSummary(a) }))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
      get: async (id) => {
        const found = article(id);
        return found ? values(found, id) : null;
      },
      create: async (fields) => {
        const id = randomUUID();
        data.articles.push({ ...copy(fields), id, excerpt: '' });
        touch(`writing:${id}`);
        return values(data.articles.at(-1)!, id);
      },
      update: async (id, fields) => {
        const found = article(id);
        if (!found) return null;
        Object.assign(found, copy(fields), { id });
        touch(`writing:${id}`);
        return values(found, id);
      },
      setStatus: async (id, status) => {
        const found = article(id);
        if (!found) return false;
        found.status = status;
        touch(`writing:${id}`);
        return true;
      },
      remove: async (id) => {
        const i = data.articles.findIndex((a) => idOf(a) === id);
        if (i < 0) return false;
        trash<ArticleRecord>('writing', data.articles, i);
        return true;
      },
      restore: async (id) => untrash('writing', id, data.articles),
    },
    skills: collection('skills', () => data.skillGroups),
    quotes: collection('quotes', () => data.quotes),
  };
}
