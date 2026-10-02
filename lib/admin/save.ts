import { revalidatePath } from 'next/cache';
import { getAdminRepositories } from '@/lib/container';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import {
  applySingle,
  type EntrySlug,
  type EntryTypes,
  entryDraft,
  entryValues,
  type LoadedForm,
  singleDraft,
  socialUrls,
} from './forms';
import type { Draft } from './schema';

/*
 * Loading a form and saving it, on the server (ADMIN-DESIGN-SPEC §9). Pages load through
 * here; route handlers save through here after they have checked the admin and validated
 * the draft. Every write ends by marking the site stale (Q-A15).
 */

export type SingleFormSlug = 'hero' | 'about' | 'contact';

function entries<S extends EntrySlug>(r: AdminRepositories, slug: S) {
  return r[slug] as unknown as AdminCollection<EntryTypes[S]>;
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
  const [profile, links] = await Promise.all([r.profile.get(), r.socialLinks.list()]);
  return { draft: singleDraft(slug, profile, links), updatedAt: profile.updatedAt };
}

export async function saveSingle(
  slug: SingleFormSlug,
  draft: Draft,
  expectedUpdatedAt: string | null,
): Promise<LoadedForm> {
  const r = await getAdminRepositories();
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
  const entry = (await entries(r, slug).list()).find((e) => e.id === id);
  return entry ? { draft: entryDraft(slug, entry), updatedAt: entry.updatedAt } : null;
}

export async function createEntry(slug: EntrySlug, draft: Draft) {
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
  const collection = entries(r, slug);
  const original = (await collection.list()).find((e) => e.id === id);
  if (!original) return null;
  assertUnchanged(original.updatedAt, expectedUpdatedAt);
  const saved = await collection.update(id, entryValues(slug, draft, original));
  if (!saved) return null;
  markSiteStale();
  return { id, updatedAt: saved.updatedAt };
}
