import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorBar } from '@/components/admin/editor-bar';
import { EditorPending } from '@/components/admin/editor-pending';
import { loadAdminContent } from '@/lib/admin/content';
import { toRows } from '@/lib/admin/rows';
import { type CollectionSection, findSection } from '@/lib/admin/sections';

type Props = PageProps<'/admin/[section]/[id]'>;

/** The entry's title, `New {singular}` for `new`, or null when the entry doesn't exist. */
async function resolve(props: Props) {
  const { section: slug, id } = await props.params;
  const section = findSection(slug);
  if (section?.kind !== 'collection') return null;
  if (id === 'new') return { section, title: `New ${section.singular}` };
  const row = toRows(section.slug, await loadAdminContent()).find(
    (r) => r.id === decodeURIComponent(id),
  );
  // Quotes show “…” in the list; the crumb and title drop them, as the mockup does.
  return row ? { section, title: row.title.replace(/^“|”$/g, '') } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const entry = await resolve(props);
  return entry ? { title: entry.title } : {};
}

/** A collection entry, or a new one (ADMIN-DESIGN-SPEC §6). The form arrives in 8.2. */
export default async function EntryPage(props: Props) {
  const entry = await resolve(props);
  if (!entry) notFound();
  const section: CollectionSection = entry.section;
  return (
    <>
      <EditorBar section={section} title={entry.title} />
      <EditorPending title={entry.title} />
    </>
  );
}
