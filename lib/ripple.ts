/** One ripple speed everywhere (owner revision, spec §10). */
export const RIPPLE_MS = 380;
/** Controls whose action moves or removes them run it this long after the press, so the
 *  ripple is seen first (Show more, article rows). */
export const RIPPLE_LEAD_MS = 180;

/**
 * Runs `action` once the press ripple has had its lead. Keyboard activation (no pointer:
 * `detail === 0`) and reduced motion run it at once.
 */
export function afterRipple(event: { detail: number }, action: () => void) {
  if (event.detail === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    action();
    return;
  }
  window.setTimeout(action, RIPPLE_LEAD_MS);
}
