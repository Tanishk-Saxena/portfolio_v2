import { ThemeToggle } from '@/components/site/theme-toggle';
import { SheetButton } from './sheet-button';

/** The phones' header on list pages (ADMIN-DESIGN-SPEC §4.2). Editors use their own bar. */
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-6 flex h-admin-bar items-center justify-between gap-3 border-b border-line bg-paper-fade-strong pr-2 pl-4 backdrop-blur-bar @wide:hidden">
      <span className="font-script text-admin-mark-sm font-semibold">Tanishk Saxena</span>
      <div className="flex items-center gap-2">
        <ThemeToggle variant="admin" />
        <SheetButton variant="pill" />
      </div>
    </header>
  );
}
