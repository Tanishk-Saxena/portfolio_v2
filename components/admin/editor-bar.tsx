'use client';

import { useSyncExternalStore } from 'react';
import { adminHref, type Section } from '@/lib/admin/sections';
import { CIRCLE_BUTTON, FILLED_PILL } from './admin-classes';
import { ChevronLeftIcon } from './admin-icons';
import { GuardedLink } from './guarded-link';
import { type EditorStatus, PhoneBar, StatePill } from './phone-bar';

export interface EditorState {
  /** New · Unsaved changes · Saving… · Saved (§7.2). */
  status: EditorStatus;
  dirty: boolean;
  /** There is something to save and no save in flight (owner, §14). */
  canSave: boolean;
  saveLabel: string;
  onDiscard: () => void;
  onSave: () => void;
}

/** ⌘S on Apple devices, Ctrl+S elsewhere; empty during server render. */
const useSaveHint = () =>
  useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘S' : 'Ctrl+S'),
    () => '',
  );

/**
 * The editor's sticky bar (ADMIN-DESIGN-SPEC §4.1–4.2). Wide: collections get back + crumb,
 * single records the section name; then the state pill, the shortcut hint, Discard and Save.
 * Phones get the one phone bar every admin page uses (`PhoneBar`), with Discard and Save in
 * the bottom bar. Without `state` it only navigates.
 */
export function EditorBar({
  section,
  title,
  state,
}: {
  section: Section;
  title: string;
  state?: EditorState;
}) {
  const collection = section.kind === 'collection';
  const hint = useSaveHint();

  return (
    <>
      <PhoneBar section={section} back={collection} status={state?.status} />
      <div className="sticky top-0 z-5 hidden border-b border-line bg-paper-fade-strong backdrop-blur-bar @wide:block">
        <div className="flex min-h-admin-editor-bar flex-wrap items-center gap-3 px-admin-x py-2.5">
          <div className="flex min-w-0 flex-[1_1_220px] items-center gap-2">
            {collection && (
              <>
                <GuardedLink
                  href={adminHref(section.slug)}
                  aria-label="Back to list"
                  data-ripple="press-row"
                  className={CIRCLE_BUTTON}
                >
                  <ChevronLeftIcon />
                </GuardedLink>
                <GuardedLink
                  href={adminHref(section.slug)}
                  className="text-meta whitespace-nowrap text-muted hover:text-accent"
                >
                  {section.label}
                </GuardedLink>
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              </>
            )}
            <span className="truncate text-meta font-medium">
              {collection ? title : section.label}
            </span>
            {state && <StatePill status={state.status} />}
          </div>
          {state && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-label text-muted">{hint}</span>
              <button
                type="button"
                onClick={state.onDiscard}
                disabled={!state.dirty}
                data-ripple="press-row"
                className="h-10 flex-none cursor-pointer rounded-full border border-line px-4 text-meta whitespace-nowrap transition-opacity duration-200 hover:border-accent disabled:cursor-default disabled:opacity-45 disabled:hover:border-line"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={state.onSave}
                disabled={!state.canSave}
                data-ripple="paper"
                className={`${FILLED_PILL} h-10 disabled:cursor-default disabled:opacity-45`}
              >
                {state.saveLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
