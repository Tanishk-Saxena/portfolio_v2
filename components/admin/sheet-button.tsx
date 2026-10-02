'use client';

import { usePathname } from 'next/navigation';
import { sectionFromPath } from '@/lib/admin/sections';
import { CIRCLE_BUTTON } from './admin-classes';
import { MenuIcon } from './admin-icons';
import { openSheet, SHEET_ID } from './sections-sheet';

/**
 * Opens the Sections sheet (phones). `pill`: the list header's button, labelled with the
 * current section. `icon`: the editor bar's ≡ on single records (ADMIN-DESIGN-SPEC §4.2).
 */
export function SheetButton({ variant }: { variant: 'pill' | 'icon' }) {
  const label = sectionFromPath(usePathname())?.label ?? 'Sections';
  return (
    <button
      type="button"
      // The pill's name starts with its visible label (WCAG 2.5.3).
      aria-label={variant === 'pill' ? `${label}, open sections` : 'Open sections'}
      aria-haspopup="dialog"
      aria-controls={SHEET_ID}
      onClick={openSheet}
      data-ripple="press-row"
      className={
        variant === 'icon'
          ? CIRCLE_BUTTON
          : 'inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-line px-4 text-meta font-medium whitespace-nowrap'
      }
    >
      {variant === 'pill' && label}
      <MenuIcon />
    </button>
  );
}
