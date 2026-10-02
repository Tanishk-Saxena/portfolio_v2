'use client';

import { useSyncExternalStore } from 'react';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { adminHref, type Section } from '@/lib/admin/sections';
import { CIRCLE_BUTTON, FILLED_PILL } from './admin-classes';
import { ChevronLeftIcon } from './admin-icons';
import { GuardedLink } from './guarded-link';
import { SheetButton } from './sheet-button';

export interface EditorState {
  /** New · Unsaved changes · Saving… · Saved (§7.2). */
  status: 'new' | 'dirty' | 'saving' | 'saved';
  dirty: boolean;
  saveLabel: string;
  onDiscard: () => void;
  onSave: () => void;
}

const PILL: Record<EditorState['status'], [wide: string, phone: string]> = {
  new: ['New', 'New'],
  dirty: ['Unsaved changes', 'Unsaved'],
  saving: ['Saving…', 'Saving…'],
  saved: ['Saved', 'Saved'],
};

/** ⌘S on Apple devices, Ctrl+S elsewhere; empty during server render. */
const useSaveHint = () =>
  useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘S' : 'Ctrl+S'),
    () => '',
  );

/**
 * The editor's sticky bar (ADMIN-DESIGN-SPEC §4.1–4.2). Collections: back + crumb. Single
 * records: the section name, with ≡ on phones. Wide adds the shortcut hint, Discard and
 * Save; phones get them in the bottom bar. Without `state` it only navigates.
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
  const accent = state && (state.status === 'new' || state.status === 'dirty');

  return (
    <div className="sticky top-0 z-5 border-b border-line bg-paper-fade-strong backdrop-blur-bar">
      <div className="flex min-h-admin-editor-bar flex-wrap items-center gap-3 px-admin-x py-2.5">
        <div className="flex min-w-0 flex-[1_1_220px] items-center gap-2">
          {!collection && (
            <span className="@wide:hidden">
              <SheetButton variant="icon" />
            </span>
          )}
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
          {state && (
            <span
              className={`flex-none rounded-full px-2.25 py-0.75 text-label font-medium transition-colors duration-200 ${accent ? 'bg-wash-accent text-accent' : 'text-muted'}`}
            >
              <span className="hidden @wide:inline">{PILL[state.status][0]}</span>
              <span className="@wide:hidden">{PILL[state.status][1]}</span>
            </span>
          )}
        </div>
        <div className="ml-auto @wide:hidden">
          <ThemeToggle variant="admin" />
        </div>
        {state && (
          <div className="ml-auto hidden items-center gap-2 @wide:flex">
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
              disabled={state.status === 'saving'}
              data-ripple="paper"
              className={`${FILLED_PILL} h-10 disabled:cursor-default`}
            >
              {state.saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
