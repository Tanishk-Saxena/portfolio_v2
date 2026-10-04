'use client';

import { useState } from 'react';
import { filterRows, type ListRow } from '@/lib/admin/rows';
import type { CollectionSection, ListFilter } from '@/lib/admin/sections';
import { SearchIcon } from './admin-icons';
import { ListRowItem } from './list-row';
import { useDragSort } from './use-drag-sort';
import { useListActions } from './use-list-actions';

/**
 * Search, filters and rows of a collection (ADMIN-DESIGN-SPEC §4.1, §7.1), with the quick
 * status toggle, Delete and, on ordered lists, ↑/↓ and a drag handle while no search or filter
 * narrows them.
 */
export function AdminList({
  section,
  rows: serverRows,
}: {
  section: CollectionSection;
  rows: ListRow[];
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ListFilter>('All');
  const { rows, move, moveTo, toggle, remove } = useListActions(section, serverRows);
  const sort = useDragSort(
    rows.map((r) => r.id),
    moveTo,
    'y',
  );
  const shown = filterRows(rows, query, filter);
  const narrowed = query.trim() !== '' || filter !== 'All';
  const reorder = section.ordered && !narrowed;
  const label = section.label.toLowerCase();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative flex flex-[1_1_240px] items-center">
          <SearchIcon className="absolute left-3.25 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label}`}
            aria-label={`Search ${label}`}
            className="h-10.5 w-full rounded-full border border-line-input bg-field pr-3 pl-9 text-body text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-halo @wide:text-meta"
          />
        </label>
        {section.filters && (
          <div
            role="tablist"
            aria-label="Filter"
            className="flex gap-0.5 rounded-full border border-line p-0.75"
          >
            {section.filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={f === filter}
                onClick={() => setFilter(f)}
                data-ripple="press-row"
                className="hit-44 relative h-8 flex-none cursor-pointer rounded-full px-3.5 text-admin-pill whitespace-nowrap text-ink transition-colors duration-150 aria-selected:bg-ink aria-selected:text-paper"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col border-t border-line">
        {shown.map((row, i) => (
          <ListRowItem
            key={row.id}
            section={section}
            row={row}
            onToggle={() => toggle(row)}
            onDelete={() => remove(row)}
            move={
              reorder
                ? {
                    up: i > 0 && (() => move(row.id, -1)),
                    down: i < shown.length - 1 && (() => move(row.id, 1)),
                    grip: sort.handle(row.id),
                    dragging: sort.dragging === row.id,
                  }
                : undefined
            }
          />
        ))}
        {shown.length === 0 && (
          <div className="flex flex-col items-start gap-3 py-12">
            <p className="font-serif text-admin-sheet">
              {rows.length ? 'Nothing matches' : `No ${label} yet`}
            </p>
            <p className="text-meta text-muted">
              {rows.length
                ? 'Try a different search or filter.'
                : `Create the first ${section.singular} to show this section on the site.`}
            </p>
          </div>
        )}
      </div>
      {section.ordered && narrowed && (
        <p className="text-small text-muted">Clear the search and filter to reorder.</p>
      )}
    </>
  );
}
