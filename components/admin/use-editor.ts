'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type EntrySlug, entryDraft, type LoadedForm, liveText, slugify } from '@/lib/admin/forms';
import {
  type Draft,
  type DraftValue,
  type FieldErrors,
  FIELDS,
  type FormSlug,
  RECHECKS,
  validate as validateDraft,
} from '@/lib/admin/schema';
import { adminHref, fullMessage, type Section } from '@/lib/admin/sections';
import type { EditorState } from './editor-bar';
import { deleteEntry } from './delete-entry';
import { leaveGuarded, setUnsaved } from './guarded-link';
import { showToast } from './toast';

const needAttention = (n: number) =>
  n === 1 ? 'One field needs attention' : `${n} fields need attention`;

/**
 * The editor's behaviour (ADMIN-DESIGN-SPEC §7.2–7.3): the draft against the saved record
 * (dirty = any difference), Discard, Save (validate first; nothing is sent while a field is
 * invalid), ⌘S / Ctrl+S, and the unsaved-changes guard. "Saved" means the database has it.
 * A field shows its error as soon as it is edited (§11); Save shows every field's. Save is
 * off while there is nothing to save, and one save runs at a time.
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
  const isNew = section.kind === 'collection' && entryId === null;
  const [draft, setDraft] = useState<Draft>(initial.draft);
  // A new entry is measured against a blank one, so a Duplicate's copy counts as unsaved.
  const [saved, setSaved] = useState<Draft>(() =>
    isNew ? entryDraft(slug as EntrySlug) : initial.draft,
  );
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false); // the lock: state lags a second press in the same frame
  // §7.2: a new article's slug follows its title until the slug is edited by hand.
  const [slugTouched, setSlugTouched] = useState(slug !== 'writing' || initial.draft.slug !== '');

  const changed = FIELDS[slug]
    .filter((f) => JSON.stringify(draft[f.key]) !== JSON.stringify(saved[f.key]))
    .map((f) => f.label);
  const changedKey = changed.join('\n');
  const dirty = changed.length > 0;
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
    if (inFlight.current || !dirty) return;
    const found = Object.keys(validate(draft)).length;
    if (found) {
      setShowErrors(true);
      showToast(needAttention(found));
      return;
    }
    inFlight.current = true;
    setSaving(true);
    const path =
      entryId === null ? `/api/admin/${slug}` : `/api/admin/${slug}/${encodeURIComponent(entryId)}`;
    const response = await fetch(path, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // The stamp it started from: a save over someone else's newer one is refused (409).
      body: JSON.stringify({ ...draft, updatedAt }),
    }).catch(() => null);
    inFlight.current = false;
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

  /** Sets every field at once (Settings' Reset to defaults); Save still has to follow. */
  function replace(next: Draft) {
    setDraft(next);
    setTouched(new Set(Object.keys(next)));
  }

  /** Confirm, soft delete, back to the list; the toast offers Undo (§7.2–7.3). */
  async function remove(title: string) {
    if (entryId === null || section.kind !== 'collection') return;
    if (!(await deleteEntry(section, entryId, title, () => router.refresh()))) return;
    setUnsaved(false);
    router.push(adminHref(section.slug));
  }

  // The guard follows the draft; leaving the editor clears it.
  useEffect(() => setUnsaved(changedKey ? changedKey.split('\n') : false), [changedKey]);
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
    canSave: dirty && !saving,
    saveLabel: saving ? 'Saving…' : isNew ? 'Create' : publishing ? 'Publish' : 'Save',
    onDiscard: discard,
    onSave: () => void save(),
  };

  return {
    draft,
    setField,
    replace,
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
