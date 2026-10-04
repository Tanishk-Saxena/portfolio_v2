'use client';

import type { LinkValue } from '@/lib/admin/schema';
import { OUTLINE_PILL } from './admin-classes';
import { GripIcon, SmallCloseIcon } from './admin-icons';
import { WELL } from './field';
import { useDragSort } from './use-drag-sort';

const ARROW =
  'grid h-7.5 w-10 cursor-pointer place-items-center text-muted hover:text-accent disabled:cursor-default disabled:opacity-30 disabled:hover:text-muted @wide:h-7 @wide:w-8';

/**
 * The contact links (owner, ADMIN-DESIGN-SPEC §14): a list of label and URL pairs, in the
 * order the site shows them. Add a row, drag it (or use the arrows) to reorder, × removes.
 * At `max` the Add button goes.
 */
export function LinksField({
  value,
  max = Infinity,
  onChange,
  ...control
}: {
  id: string;
  value: LinkValue[];
  max?: number;
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
      className="flex flex-col gap-2"
    >
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((link, i) => {
            const name = link.label.trim() || `link ${i + 1}`;
            return (
              <li
                key={link.id}
                data-sort-id={link.id}
                className={`flex items-center gap-1 rounded-row border border-line-input bg-field p-2 ${sort.dragging === link.id ? 'relative z-10 shadow-float' : ''}`}
              >
                <span
                  {...sort.handle(link.id)}
                  aria-hidden="true"
                  title="Drag to reorder"
                  className={`flex h-12 w-6 flex-none touch-none items-center justify-center text-muted select-none hover:text-accent ${sort.dragging === link.id ? 'cursor-grabbing text-accent' : 'cursor-grab'}`}
                >
                  <GripIcon />
                </span>
                <div className="flex flex-none flex-col justify-center">
                  <button
                    type="button"
                    aria-label={`Move ${name} up`}
                    disabled={i === 0}
                    onClick={() => move(link.id, i - 1)}
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
                    aria-label={`Move ${name} down`}
                    disabled={i === value.length - 1}
                    onClick={() => move(link.id, i + 1)}
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
                <div className="flex min-w-0 flex-1 flex-col gap-2 @wide:flex-row">
                  <input
                    type="text"
                    aria-label={`Label of link ${i + 1}`}
                    value={link.label}
                    placeholder="Label"
                    onChange={(e) => edit(link.id, { label: e.target.value })}
                    className={`${WELL} h-11 px-3 @wide:w-40 @wide:flex-none`}
                  />
                  <input
                    type="url"
                    aria-label={`URL of ${name}`}
                    value={link.url}
                    placeholder="https://"
                    onChange={(e) => edit(link.id, { url: e.target.value })}
                    className={`${WELL} h-11 min-w-0 px-3 @wide:flex-1`}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() => onChange(value.filter((l) => l.id !== link.id))}
                  className="grid size-11 flex-none cursor-pointer place-items-center rounded-full text-muted hover:text-accent"
                >
                  <SmallCloseIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, { id: crypto.randomUUID(), label: '', url: '' }])}
          className={`${OUTLINE_PILL} cursor-pointer self-start`}
        >
          Add a link
        </button>
      )}
    </div>
  );
}
