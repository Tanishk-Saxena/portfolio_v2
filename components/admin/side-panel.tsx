'use client';

import { type ReactNode, useSyncExternalStore } from 'react';
import type { Section } from '@/lib/admin/sections';

const LAST_SAVED = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** True once hydrated: the time is shown in the viewer's own zone, never the server's. */
const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * The editor's side panel (ADMIN-DESIGN-SPEC §4.1): the side fields in a box, then View on
 * site, Duplicate and Delete (saved collection entries), and when it was last saved.
 */
export function SidePanel({
  section,
  updatedAt,
  isNew,
  fields,
  onDuplicate,
  onDelete,
}: {
  section: Section;
  updatedAt: string | null;
  isNew: boolean;
  fields: ReactNode[];
  /** Absent when the list is full: a copy would be one too many (§7.1). */
  onDuplicate?: () => void;
  onDelete: () => void;
}) {
  const entry = section.kind === 'collection' && !isNew;
  const hydrated = useHydrated();
  const saved = isNew
    ? 'Not saved yet'
    : updatedAt && hydrated
      ? `Last saved ${LAST_SAVED.format(new Date(updatedAt))}`
      : '';

  return (
    <div className="flex max-w-admin-side min-w-0 flex-[1_1_260px] flex-col gap-4 @wide:sticky @wide:top-admin-sticky">
      {fields.length > 0 && (
        <div className="flex flex-col gap-5 rounded-lg bg-surface p-5">{fields}</div>
      )}
      <div className="flex flex-col gap-0.5 text-meta">
        <a
          href={section.view}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center self-start px-1"
        >
          View on site ↗
        </a>
        {entry && (
          <>
            {onDuplicate && (
              <button
                type="button"
                onClick={onDuplicate}
                className="flex h-10 cursor-pointer items-center self-start px-1 text-left hover:text-accent"
              >
                Duplicate
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 cursor-pointer items-center self-start px-1 text-left font-medium text-accent hover:underline"
            >
              Delete {section.singular}
            </button>
          </>
        )}
        {saved && <span className="px-1 pt-2 text-label text-muted">{saved}</span>}
      </div>
    </div>
  );
}
