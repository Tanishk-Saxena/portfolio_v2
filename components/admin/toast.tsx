'use client';

import { useSyncExternalStore } from 'react';

/*
 * The admin's toasts (ADMIN-DESIGN-SPEC §5, owner §14): centred at the bottom, stacked with
 * the newest lowest, three at most. Each is a pill in the theme's surface with the accent on
 * its border and its Undo. `showToast()` from anywhere; the host lives in the signed-in
 * layout. With `undo` a toast shows an Undo button and stays 6s instead of 3s.
 */

interface ToastMessage {
  id: number;
  text: string;
  undo?: () => void;
}

const MAX_SHOWN = 3;
const EMPTY: ToastMessage[] = [];

let toasts = EMPTY;
let lastId = 0;
const listeners = new Set<() => void>();

function set(next: ToastMessage[]) {
  toasts = next;
  listeners.forEach((l) => l());
}

const dismiss = (id: number) => set(toasts.filter((t) => t.id !== id));

export function showToast(text: string, options: { undo?: () => void } = {}) {
  const id = ++lastId;
  // The same plain message again replaces the one showing; one with an Undo stays, as each
  // undoes its own action.
  const kept = toasts.filter((t) => t.undo || t.text !== text);
  set([...kept, { id, text, undo: options.undo }].slice(-MAX_SHOWN));
  window.setTimeout(() => dismiss(id), options.undo ? 6000 : 3000);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function ToastHost() {
  const shown = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY,
  );

  return (
    // The live region is always there, so screen readers hear each new message.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 flex-col items-center gap-2 [:root:has([data-bottom-bar])_&]:@max-wide:mb-19"
    >
      {shown.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex min-h-11.5 max-w-full items-center gap-3.5 rounded-full border border-border-control bg-surface py-1.5 pl-4.5 text-meta whitespace-nowrap text-ink shadow-toast transition-[opacity,translate] duration-300 ease-toast motion-reduce:transition-none starting:translate-y-6 starting:opacity-0 ${toast.undo ? 'pr-2' : 'pr-4.5'}`}
        >
          <span className="truncate">{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                dismiss(toast.id); // gone at once, so Undo can't fire twice
                toast.undo?.();
              }}
              className="hit-44 relative h-8 flex-none cursor-pointer rounded-full border border-border-control px-3.5 text-small font-medium text-accent hover:border-accent"
            >
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
