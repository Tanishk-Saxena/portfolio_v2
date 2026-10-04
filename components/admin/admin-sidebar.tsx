import { ThemeToggle } from '@/components/site/theme-toggle';
import { siteName } from '@/lib/admin/content';
import type { SectionCounts } from '@/lib/admin/sections';
import { CAPS_LABEL } from './admin-classes';
import { AdminNav } from './admin-nav';
import { SignOutButton } from './sign-out-button';

const FOOT_ROW = 'flex h-10 items-center rounded-row px-2.5 text-meta hover:bg-hover-nav';

/** The wide layout's sidebar (ADMIN-DESIGN-SPEC §4.1): name, theme, sections, View site, Sign out. */
export async function AdminSidebar({ counts }: { counts: SectionCounts }) {
  return (
    <aside className="sticky top-0 hidden h-svh w-admin-sidebar flex-none flex-col gap-6.5 overflow-y-auto border-r border-line px-3.5 pt-6.5 pb-4.5 @wide:flex">
      <div className="flex items-start justify-between gap-2 pl-2.5">
        <div className="flex min-w-0 flex-col gap-0.75">
          <span className="font-script text-admin-mark-sm font-semibold whitespace-nowrap">
            {await siteName()}
          </span>
          <span className={`text-micro ${CAPS_LABEL}`}>Content admin</span>
        </div>
        <ThemeToggle variant="admin" small />
      </div>
      <AdminNav counts={counts} variant="sidebar" />
      <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3.5">
        <a href="/" target="_blank" rel="noreferrer" data-ripple="press-row" className={FOOT_ROW}>
          View site ↗
        </a>
        <SignOutButton className={FOOT_ROW} />
      </div>
    </aside>
  );
}
