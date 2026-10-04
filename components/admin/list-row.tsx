import Link from 'next/link';
import type { HTMLAttributes } from 'react';
import { hasStatus, type ListRow, toggleLabel } from '@/lib/admin/rows';
import { adminHref, type CollectionSection } from '@/lib/admin/sections';
import { ChevronRightIcon, GripIcon, TrashIcon } from './admin-icons';

const ARROW =
  'grid h-7.5 w-10 cursor-pointer place-items-center text-muted hover:text-accent disabled:cursor-default disabled:opacity-30 disabled:hover:text-muted @wide:h-7 @wide:w-8';

/**
 * One list row (ADMIN-DESIGN-SPEC §4.1–4.2): a drag handle and ↑/↓ on ordered lists, then the link (title with
 * a 2-line clamp, sub, meta; wide puts the meta and a chevron on the right, phones put the
 * meta under the title), then the status pill, which is the quick toggle, then Delete.
 */
export function ListRowItem({
  section,
  row,
  move,
  onToggle,
  onDelete,
}: {
  section: CollectionSection;
  row: ListRow;
  /** Present while the list can be reordered; false = that way is the end. */
  move?: {
    up: false | (() => void);
    down: false | (() => void);
    /** Pointer handlers for the drag handle, and whether this row is the one held. */
    grip: HTMLAttributes<HTMLElement>;
    dragging: boolean;
  };
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      data-sort-id={row.id}
      // In hand: lifted off the page, above its neighbours.
      className={`flex items-stretch border-b border-line ${move?.dragging ? 'relative z-10 rounded-row border-transparent bg-surface shadow-float' : ''}`}
    >
      {move && (
        // Pointer only: keyboards and screen readers reorder with the arrows beside it.
        <span
          {...move.grip}
          aria-hidden="true"
          title="Drag to reorder"
          className={`flex w-7 flex-none touch-none items-center justify-center text-muted select-none hover:text-accent ${move.dragging ? 'cursor-grabbing text-accent' : 'cursor-grab'}`}
        >
          <GripIcon />
        </span>
      )}
      {move && (
        <div className="flex flex-none flex-col justify-center pr-1">
          <button
            type="button"
            aria-label={`Move ${row.title} up`}
            disabled={!move.up}
            onClick={move.up || undefined}
            className={ARROW}
          >
            <svg width="10" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
              <path
                d="M1 5.8 5.5 1.4 10 5.8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Move ${row.title} down`}
            disabled={!move.down}
            onClick={move.down || undefined}
            className={ARROW}
          >
            <svg width="10" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
              <path
                d="M1 1.2 5.5 5.6 10 1.2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
      <Link
        href={adminHref(section.slug, row.id)}
        data-ripple="press-row"
        className={`flex min-w-0 flex-1 items-center gap-3 py-4.5 transition-colors duration-150 hover:bg-hover-row hover:text-ink @wide:gap-5 ${move ? 'px-2' : 'px-2.5'}`}
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
      {row.status && hasStatus(section.slug) && (
        <div className="flex flex-none items-center pl-1.5">
          <button
            type="button"
            onClick={onToggle}
            // The name starts with the visible status (WCAG 2.5.3), then says what pressing does.
            aria-label={`${row.status.label}. ${toggleLabel(section.slug, row.status.live)}: ${row.title}`}
            title={toggleLabel(section.slug, row.status.live)}
            data-ripple="press-row"
            className={`inline-flex min-h-9 min-w-11 cursor-pointer items-center justify-center rounded-full border px-2.5 text-admin-meta font-medium transition-colors duration-150 hover:border-accent ${row.status.live ? 'border-transparent bg-wash-accent text-accent' : 'border-line text-muted'}`}
          >
            {row.status.label}
          </button>
        </div>
      )}
      <div className="flex flex-none items-center pl-1">
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${section.singular}: ${row.title}`}
          title={`Delete ${section.singular}`}
          className="hit-44 relative grid size-9 cursor-pointer place-items-center rounded-full text-muted transition-colors duration-150 hover:text-accent"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
