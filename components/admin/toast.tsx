'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/*
 * The admin's toast (ADMIN-DESIGN-SPEC §5): one at a time, centred at the bottom, an ink
 * pill. `showToast()` from anywhere; the host lives in the signed-in layout. With `undo`
 * it shows an Undo button and stays 6s instead of 3s.
 */

interface ToastMessage {
  id: number;
  text: string;
  undo?: () => void;
}

let current: ToastMessage | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function showToast(text: string, options: { undo?: () => void } = {}) {
  current = { id: (current?.id ?? 0) + 1, text, undo: options.undo };
  notify();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function ToastHost() {
  const message = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  const [expired, setExpired] = useState<number | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setExpired(message.id), message.undo ? 6000 : 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const open = message !== null && expired !== message.id;
  return (
    // The live region is always there, so screen readers hear each new message.
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex min-h-11.5 max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3.5 rounded-full bg-ink py-1.5 pl-4.5 text-meta whitespace-nowrap text-paper shadow-toast transition-[opacity,translate] duration-300 ease-toast motion-reduce:translate-y-0 [:root:has([data-bottom-bar])_&]:@max-wide:mb-19 ${message?.undo ? 'pr-2' : 'pr-4.5'} ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
    >
      <span className="truncate">{message?.text}</span>
      {open && message?.undo && (
        <button
          type="button"
          onClick={() => {
            setExpired(message.id);
            message.undo?.();
          }}
          className="hit-44 relative h-8 flex-none cursor-pointer rounded-full border border-paper/40 px-3.5 text-small font-medium text-paper hover:border-paper"
        >
          Undo
        </button>
      )}
    </div>
  );
}
