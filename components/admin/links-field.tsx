'use client';

import type { LinkValue } from '@/lib/admin/schema';
import { GripIcon, SmallCloseIcon } from './admin-icons';
import { LinkComposer } from './link-composer';
import { useDragSort } from './use-drag-sort';

const ICON_BUTTON =
  'grid size-11 flex-none cursor-pointer place-items-center rounded-full text-muted hover:text-accent disabled:cursor-default disabled:opacity-30 disabled:hover:text-muted';
const INLINE_INPUT =
  'h-11 w-full min-w-0 bg-transparent px-3 text-body text-ink outline-none placeholder:text-muted';

const Chevron = ({ up }: { up?: boolean }) => (
  <svg width="10" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
    <path
      d={up ? 'M1 5.8 5.5 1.4 10 5.8' : 'M1 1.2 5.5 5.6 10 1.2'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * The contact links (owner, ADMIN-DESIGN-SPEC §14): label and URL pairs, in the order the site
 * shows them. Each row is one card (label | URL, stacked on phones); drag the grip or use the
 * arrows to reorder, × removes. New links come through the composer below, complete, so the
 * list never holds an empty one; at `max` the composer goes.
 */
export function LinksField({
  value,
  max = Infinity,
  labelMax,
  onChange,
  ...control
}: {
  id: string;
  value: LinkValue[];
  max?: number;
  labelMax?: number;
  onChange: (value: LinkValue[]) => void;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}) {
  const move = (id: string, to: number) => {
    const next = value.filter((l) => l.id !== id);
    const moved = value.find((l) => l.id === id);
    if (moved) next.splice(to, 0, moved);
    onChange(next);
  };
  const sort = useDragSort(
    value.map((l) => l.id),
    move,
    { axis: 'y' },
  );
  const edit = (id: string, patch: Partial<LinkValue>) =>
    onChange(value.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div
      id={control.id}
      role="group"
      aria-labelledby={control['aria-labelledby']}
      aria-describedby={control['aria-describedby']}
      className="flex flex-col gap-3"
    >
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((link, i) => {
            const name = link.label.trim() || `link ${i + 1}`;
            const dragging = sort.dragging === link.id;
            return (
              <li
                key={link.id}
                data-sort-id={link.id}
                className={`flex items-center rounded-row border border-line-input bg-field pr-1 transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-3 focus-within:ring-halo ${dragging ? 'relative z-10 shadow-float' : ''}`}
              >
                <span
                  {...sort.handle(link.id)}
                  aria-hidden="true"
                  title="Drag to reorder"
                  className={`flex h-11 w-8 flex-none touch-none items-center justify-center text-muted select-none hover:text-accent ${dragging ? 'cursor-grabbing text-accent' : 'cursor-grab'}`}
                >
                  <GripIcon />
                </span>
                <div className="flex min-w-0 flex-1 flex-col divide-y divide-line @wide:flex-row @wide:divide-x @wide:divide-y-0">
                  <input
                    type="text"
                    aria-label={`Label of link ${i + 1}`}
                    value={link.label}
                    placeholder="Label"
                    onChange={(e) => edit(link.id, { label: e.target.value })}
                    className={`${INLINE_INPUT} font-medium @wide:w-44 @wide:flex-none`}
                  />
                  <input
                    type="url"
                    aria-label={`URL of ${name}`}
                    value={link.url}
                    placeholder="https://"
                    onChange={(e) => edit(link.id, { url: e.target.value })}
                    className={`${INLINE_INPUT} text-muted focus:text-ink @wide:flex-1`}
                  />
                </div>
                <div className="flex flex-none flex-col @wide:flex-row">
                  <button
                    type="button"
                    aria-label={`Move ${name} up`}
                    disabled={i === 0}
                    onClick={() => move(link.id, i - 1)}
                    className={ICON_BUTTON}
                  >
                    <Chevron up />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${name} down`}
                    disabled={i === value.length - 1}
                    onClick={() => move(link.id, i + 1)}
                    className={ICON_BUTTON}
                  >
                    <Chevron />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() => onChange(value.filter((l) => l.id !== link.id))}
                  className={ICON_BUTTON}
                >
                  <SmallCloseIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {value.length < max && (
        <LinkComposer max={labelMax} onAdd={(link) => onChange([...value, link])} />
      )}
    </div>
  );
}
