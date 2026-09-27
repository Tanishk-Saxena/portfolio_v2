/**
 * Home-page scroll memory for article round trips (owner revision, spec §10). Opening an
 * article saves the reader's exact position; the article's Back link asks for it to be
 * restored, and the home page applies it before its first paint (ScrollRestore), so the
 * reader is simply back where they were, with no visible scrolling. Module state lives for
 * the tab's lifetime (client navigation keeps it); a full load starts empty.
 */
let saved: number | null = null;
let pending: number | null = null;

export function rememberScroll() {
  saved = window.scrollY;
}

/** Queues the saved position for the next home render. False when there's none. */
export function requestRestore(): boolean {
  if (saved === null) return false;
  pending = saved;
  return true;
}

/** The queued position, once. */
export function takeRestore(): number | null {
  const y = pending;
  pending = null;
  return y;
}
