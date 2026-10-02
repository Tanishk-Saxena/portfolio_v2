import { revalidatePath } from 'next/cache';
import { getAdminRepositories } from '@/lib/container';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import type { Stamped } from '@/lib/domain/types';
import {
  applySingle,
  type EntrySlug,
  type EntryTypes,
  entryDraft,
  entryValues,
  type LoadedForm,
  settingsDraft,
  settingsValues,
  singleDraft,
  socialUrls,
} from './forms';
import type { Draft, FieldErrors } from './schema';

/*
 * Loading a form and saving it, on the server (ADMIN-DESIGN-SPEC §9). Pages load through
 * here; route handlers save through here after they have checked the admin and validated
 * the draft. Every write ends by marking the site stale (Q-A15).
 */

export type SingleFormSlug = 'hero' | 'about' | 'contact' | 'settings';

/** One section's entries: read one, create, update. Writing goes through the articles. */
interface EntryStore<T> {
  get(id: string): Promise<Stamped<T> | null>;
  create(values: unknown): Promise<Stamped<T & { id: string }>>;
  update(id: string, values: unknown): Promise<Stamped<T> | null>;
}

function entries<S extends EntrySlug>(r: AdminRepositories, slug: S): EntryStore<EntryTypes[S]> {
  if (slug === 'writing') return r.articles as unknown as EntryStore<EntryTypes[S]>;
  const collection = r[slug as Exclude<EntrySlug, 'writing'>] as unknown as AdminCollection<{
    id: string;
    sortOrder: number;
  }>;
  return {
    get: async (id) =>
      ((await collection.list()).find((e) => e.id === id) ?? null) as Stamped<EntryTypes[S]> | null,
    create: (values) => collection.create(values as never) as never,
    update: (id, values) => collection.update(id, values as never) as never,
  };
}

/** Field errors only the server can find (a slug another article took meanwhile): 422. */
export class Rejected extends Error {
  constructor(readonly errors: FieldErrors) {
    super('Rejected');
  }
}

/** Every other live article's slug: an article's must be unique (§11). */
export async function takenSlugs(exceptId: string | null): Promise<string[]> {
  const r = await getAdminRepositories();
  return (await r.articles.list()).filter((a) => a.id !== exceptId).map((a) => a.slug);
}

async function assertSlugFree(slug: EntrySlug, draft: Draft, exceptId: string | null) {
  if (slug !== 'writing') return;
  if ((await takenSlugs(exceptId)).includes(String(draft.slug).trim())) {
    throw new Rejected({ slug: 'Another article already uses this slug.' });
  }
}

/**
 * The prerendered site regenerates every page on its next visit: home, articles, sitemap
 * and share cards. One call; it rebuilds nothing by itself.
 */
const markSiteStale = () => revalidatePath('/', 'layout');

/**
 * The record changed since the editor opened it (another device saved, or a list toggle):
 * the save is refused with 409 and the editor keeps the draft (§7.3, Q-A6).
 */
export class Conflict extends Error {}

function assertUnchanged(current: string | null, expected: string | null) {
  if (current !== expected) throw new Conflict();
}

export async function loadSingle(slug: SingleFormSlug): Promise<LoadedForm> {
  const r = await getAdminRepositories();
  if (slug === 'settings') {
    const settings = await r.settings.get();
    return { draft: settingsDraft(settings), updatedAt: settings.updatedAt };
  }
  const [profile, links] = await Promise.all([r.profile.get(), r.socialLinks.list()]);
  return { draft: singleDraft(slug, profile, links), updatedAt: profile.updatedAt };
}

export async function saveSingle(
  slug: SingleFormSlug,
  draft: Draft,
  expectedUpdatedAt: string | null,
): Promise<LoadedForm> {
  const r = await getAdminRepositories();
  if (slug === 'settings') {
    assertUnchanged((await r.settings.get()).updatedAt, expectedUpdatedAt);
    const saved = await r.settings.update(settingsValues(draft));
    markSiteStale();
    return { draft, updatedAt: saved.updatedAt };
  }
  const current = await r.profile.get();
  assertUnchanged(current.updatedAt, expectedUpdatedAt);
  const saved = await r.profile.update(applySingle(slug, current, draft));
  if (slug === 'contact') await r.socialLinks.setUrls(socialUrls(draft));
  markSiteStale();
  return { draft, updatedAt: saved.updatedAt };
}

/** An entry's form; null when no live entry has this id. */
export async function loadEntry(slug: EntrySlug, id: string): Promise<LoadedForm | null> {
  const r = await getAdminRepositories();
  const entry = await entries(r, slug).get(id);
  return entry ? { draft: entryDraft(slug, entry), updatedAt: entry.updatedAt } : null;
}

export async function createEntry(slug: EntrySlug, draft: Draft) {
  await assertSlugFree(slug, draft, null);
  const r = await getAdminRepositories();
  const created = await entries(r, slug).create(entryValues(slug, draft));
  markSiteStale();
  return { id: created.id, updatedAt: created.updatedAt };
}

/** Null when no live entry has this id (deleted meanwhile, or never existed). */
export async function updateEntry(
  slug: EntrySlug,
  id: string,
  draft: Draft,
  expectedUpdatedAt: string | null,
) {
  const r = await getAdminRepositories();
  const store = entries(r, slug);
  const original = await store.get(id);
  if (!original) return null;
  assertUnchanged(original.updatedAt, expectedUpdatedAt);
  await assertSlugFree(slug, draft, id);
  const saved = await store.update(id, entryValues(slug, draft, original));
  if (!saved) return null;
  markSiteStale();
  return { id, updatedAt: saved.updatedAt };
}
