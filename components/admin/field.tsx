'use client';

import { useId } from 'react';
import type { DraftValue, FieldDef, ImageValue } from '@/lib/admin/schema';
import { countWords, estimateReadMinutes } from '@/lib/utils/read-time';
import { FileField } from './file-field';
import { MarkdownField } from './markdown-field';
import { SelectPills } from './select-pills';
import { TagsInput } from './tags-input';
import { ToggleSwitch } from './toggle-switch';

/** The input well (ADMIN-DESIGN-SPEC §5): inputs keep the mockup's border + halo focus (Q-A4). */
export const WELL =
  'w-full rounded-row border border-line-input bg-field text-body text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-halo';

const INPUT_TYPE = {
  text: 'text',
  url: 'url',
  email: 'email',
  year: 'text',
  date: 'date',
  minutes: 'text',
} as const;

/**
 * One field, driven by the schema ([F]): label (+ required mark), aside (live count), the
 * control, hint, then the error (`role="alert"`). The range arrives with Settings (8.5).
 */
export function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: DraftValue;
  error?: string;
  onChange: (value: DraftValue) => void;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [field.hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const control = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };

  let aside = '';
  if (field.max && typeof value === 'string') aside = `${value.length} / ${field.max}`;
  if (field.type === 'tags' && Array.isArray(value) && value.length) aside = String(value.length);
  if (field.type === 'markdown' && typeof value === 'string') {
    aside = `${countWords(value)} words · ${estimateReadMinutes(value)} min`;
  }
  if (field.type === 'range') aside = `${String(value)}${field.unit ?? ''}`; // not a length
  const labelId = `${id}-label`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label id={labelId} htmlFor={id} className="text-small font-medium tracking-field">
          {field.label}
          {field.req && (
            <span aria-hidden="true" className="ml-0.75 text-accent">
              *
            </span>
          )}
        </label>
        {aside && <span className="text-label text-muted tabular-nums">{aside}</span>}
      </div>

      {field.type === 'textarea' && (
        <textarea
          {...control}
          rows={field.rows ?? 3}
          required={field.req}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${WELL} resize-y px-3 py-2.75 leading-relaxed`}
        />
      )}
      {field.type in INPUT_TYPE && (
        <input
          {...control}
          type={INPUT_TYPE[field.type as keyof typeof INPUT_TYPE]}
          inputMode={field.type === 'year' || field.type === 'minutes' ? 'numeric' : undefined}
          required={field.req}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${WELL} h-11 px-3`}
        />
      )}
      {field.type === 'toggle' && (
        <ToggleSwitch
          {...control}
          on={value === true}
          text={value === true ? (field.on ?? '') : (field.off ?? '')}
          onToggle={() => onChange(value !== true)}
        />
      )}
      {field.type === 'select' && (
        <SelectPills
          id={id}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          options={field.options ?? []}
          value={String(value)}
          onChange={onChange}
        />
      )}
      {field.type === 'markdown' && (
        <MarkdownField
          {...control}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )}
      {(field.type === 'image' || field.type === 'pdf') && (
        <FileField
          id={id}
          aria-describedby={describedBy}
          kind={field.type}
          value={value as ImageValue | string | null}
          onChange={onChange}
        />
      )}
      {field.type === 'range' && (
        <input
          {...control}
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={String(value)}
          aria-valuetext={`${String(value)}${field.unit ?? ''}`}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full cursor-pointer accent-accent-fill"
        />
      )}
      {field.type === 'tags' && (
        <TagsInput
          {...control}
          tags={Array.isArray(value) ? value : []}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )}

      {field.hint && (
        <p id={hintId} className="text-admin-hint text-muted">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-admin-hint font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
