/** Fired on in-page jumps, so the header can tuck away (sections land flush at the top). */
export const JUMP_EVENT = 'site:jump';

/**
 * In-page jump to a section: URL follows, the page scrolls with its scroll-behavior
 * (instant under reduced motion), and focus moves to the target for keyboard users.
 */
export function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  // The top is the plain URL: #hero never shows (a reload there opens at the top anyway).
  history.pushState(null, '', id === 'hero' ? location.pathname + location.search : `#${id}`);
  window.dispatchEvent(new Event(JUMP_EVENT));
  target.scrollIntoView();
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
