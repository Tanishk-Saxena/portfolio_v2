'use client';

import { entryTitle, type EntrySlug, type LoadedForm } from '@/lib/admin/forms';
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
}: {
  slug: FormSlug;
  section: Section;
  entryId: string | null;
  initial: LoadedForm;
}) {
  const editor = useEditor({ slug, section, entryId, initial });
  const { draft, errors, errorCount } = editor;

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
        <div className="flex max-w-admin-main min-w-0 flex-[1_1_440px] flex-col gap-6.5">
          <h1 className="font-serif text-admin-editor-title text-pretty">{title}</h1>
          {errorCount > 0 && (
            <div role="alert" className="rounded-row bg-wash-error px-3.5 py-3 text-meta">
              {errorCount === 1
                ? 'One field needs attention before this can be saved.'
                : `${errorCount} fields need attention before this can be saved.`}
            </div>
          )}
          {shown.filter((f) => !f.side).map(field)}
        </div>
        <SidePanel
          section={section}
          updatedAt={editor.updatedAt}
          isNew={editor.isNew}
          fields={shown.filter((f) => f.side).map(field)}
        />
      </div>
      <BottomBar state={editor.state} />
    </>
  );
}
