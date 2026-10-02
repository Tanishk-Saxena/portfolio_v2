'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/*
 * The admin's toast (ADMIN-DESIGN-SPEC §5): one at a time, centred at the bottom, an ink
 * pill. `showToast()` from anywhere; the host lives in the signed-in layout. 8.3 adds Undo.
 */

interface ToastMessage {
  id: number;
  text: string;
}

const SHOW_MS = 3000;
let current: ToastMessage | null = null;
const listeners = new Set<() => void>();

export function showToast(text: string) {
  current = { id: (current?.id ?? 0) + 1, text };
  for (const notify of listeners) notify();
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
    const timer = window.setTimeout(() => setExpired(message.id), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  const open = message !== null && expired !== message.id;
  return (
    // The live region is always there, so screen readers hear each new message.
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 flex min-h-11.5 max-w-[calc(100vw-24px)] -translate-x-1/2 items-center rounded-full bg-ink px-4.5 py-1.5 text-meta whitespace-nowrap text-paper shadow-toast transition-[opacity,translate] duration-300 ease-toast motion-reduce:translate-y-0 [:root:has([data-bottom-bar])_&]:@max-wide:mb-19 ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
    >
      {message?.text}
    </div>
  );
}
