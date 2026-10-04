'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type LoadedForm, liveText, slugify } from '@/lib/admin/forms';
import {
  type Draft,
  type DraftValue,
  type FieldErrors,
  type FormSlug,
  RECHECKS,
  validate as validateDraft,
} from '@/lib/admin/schema';
import { adminHref, fullMessage, type Section } from '@/lib/admin/sections';
import type { EditorState } from './editor-bar';
import { askConfirm } from './confirm-dialog';
import { leaveGuarded, setUnsaved } from './guarded-link';
import { showToast } from './toast';

const needAttention = (n: number) =>
  n === 1 ? 'One field needs attention' : `${n} fields need attention`;

/**
 * The editor's behaviour (ADMIN-DESIGN-SPEC §7.2–7.3): the draft against the saved record
 * (dirty = any difference), Discard, Save (validate first; nothing is sent while a field is
 * invalid), ⌘S / Ctrl+S, and the unsaved-changes guard. "Saved" means the database has it.
 * A field shows its error as soon as it is edited (§11); Save shows every field's.
 */
export function useEditor({
  slug,
  section,
  entryId,
  initial,
  takenSlugs,
}: {
  slug: FormSlug;
  section: Section;
  /** null for a single record or a new entry. */
  entryId: string | null;
  initial: LoadedForm;
  /** Writing: the other articles' slugs (a slug must be unique). */
  takenSlugs?: string[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [saved, setSaved] = useState<Draft>(initial.draft);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  // §7.2: a new article's slug follows its title until the slug is edited by hand.
  const [slugTouched, setSlugTouched] = useState(slug !== 'writing' || initial.draft.slug !== '');

  const isNew = section.kind === 'collection' && entryId === null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const validate = (d: Draft) => validateDraft(slug, d, { takenSlugs });
  const found = { ...serverErrors, ...validate(draft) };
  const errors = showErrors
    ? found
    : Object.fromEntries(Object.entries(found).filter(([key]) => touched.has(key)));
  // "Publish" when an article is about to go live (§7.2).
  const publishing =
    slug === 'writing' && draft.status === 'published' && saved.status !== 'published';

  function setField(key: string, value: DraftValue) {
    if (key === 'slug') setSlugTouched(true);
    // This field's rule shows from now on; so do rules on filled fields that read this one.
    const rechecked = (RECHECKS[slug]?.[key] ?? []).filter((k) => draft[k] !== '');
    setTouched((t) => new Set([...t, key, ...rechecked]));
    if (serverErrors[key]) {
      setServerErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== key)));
    }
    setDraft((d) => ({
      ...d,
      [key]: value,
      ...(key === 'title' && !slugTouched && { slug: slugify(String(value)) }),
    }));
  }

  async function save() {
    if (saving) return;
    const found = Object.keys(validate(draft)).length;
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
      // The stamp it started from: a save over someone else's newer one is refused (409).
      body: JSON.stringify({ ...draft, updatedAt }),
    }).catch(() => null);
    setSaving(false);

    if (response?.status === 422) {
      const { errors: rejected } = (await response.json()) as { errors: FieldErrors };
      setServerErrors(rejected);
      setShowErrors(true);
      showToast(needAttention(Object.keys(rejected).length));
      return;
    }
    if (response?.status === 409) {
      const { full } = (await response.json().catch(() => ({}))) as { full?: boolean };
      if (full && section.kind === 'collection') {
        showToast(fullMessage(section));
        return;
      }
      showToast('This entry changed on another device — reload'); // the draft stays (Q-A6)
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
    setTouched(new Set());
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
    setTouched(new Set());
    setServerErrors({});
  }

  /** Opens an unsaved copy (§7.2): built on the server from `?from=`, so a reload keeps it. */
  function duplicate() {
    if (entryId === null) return;
    void leaveGuarded(() =>
      router.push(`${adminHref(section.slug, 'new')}?from=${encodeURIComponent(entryId)}`),
    );
  }

  /** Confirm, soft delete, back to the list; the toast offers Undo (§7.2–7.3). */
  async function remove(title: string) {
    if (entryId === null || section.kind !== 'collection') return;
    const sure = await askConfirm({
      title: `Delete this ${section.singular}?`,
      body: `“${title}” will be removed from the site. You can undo straight after.`,
      ok: 'Delete',
      cancel: 'Cancel',
    });
    if (!sure) return;
    const path = `/api/admin/${section.slug}/${encodeURIComponent(entryId)}`;
    const response = await fetch(path, { method: 'DELETE' }).catch(() => null);
    if (!response?.ok) {
      showToast('Could not delete. Try again.');
      return;
    }
    setUnsaved(false);
    router.push(adminHref(section.slug));
    router.refresh();
    showToast('Deleted, removed from the site', {
      undo: async () => {
        const restored = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: section.slug, id: entryId }),
        }).catch(() => null);
        const full = restored?.status === 409 && section.kind === 'collection';
        showToast(restored?.ok ? 'Restored' : full ? fullMessage(section) : 'Could not undo.');
        router.refresh();
      },
    });
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
    saveLabel: saving ? 'Saving…' : isNew ? 'Create' : publishing ? 'Publish' : 'Save',
    onDiscard: discard,
    onSave: () => void save(),
  };

  return {
    draft,
    setField,
    errors,
    /** The summary above the fields counts only after a Save that found errors (§7.2). */
    summaryCount: showErrors ? Object.keys(errors).length : 0,
    updatedAt,
    isNew,
    state,
    duplicate,
    remove: (title: string) => void remove(title),
  };
}
