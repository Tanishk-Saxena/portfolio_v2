import Link from 'next/link';
import type { ListRow } from '@/lib/admin/rows';
import { adminHref, type CollectionSection } from '@/lib/admin/sections';
import { ChevronRightIcon } from './admin-icons';

/**
 * One list row (ADMIN-DESIGN-SPEC §4.1–4.2): title (2-line clamp), sub, meta; wide puts the
 * meta and a chevron on the right, phones put the meta under the title. The status pill sits
 * outside the link; it becomes the quick toggle in 8.3.
 */
export function ListRowItem({ section, row }: { section: CollectionSection; row: ListRow }) {
  return (
    <div className="flex items-stretch border-b border-line">
      <Link
        href={adminHref(section.slug, row.id)}
        data-ripple="press-row"
        className="flex min-w-0 flex-1 items-center gap-3 px-2.5 py-4.5 transition-colors duration-150 hover:bg-hover-row hover:text-ink @wide:gap-5"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.75">
          <span className="line-clamp-2 font-serif text-list-serif text-pretty">{row.title}</span>
          <span className="truncate text-small text-muted">{row.sub}</span>
          {row.meta && (
            <span className="text-admin-meta text-muted tabular-nums @wide:hidden">{row.meta}</span>
          )}
        </span>
        {row.meta && (
          <span className="hidden text-small whitespace-nowrap text-muted tabular-nums @wide:inline">
            {row.meta}
          </span>
        )}
        <ChevronRightIcon className="hidden flex-none text-muted @wide:block" />
      </Link>
      {row.status && (
        <div className="flex flex-none items-center pl-1.5">
          <span
            className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-full border px-2.5 text-admin-meta font-medium ${row.status.live ? 'border-transparent bg-wash-accent text-accent' : 'border-line text-muted'}`}
          >
            {row.status.label}
          </span>
        </div>
      )}
    </div>
  );
}
