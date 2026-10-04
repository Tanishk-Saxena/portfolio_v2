import { revalidatePath } from 'next/cache';
import { getAdminRepositories } from '@/lib/container';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import type { CollectionSlug } from './sections';
import { releaseFiles } from './storage';

/*
 * The list actions on the server (ADMIN-DESIGN-SPEC §7.1, §7.3, §9): the quick status toggle,
 * soft delete and restore, and reorder. Route handlers call these after checking the admin.
 * Each successful write marks the site stale (Q-A15).
 */

const markSiteStale = () => revalidatePath('/', 'layout');

type Ordered = Exclude<CollectionSlug, 'writing'>;
const ordered = (r: AdminRepositories, slug: Ordered) =>
  r[slug] as AdminCollection<{ id: string; sortOrder: number }>;

/** Sections with a status pill, and the field it flips. */
export const TOGGLES = { projects: 'published', quotes: 'active', writing: 'status' } as const;
export type ToggleSlug = keyof typeof TOGGLES;
export const isToggleSlug = (slug: string): slug is ToggleSlug => Object.hasOwn(TOGGLES, slug);

export type ToggleResult = 'ok' | 'missing' | 'nothing-to-show';

/** Shows or hides one entry. An article with no body and no external URL can't go live. */
export async function setVisible(slug: ToggleSlug, id: string, visible: boolean) {
  const r = await getAdminRepositories();
  let result: ToggleResult = 'missing';
  if (slug === 'writing') {
    const article = (await r.articles.list()).find((a) => a.id === id);
    if (article && visible && !article.hasBody && !article.externalUrl) return 'nothing-to-show';
    if (article && (await r.articles.setStatus(id, visible ? 'published' : 'draft'))) result = 'ok';
  } else {
    const field = TOGGLES[slug];
    const collection = r[slug] as AdminCollection<{ id: string; sortOrder: number }>;
    if (await collection.patch(id, { [field]: visible })) result = 'ok';
  }
  if (result === 'ok') markSiteStale();
  return result;
}

/** Soft delete (`remove`) or Undo (`restore`). False when the entry isn't there to change. */
export async function setDeleted(slug: CollectionSlug, id: string, deleted: boolean) {
  const r = await getAdminRepositories();
  const target = slug === 'writing' ? r.articles : ordered(r, slug);
  const done = deleted ? await target.remove(id) : await target.restore(id);
  if (done) markSiteStale();
  // A deleted project keeps its files while Undo can restore it; this pass removes those of
  // projects deleted before that (`lib/admin/storage.ts`).
  if (done && deleted && slug === 'projects') await releaseFiles(r);
  return done;
}

/** Applies a new order. False when `ids` isn't exactly the live entries (the list is stale). */
export async function reorder(slug: Ordered, ids: string[]) {
  const collection = ordered(await getAdminRepositories(), slug);
  const live = (await collection.list()).map((e) => e.id);
  const same = ids.length === live.length && new Set(ids).size === ids.length;
  if (!same || !ids.every((id) => live.includes(id))) return false;
  await collection.reorder(ids);
  markSiteStale();
  return true;
}
