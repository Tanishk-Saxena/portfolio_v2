'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/domain/types';
import { entryTitle, type EntrySlug, type LoadedForm, settingsDraft } from '@/lib/admin/forms';
import { FIELDS, type FormSlug, isShown } from '@/lib/admin/schema';
import type { Section } from '@/lib/admin/sections';
import { BottomBar } from './bottom-bar';
import { EditorBar } from './editor-bar';
import { Field } from './field';
import { SidePanel } from './side-panel';
import { useEditor } from './use-editor';

/**
 * The editor (ADMIN-DESIGN-SPEC §4.1–4.2, §7.2): the bar, the title, the error summary, the
 * main fields, and the side panel (sticky beside them when wide, under them on phones); the
 * bottom bar on phones.
 */
export function Editor({
  slug,
  section,
  entryId,
  initial,
  takenSlugs,
  full = false,
}: {
  slug: FormSlug;
  section: Section;
  entryId: string | null;
  initial: LoadedForm;
  takenSlugs?: string[];
  /** The list holds its maximum: no Duplicate (§7.1). */
  full?: boolean;
}) {
  const editor = useEditor({ slug, section, entryId, initial, takenSlugs });
  const { draft, errors, summaryCount } = editor;

  // A new entry opens with its first field focused, where a keyboard is at hand (owner, §14).
  const main = useRef<HTMLDivElement>(null);
  const isNew = editor.isNew;
  useEffect(() => {
    if (!isNew || !window.matchMedia('(pointer: fine)').matches) return;
    main.current?.querySelector<HTMLElement>('input, textarea')?.focus();
  }, [isNew]);

  const defaults = slug === 'settings' ? settingsDraft(DEFAULT_SETTINGS) : null;
  const atDefaults = JSON.stringify(defaults) === JSON.stringify(draft);

  const title =
    section.kind === 'collection'
      ? entryTitle(slug as EntrySlug, draft) || `New ${section.singular}`
      : section.label;
  const shown = FIELDS[slug].filter((f) => isShown(f, draft));
  const field = (f: (typeof shown)[number]) => (
    <Field
      key={f.key}
      field={f}
      value={draft[f.key]}
      error={errors[f.key]}
      onChange={(value) => editor.setField(f.key, value)}
    />
  );

  return (
    <>
      <EditorBar section={section} title={title} state={editor.state} />
      <div className="flex max-w-admin-editor flex-wrap items-start gap-admin-gap px-admin-x pt-admin-editor-top pb-30">
        <div ref={main} className="flex max-w-admin-main min-w-0 flex-[1_1_440px] flex-col gap-6.5">
          <h1 className="font-serif text-admin-editor-title text-pretty">{title}</h1>
          {summaryCount > 0 && (
            <div role="alert" className="rounded-row bg-wash-error px-3.5 py-3 text-meta">
              {summaryCount === 1
                ? 'One field needs attention before this can be saved.'
                : `${summaryCount} fields need attention before this can be saved.`}
            </div>
          )}
          {shown.filter((f) => !f.side).map(field)}
        </div>
        <SidePanel
          section={section}
          updatedAt={editor.updatedAt}
          isNew={editor.isNew}
          fields={shown.filter((f) => f.side).map(field)}
          onDuplicate={full ? undefined : editor.duplicate}
          onDelete={() => editor.remove(title)}
          onReset={defaults ? !atDefaults && (() => editor.replace(defaults)) : undefined}
        />
      </div>
      <BottomBar state={editor.state} />
    </>
  );
}
