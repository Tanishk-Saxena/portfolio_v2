'use client';

import { signOut } from '@/app/admin/actions';
import { hasUnsaved, leaveGuarded } from './guarded-link';

/**
 * Sign out as a plain form post (works before hydration), from the sidebar and the sheet.
 * Once hydrated, unsaved edits are confirmed first (§7.2).
 */
export function SignOutButton({ className }: { className: string }) {
  return (
    <form
      action={signOut}
      onSubmit={(e) => {
        if (!hasUnsaved()) return;
        const form = e.currentTarget;
        e.preventDefault();
        void leaveGuarded(() => form.requestSubmit()); // the guard is clear on the resubmit
      }}
    >
      <button
        type="submit"
        data-ripple="press-row"
        className={`w-full cursor-pointer text-left text-muted ${className}`}
      >
        Sign out
      </button>
    </form>
  );
}
