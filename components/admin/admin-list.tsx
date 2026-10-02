'use client';

import { useState } from 'react';
import { filterRows, type ListRow } from '@/lib/admin/rows';
import type { CollectionSection, ListFilter } from '@/lib/admin/sections';
import { SearchIcon } from './admin-icons';
import { ListRowItem } from './list-row';

/**
 * Search, filters and rows of a collection (ADMIN-DESIGN-SPEC §4.1, §7.1). Read-only in
 * 8.1: reorder arrows and the quick status toggle arrive in 8.3.
 */
export function AdminList({ section, rows }: { section: CollectionSection; rows: ListRow[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ListFilter>('All');
  const shown = filterRows(rows, query, filter);
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
        {shown.map((row) => (
          <ListRowItem key={row.id} section={section} row={row} />
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
    </>
  );
}
