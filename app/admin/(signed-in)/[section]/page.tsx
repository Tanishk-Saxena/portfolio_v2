import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FILLED_PILL, OUTLINE_PILL } from '@/components/admin/admin-classes';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminList } from '@/components/admin/admin-list';
import { Editor } from '@/components/admin/editor';
import { EditorBar } from '@/components/admin/editor-bar';
import { EditorPending } from '@/components/admin/editor-pending';
import { loadAdminContent } from '@/lib/admin/content';
import { countLine, toRows } from '@/lib/admin/rows';
import { loadSingle } from '@/lib/admin/save';
import { isFormSlug } from '@/lib/admin/schema';
import { adminHref, findSection } from '@/lib/admin/sections';

export async function generateMetadata(props: PageProps<'/admin/[section]'>): Promise<Metadata> {
  const section = findSection((await props.params).section);
  return section ? { title: section.label } : {};
}

/**
 * A section: a collection's list, or a single record's form (ADMIN-DESIGN-SPEC §6, §7.1).
 * Settings arrives in 8.5.
 */
export default async function SectionPage(props: PageProps<'/admin/[section]'>) {
  const section = findSection((await props.params).section);
  if (!section) notFound();

  if (section.kind === 'single' && section.slug !== 'settings' && isFormSlug(section.slug)) {
    return (
      <Editor
        key={section.slug}
        slug={section.slug}
        section={section}
        entryId={null}
        initial={await loadSingle(section.slug)}
      />
    );
  }
  if (section.kind === 'single') {
    // Settings arrives in 8.5.
    return (
      <>
        <EditorBar section={section} title={section.label} />
        <EditorPending title={section.label} />
      </>
    );
  }

  const rows = toRows(section.slug, await loadAdminContent());
  const atMax = section.max !== undefined && rows.length >= section.max;

  return (
    <>
      <AdminHeader />
      <div className="flex w-[min(var(--width-admin-list),100%)] flex-col gap-5.5 px-admin-x pt-admin-top pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-admin-title">{section.label}</h1>
            <p className="text-small text-muted">{countLine(section, rows.length)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={section.view} target="_blank" rel="noreferrer" className={OUTLINE_PILL}>
              View on site ↗
            </a>
            {atMax ? (
              <button type="button" disabled className={`${FILLED_PILL} cursor-default opacity-45`}>
                <span aria-hidden="true" className="text-lg leading-0">
                  +
                </span>
                New {section.singular}
              </button>
            ) : (
              <Link
                href={adminHref(section.slug, 'new')}
                data-ripple="paper"
                className={FILLED_PILL}
              >
                <span aria-hidden="true" className="text-lg leading-0">
                  +
                </span>
                New {section.singular}
              </Link>
            )}
          </div>
        </div>
        <AdminList section={section} rows={rows} />
        {atMax && (
          <p className="text-small text-muted">
            The skills grid holds {section.max} columns. Delete one to add another.
          </p>
        )}
      </div>
    </>
  );
}
