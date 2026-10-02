'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { confirmDiscard } from './confirm-dialog';

/*
 * The unsaved-changes guard (ADMIN-DESIGN-SPEC §7.2). The editor reports whether it holds
 * unsaved edits; in-app links and Sign out ask before leaving. Closing the tab uses the
 * browser's own prompt (the editor's `beforeunload`).
 */

let unsaved = false;
export const setUnsaved = (value: boolean) => {
  unsaved = value;
};
export const hasUnsaved = () => unsaved;

/** Runs `leave` now, or after the owner agrees to drop their edits. */
export async function leaveGuarded(leave: () => void) {
  if (unsaved && !(await confirmDiscard())) return;
  unsaved = false;
  leave();
}

/** A `next/link` that asks before leaving unsaved edits. New-tab clicks pass straight through. */
export function GuardedLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const href = String(props.href);
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (!unsaved || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        void leaveGuarded(() => router.push(href));
      }}
    />
  );
}
