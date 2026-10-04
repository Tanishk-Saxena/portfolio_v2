'use client';

import { useFormStatus } from 'react-dom';
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
      <Submit className={className} />
    </form>
  );
}

/** Off while the sign-out is on its way, so a second press sends nothing. */
function Submit({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-ripple="press-row"
      className={`w-full cursor-pointer text-left text-muted disabled:cursor-default ${className}`}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
