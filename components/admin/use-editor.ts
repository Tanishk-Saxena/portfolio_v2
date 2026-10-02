'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type LoadedForm, liveText } from '@/lib/admin/forms';
import {
  type Draft,
  type DraftValue,
  type FieldErrors,
  type FormSlug,
  validate,
} from '@/lib/admin/schema';
import { adminHref, type Section } from '@/lib/admin/sections';
import type { EditorState } from './editor-bar';
import { setUnsaved } from './guarded-link';
import { showToast } from './toast';

const needAttention = (n: number) =>
  n === 1 ? 'One field needs attention' : `${n} fields need attention`;

/**
 * The editor's behaviour (ADMIN-DESIGN-SPEC §7.2–7.3): the draft against the saved record
 * (dirty = any difference), Discard, Save (validate first; nothing is sent while a field is
 * invalid), ⌘S / Ctrl+S, and the unsaved-changes guard. "Saved" means the database has it.
 */
export function useEditor({
  slug,
  section,
  entryId,
  initial,
}: {
  slug: FormSlug;
  section: Section;
  /** null for a single record or a new entry. */
  entryId: string | null;
  initial: LoadedForm;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [saved, setSaved] = useState<Draft>(initial.draft);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const isNew = section.kind === 'collection' && entryId === null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const errors = showErrors ? { ...serverErrors, ...validate(slug, draft) } : {};

  async function save() {
    if (saving) return;
    const found = Object.keys(validate(slug, draft)).length;
    if (found) {
      setShowErrors(true);
      showToast(needAttention(found));
      return;
    }
    setSaving(true);
    const path =
      entryId === null ? `/api/admin/${slug}` : `/api/admin/${slug}/${encodeURIComponent(entryId)}`;
    const response = await fetch(path, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    }).catch(() => null);
    setSaving(false);

    if (response?.status === 422) {
      const { errors: rejected } = (await response.json()) as { errors: FieldErrors };
      setServerErrors(rejected);
      setShowErrors(true);
      showToast(needAttention(Object.keys(rejected).length));
      return;
    }
    if (!response?.ok) {
      showToast('Could not save. Your edits are still here; try again.');
      return;
    }
    const result = (await response.json()) as { id?: string; updatedAt: string | null };
    setSaved(draft);
    setUpdatedAt(result.updatedAt);
    setShowErrors(false);
    setServerErrors({});
    showToast(liveText(slug, draft));
    if (isNew && result.id) {
      setUnsaved(false);
      router.replace(adminHref(section.slug, result.id));
    }
    router.refresh(); // list counts and titles in the shell
  }

  function discard() {
    if (isNew) {
      setUnsaved(false);
      router.push(adminHref(section.slug));
      return;
    }
    setDraft(saved);
    setShowErrors(false);
    setServerErrors({});
  }

  // The guard follows the draft; leaving the editor clears it.
  useEffect(() => setUnsaved(dirty), [dirty]);
  useEffect(() => () => setUnsaved(false), []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // ⌘S / Ctrl+S from anywhere in the editor; the latest save, not the first render's.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const state: EditorState = {
    status: saving ? 'saving' : isNew ? 'new' : dirty ? 'dirty' : 'saved',
    dirty,
    saveLabel: saving ? 'Saving…' : isNew ? 'Create' : 'Save',
    onDiscard: discard,
    onSave: () => void save(),
  };

  return {
    draft,
    setField: (key: string, value: DraftValue) => setDraft((d) => ({ ...d, [key]: value })),
    errors,
    errorCount: Object.keys(errors).length,
    updatedAt,
    isNew,
    state,
  };
}
