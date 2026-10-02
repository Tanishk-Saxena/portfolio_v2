'use client';

import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/site/theme-toggle';
import type { SectionCounts } from '@/lib/admin/sections';
import { CAPS_LABEL, CIRCLE_BUTTON } from './admin-classes';
import { SmallCloseIcon } from './admin-icons';
import { AdminNav } from './admin-nav';
import { SignOutButton } from './sign-out-button';

export const SHEET_ID = 'admin-sections';

/** Opens the sheet from any trigger (header pill, editor bar ≡). */
export function openSheet() {
  (document.getElementById(SHEET_ID) as HTMLDialogElement | null)?.showModal();
}

const FOOT_ROW = 'flex h-13 items-center px-3 text-body-sm';

/**
 * The phones' section switcher (ADMIN-DESIGN-SPEC §4.2): a full-screen modal `<dialog>`, so
 * the browser traps focus, closes it on Escape and returns focus to the trigger (§12).
 */
export function SectionsSheet({ counts }: { counts: SectionCounts }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  // Widening the window past the breakpoint swaps the sheet for the sidebar.
  useEffect(() => {
    const wide = matchMedia('(min-width: 760px)');
    const onChange = () => wide.matches && ref.current?.close();
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, []);

  return (
    <dialog
      ref={ref}
      id={SHEET_ID}
      aria-labelledby={`${SHEET_ID}-title`}
      className="m-0 h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto border-0 bg-paper p-0 text-ink open:flex"
    >
      <div className="sticky top-0 z-1 flex h-admin-bar flex-none items-center justify-between border-b border-line bg-paper pr-2 pl-4">
        <h2 id={`${SHEET_ID}-title`} className={`text-label ${CAPS_LABEL}`}>
          Sections
        </h2>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="admin" />
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            data-ripple="press-row"
            className={CIRCLE_BUTTON}
          >
            <SmallCloseIcon />
          </button>
        </div>
      </div>
      <AdminNav counts={counts} variant="sheet" onNavigate={close} />
      <div className="mt-auto flex flex-col border-t border-line px-2 pt-2 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <a href="/" target="_blank" rel="noreferrer" data-ripple="press-row" className={FOOT_ROW}>
          View site ↗
        </a>
        <SignOutButton className={FOOT_ROW} />
      </div>
    </dialog>
  );
}
