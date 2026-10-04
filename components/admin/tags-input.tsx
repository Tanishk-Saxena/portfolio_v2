'use client';

import { useState } from 'react';
import { SmallCloseIcon } from './admin-icons';
import { useDragSort } from './use-drag-sort';

/**
 * The schema's tag box (ADMIN-DESIGN-SPEC §5): chips with a remove ×, then an inline input.
 * Enter, comma or blur adds; Backspace on an empty input removes the last; duplicates are
 * ignored. At `max` the input stops taking more. Chips drag to a new place (owner, §14).
 */
export function TagsInput({
  tags,
  max = Infinity,
  placeholder,
  onChange,
  ...control
}: {
  id: string;
  tags: string[];
  max?: number;
  placeholder?: string;
  onChange: (tags: string[]) => void;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}) {
  const [text, setText] = useState('');
  const full = tags.length >= max;
  // Tags are unique, so each is its own id.
  const sort = useDragSort(tags, (tag, to) => {
    const next = tags.filter((t) => t !== tag);
    next.splice(to, 0, tag);
    onChange(next);
  });

  function add() {
    const tag = text.trim().replace(/,$/, '').trim();
    if (tag && !full && !tags.includes(tag)) onChange([...tags, tag]);
    setText('');
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-row border border-line-input bg-field p-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-3 focus-within:ring-halo">
      {tags.map((tag, i) => (
        <span
          key={tag}
          data-sort-id={tag}
          className={`inline-flex h-7.5 items-center gap-0.5 rounded-full pr-1 text-admin-pill ${sort.dragging === tag ? 'relative z-10 bg-surface shadow-float outline-1 outline-accent' : 'bg-wash-accent'}`}
        >
          <span
            {...sort.handle(tag)}
            title="Drag to reorder"
            className={`flex h-full touch-none items-center pl-2.75 select-none ${sort.dragging === tag ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {tag}
          </span>
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="hit-44 relative grid size-6 cursor-pointer place-items-center rounded-full text-muted hover:text-accent"
          >
            <SmallCloseIcon width={10} height={10} />
          </button>
        </span>
      ))}
      <input
        {...control}
        value={text}
        readOnly={full}
        placeholder={full ? `${max} at most: remove one to add another` : placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !text && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        className="h-7.5 min-w-30 flex-1 bg-transparent px-1.5 text-body text-ink outline-none placeholder:text-muted"
      />
    </div>
  );
}
