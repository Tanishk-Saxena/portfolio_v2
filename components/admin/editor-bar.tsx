import Link from 'next/link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { adminHref, type Section } from '@/lib/admin/sections';
import { CIRCLE_BUTTON } from './admin-classes';
import { ChevronLeftIcon } from './admin-icons';
import { SheetButton } from './sheet-button';

/**
 * The editor's sticky bar (ADMIN-DESIGN-SPEC §4.1–4.2). Collections: back + crumb. Single
 * records: the section name, with ≡ on phones (the sheet; there is no list to go back to).
 * The phone header gives way to this bar. 8.2 adds the state pill, Discard and Save.
 */
export function EditorBar({ section, title }: { section: Section; title: string }) {
  const collection = section.kind === 'collection';
  return (
    <div className="sticky top-0 z-5 border-b border-line bg-paper-fade-strong backdrop-blur-bar">
      <div className="flex min-h-admin-editor-bar flex-wrap items-center gap-3 px-admin-x py-2.5">
        <div className="flex min-w-0 flex-[1_1_220px] items-center gap-2">
          {!collection && (
            <span className="@wide:hidden">
              <SheetButton variant="icon" />
            </span>
          )}
          {collection && (
            <>
              <Link
                href={adminHref(section.slug)}
                aria-label="Back to list"
                data-ripple="press-row"
                className={CIRCLE_BUTTON}
              >
                <ChevronLeftIcon />
              </Link>
              <Link
                href={adminHref(section.slug)}
                className="text-meta whitespace-nowrap text-muted hover:text-accent"
              >
                {section.label}
              </Link>
              <span aria-hidden="true" className="text-muted">
                /
              </span>
            </>
          )}
          <span className="truncate text-meta font-medium">
            {collection ? title : section.label}
          </span>
        </div>
        <div className="ml-auto @wide:hidden">
          <ThemeToggle variant="admin" />
        </div>
      </div>
    </div>
  );
}
