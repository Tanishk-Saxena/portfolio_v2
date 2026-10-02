/*
 * Class strings shared by the admin's controls (ADMIN-DESIGN-SPEC §5). Presses use the
 * site's ripple (`data-ripple`), focus the site's ring (Q-A4).
 */

/** 44px outline circle: back, ≡, close. */
export const CIRCLE_BUTTON =
  'grid size-11 flex-none cursor-pointer place-items-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-accent';

/** Outline pill (View on site ↗). */
export const OUTLINE_PILL =
  'inline-flex h-11 flex-none items-center rounded-full border border-line px-4.5 text-meta whitespace-nowrap transition-colors duration-200 hover:border-accent';

/** The one filled button per screen. */
export const FILLED_PILL =
  'inline-flex h-11 flex-none cursor-pointer items-center gap-2 rounded-full bg-accent-fill px-5 text-meta font-medium whitespace-nowrap text-on-accent transition-opacity duration-200 hover:text-on-accent hover:opacity-90';

/** Uppercase small label: "Content admin", "Sections". */
export const CAPS_LABEL = 'tracking-eyebrow text-muted uppercase';
