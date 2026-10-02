import { signOut } from '@/app/admin/actions';

/** Sign out as a plain form post: works before hydration, from the sidebar and the sheet. */
export function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOut}>
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
