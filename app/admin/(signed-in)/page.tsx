import { signOut } from '@/app/admin/actions';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { getAdmin } from '@/lib/auth/server';

const FOOT_ROW =
  'flex h-10 cursor-pointer items-center rounded-md px-2.5 text-meta transition-colors hover:bg-ink/6';

/**
 * Temporary landing for Phase 7: proves the session, the admin theme key and sign-out. Phase
 * 8.1 replaces it with the shell, and `/admin` then redirects to Writing (Q-A5). Uses the
 * sidebar's header and foot pieces (ADMIN-DESIGN-SPEC §4.1) so nothing here is invented.
 */
export default async function AdminHome() {
  const admin = await getAdmin();
  return (
    <main className="mx-auto flex min-h-svh w-[min(380px,100%)] flex-col justify-center gap-6.5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-1">
          <h1 className="font-script text-admin-mark font-semibold">Tanishk Saxena</h1>
          <p className="text-label tracking-eyebrow text-muted uppercase">Content admin</p>
        </div>
        <ThemeToggle variant="admin" />
      </div>
      <p className="text-muted">Signed in as {admin?.email}. The editor arrives in Phase 8.</p>
      <div className="flex flex-col border-t border-line pt-3">
        <a href="/" target="_blank" rel="noreferrer" className={FOOT_ROW}>
          View site ↗
        </a>
        <form action={signOut}>
          <button type="submit" className={`${FOOT_ROW} w-full text-left text-muted`}>
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
