'use client';

import { ThemeToggle } from '@/components/site/theme-toggle';
import { adminHref, type Section } from '@/lib/admin/sections';
import { CIRCLE_BUTTON } from './admin-classes';
import { ChevronLeftIcon } from './admin-icons';
import { GuardedLink } from './guarded-link';
import { SheetButton } from './sheet-button';

export type EditorStatus = 'new' | 'dirty' | 'saving' | 'saved';

const PILL: Record<EditorStatus, [wide: string, phone: string]> = {
  new: ['New', 'New'],
  dirty: ['Unsaved changes', 'Unsaved'],
  saving: ['Saving…', 'Saving…'],
  saved: ['Saved', 'Saved'],
};

/** New · Unsaved changes · Saving… · Saved (ADMIN-DESIGN-SPEC §7.2); accent while unsaved. */
export function StatePill({ status, short = false }: { status: EditorStatus; short?: boolean }) {
  const accent = status === 'new' || status === 'dirty';
  return (
    <span
      className={`flex-none rounded-full px-2.25 py-0.75 text-label font-medium transition-colors duration-200 ${accent ? 'bg-wash-accent text-accent' : 'text-muted'}`}
    >
      {PILL[status][short ? 1 : 0]}
    </span>
  );
}

/**
 * The one top bar on phones (owner, ADMIN-DESIGN-SPEC §14), the same on every page: 60px,
 * the page's side padding; at the left, back (inside an entry only), the section's name and,
 * in an editor, its state; at the right, the theme toggle and ≡. Hidden when wide, where the
 * sidebar and the editor bar take over.
 */
export function PhoneBar({
  section,
  back = false,
  status,
}: {
  section: Section;
  /** Inside an entry: a way back to its list (guarded against unsaved changes). */
  back?: boolean;
  status?: EditorStatus;
}) {
  return (
    <header className="sticky top-0 z-6 flex h-admin-bar items-center gap-2 border-b border-line bg-paper-fade-strong px-admin-x backdrop-blur-bar @wide:hidden">
      {back && (
        <GuardedLink
          href={adminHref(section.slug)}
          aria-label="Back to list"
          data-ripple="press-row"
          className={`${CIRCLE_BUTTON} -ml-1.5`}
        >
          <ChevronLeftIcon />
        </GuardedLink>
      )}
      <span className="min-w-0 truncate text-meta font-medium">{section.label}</span>
      {status && <StatePill status={status} short />}
      <div className="ml-auto flex flex-none items-center gap-2">
        <ThemeToggle variant="admin" />
        <SheetButton />
      </div>
    </header>
  );
}
