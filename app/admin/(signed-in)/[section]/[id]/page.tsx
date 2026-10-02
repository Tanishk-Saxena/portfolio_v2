import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Editor } from '@/components/admin/editor';
import { EditorBar } from '@/components/admin/editor-bar';
import { EditorPending } from '@/components/admin/editor-pending';
import { loadAdminContent } from '@/lib/admin/content';
import {
  duplicateDraft,
  type EntrySlug,
  entryDraft,
  entryTitle,
  type LoadedForm,
} from '@/lib/admin/forms';
import { toRows } from '@/lib/admin/rows';
import { loadEntry } from '@/lib/admin/save';
import { isFormSlug } from '@/lib/admin/schema';
import { type CollectionSection, findSection } from '@/lib/admin/sections';

type Props = PageProps<'/admin/[section]/[id]'>;

const isEntrySlug = (slug: string): slug is EntrySlug => isFormSlug(slug);

/** The section and the entry's id (null for `new`), or null when there is no such section. */
async function resolve(props: Props) {
  const { section: slug, id } = await props.params;
  const section = findSection(slug);
  if (section?.kind !== 'collection') return null;
  return { section, id: id === 'new' ? null : decodeURIComponent(id) };
}

/** Projects and Writing get their forms in 8.4; until then, the row's title. */
async function pendingTitle(section: CollectionSection, id: string | null) {
  if (id === null) return `New ${section.singular}`;
  const row = toRows(section.slug, await loadAdminContent()).find((r) => r.id === id);
  return row?.title ?? null;
}

/** The entry's form; for `new`, a blank one, or a copy of `?from=` (Duplicate). */
async function load(section: CollectionSection, id: string | null, from?: string) {
  if (!isEntrySlug(section.slug)) return null;
  if (id !== null) return loadEntry(section.slug, id);
  const original = from ? await loadEntry(section.slug, from) : null;
  const draft = original ? duplicateDraft(section.slug, original.draft) : entryDraft(section.slug);
  return { draft, updatedAt: null } as LoadedForm;
}

const fromParam = async (props: Props) => {
  const from = (await props.searchParams).from;
  return typeof from === 'string' ? from : undefined;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const entry = await resolve(props);
  if (!entry) return {};
  const form = await load(entry.section, entry.id, await fromParam(props));
  const title = form
    ? entryTitle(entry.section.slug as EntrySlug, form.draft) || `New ${entry.section.singular}`
    : await pendingTitle(entry.section, entry.id);
  return title ? { title } : {};
}

/** A collection entry, or a new one (ADMIN-DESIGN-SPEC §6, §7.2). */
export default async function EntryPage(props: Props) {
  const entry = await resolve(props);
  if (!entry) notFound();
  const { section, id } = entry;

  if (isEntrySlug(section.slug)) {
    const from = await fromParam(props);
    const form = await load(section, id, from);
    if (!form) notFound();
    return (
      <Editor
        key={id ?? `new:${from ?? ''}`}
        slug={section.slug}
        section={section}
        entryId={id}
        initial={form}
      />
    );
  }

  const title = await pendingTitle(section, id);
  if (!title) notFound();
  return (
    <>
      <EditorBar section={section} title={title} />
      <EditorPending title={title} />
    </>
  );
}
