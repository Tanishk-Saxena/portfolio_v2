/**
 * Phones return from an article without a view transition (snapshotting the full-length home
 * page is what made it slow there): the article slides out, then the home page plays a light
 * entrance on arrival (ScrollRestore). This carries "arriving from an article", and the
 * #section to land on, if any.
 */
let arriving: { hash: string } | null = null;

export function markArrival(href: string) {
  const i = href.indexOf('#');
  arriving = { hash: i >= 0 ? href.slice(i + 1) : '' };
}

/** This home render's arrival from an article, once. */
export function takeArrival() {
  const a = arriving;
  arriving = null;
  return a;
}
