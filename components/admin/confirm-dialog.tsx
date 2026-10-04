'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { FILLED_PILL } from './admin-classes';

/*
 * The admin's confirm (ADMIN-DESIGN-SPEC §5): a native modal `<dialog>` with
 * `role="alertdialog"`, so the browser traps focus and returns it on close (§12). Escape and
 * a click on the overlay cancel. `askConfirm()` from anywhere resolves true on OK. It opens
 * with the focus on its primary action (owner, §14), so Enter confirms.
 */

export interface ConfirmOptions {
  title: string;
  body: string;
  /** Listed under the body: the fields a Discard would lose. */
  details?: string[];
  ok: string;
  cancel: string;
}

let pending: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function askConfirm(options: ConfirmOptions): Promise<boolean> {
  pending?.resolve(false);
  return new Promise((resolve) => {
    pending = { ...options, resolve };
    notify();
  });
}

/** §7.2: leaving an entry with unsaved edits; `changed` names the edited fields. */
export const confirmDiscard = (changed: string[] = []) =>
  askConfirm({
    title: 'Discard unsaved changes?',
    body: 'Your edits to this entry have not been saved and will be lost.',
    details: changed,
    ok: 'Discard',
    cancel: 'Keep editing',
  });

function settle(ok: boolean) {
  pending?.resolve(ok);
  pending = null;
  notify();
}

export function ConfirmHost() {
  const ref = useRef<HTMLDialogElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const request = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => pending,
    () => null,
  );

  useEffect(() => {
    const dialog = ref.current;
    if (request && !dialog?.open) {
      dialog?.showModal();
      primary.current?.focus();
    }
    if (!request && dialog?.open) dialog.close();
  }, [request]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
      onCancel={() => settle(false)} // Escape
      onClick={(e) => e.target === e.currentTarget && settle(false)} // the overlay
      className="m-auto w-[min(var(--spacing-admin-confirm),calc(100%-32px))] rounded-card border-0 bg-paper p-0 text-ink shadow-dialog backdrop:bg-scrim-confirm backdrop:backdrop-blur-scrim"
    >
      {request && (
        <div className="flex flex-col gap-3 p-6.5">
          <h2 id="confirm-title" className="font-serif text-admin-confirm">
            {request.title}
          </h2>
          <p id="confirm-body" className="text-admin-nav text-muted">
            {request.body}
          </p>
          {request.details && request.details.length > 0 && (
            <div className="flex flex-col gap-1 text-meta">
              <p className="text-label tracking-eyebrow text-muted uppercase">Changed</p>
              <ul className="flex max-h-40 list-disc flex-col gap-0.5 overflow-y-auto pl-5">
                {request.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => settle(false)}
              data-ripple="press-row"
              className="h-10.5 cursor-pointer rounded-full border border-line px-4.5 text-meta hover:border-accent"
            >
              {request.cancel}
            </button>
            <button
              ref={primary}
              type="button"
              onClick={() => settle(true)}
              data-ripple="paper"
              className={`${FILLED_PILL} h-10.5`}
            >
              {request.ok}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
