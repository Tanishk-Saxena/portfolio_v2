'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { confirmDiscard } from './confirm-dialog';

/*
 * The unsaved-changes guard (ADMIN-DESIGN-SPEC §7.2). The editor reports which fields hold
 * unsaved edits; in-app links and Sign out ask before leaving, naming them. Closing the tab uses the
 * browser's own prompt (the editor's `beforeunload`).
 */

let unsaved: string[] | null = null;
/** The labels of the edited fields, or false when nothing is unsaved. */
export const setUnsaved = (changed: string[] | false) => {
  unsaved = changed || null;
};
export const hasUnsaved = () => unsaved !== null;

/** Runs `leave` now, or after the owner agrees to drop their edits. */
export async function leaveGuarded(leave: () => void) {
  if (unsaved && !(await confirmDiscard(unsaved))) return;
  unsaved = null;
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
