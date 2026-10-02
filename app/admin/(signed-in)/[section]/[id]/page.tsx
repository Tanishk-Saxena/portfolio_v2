import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Editor } from '@/components/admin/editor';
import {
  duplicateDraft,
  type EntrySlug,
  entryDraft,
  entryTitle,
  type LoadedForm,
} from '@/lib/admin/forms';
import { loadEntry, takenSlugs } from '@/lib/admin/save';
import { findSection } from '@/lib/admin/sections';

type Props = PageProps<'/admin/[section]/[id]'>;

/** The section and the entry's id (null for `new`), or null when there is no such section. */
async function resolve(props: Props) {
  const { section: slug, id } = await props.params;
  const section = findSection(slug);
  if (section?.kind !== 'collection') return null;
  return {
    section,
    slug: section.slug as EntrySlug,
    id: id === 'new' ? null : decodeURIComponent(id),
  };
}

const fromParam = async (props: Props) => {
  const from = (await props.searchParams).from;
  return typeof from === 'string' ? from : undefined;
};

/** The entry's form; for `new`, a blank one, or a copy of `?from=` (Duplicate). */
async function load(slug: EntrySlug, id: string | null, from?: string): Promise<LoadedForm | null> {
  if (id !== null) return loadEntry(slug, id);
  const original = from ? await loadEntry(slug, from) : null;
  const draft = original ? duplicateDraft(slug, original.draft) : entryDraft(slug);
  return { draft, updatedAt: null };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const entry = await resolve(props);
  const form = entry && (await load(entry.slug, entry.id, await fromParam(props)));
  if (!entry || !form) return {};
  return { title: entryTitle(entry.slug, form.draft) || `New ${entry.section.singular}` };
}

/** A collection entry, or a new one (ADMIN-DESIGN-SPEC §6, §7.2). */
export default async function EntryPage(props: Props) {
  const entry = await resolve(props);
  if (!entry) notFound();
  const { section, slug, id } = entry;
  const from = await fromParam(props);
  const [form, taken] = await Promise.all([
    load(slug, id, from),
    slug === 'writing' ? takenSlugs(id) : undefined,
  ]);
  if (!form) notFound();
  return (
    <Editor
      key={id ?? `new:${from ?? ''}`}
      slug={slug}
      section={section}
      entryId={id}
      initial={form}
      takenSlugs={taken}
    />
  );
}
