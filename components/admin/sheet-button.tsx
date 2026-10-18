'use client';

import { CIRCLE_BUTTON } from './admin-classes';
import { MenuIcon } from './admin-icons';
import { openSheet, SHEET_ID } from './sections-sheet';

/**
 * Opens the Sections sheet (phones): one round ≡, at the right of every bar after the theme
 * toggle, on lists and editors alike (owner, ADMIN-DESIGN-SPEC §14). The page's own heading
 * names the section, so the button doesn't repeat it.
 */
export function SheetButton() {
  return (
    <button
      type="button"
      aria-label="Open sections"
      aria-haspopup="dialog"
      aria-controls={SHEET_ID}
      onClick={openSheet}
      data-ripple="press-row"
      className={CIRCLE_BUTTON}
    >
      <MenuIcon />
    </button>
  );
}
