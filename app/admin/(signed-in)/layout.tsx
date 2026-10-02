import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SectionsSheet } from '@/components/admin/sections-sheet';
import { countsOf, loadAdminContent } from '@/lib/admin/content';
import { SIGN_IN_PATH } from '@/lib/auth/gate';
import { getAdmin } from '@/lib/auth/server';

/**
 * Every admin page but sign-in. The proxy only checks for a session; this checks it with
 * Supabase Auth and the allowlist. RLS still guards every query underneath. Then the shell:
 * the sidebar (wide) or the Sections sheet (phones) beside the page (ADMIN-DESIGN-SPEC §4).
 */
export default async function SignedInLayout({ children }: LayoutProps<'/admin'>) {
  // Both at once: each is a round trip, and the reads run under RLS whoever asks, so starting
  // them before the allowlist answers exposes nothing. Nothing renders unless it says yes.
  const [admin, content] = await Promise.all([getAdmin(), loadAdminContent()]);
  if (!admin) redirect(SIGN_IN_PATH);
  const counts = countsOf(content);
  return (
    <div className="flex min-h-svh">
      <AdminSidebar counts={counts} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <SectionsSheet counts={counts} />
    </div>
  );
}
