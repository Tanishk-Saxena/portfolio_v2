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

/** The same for the way in: phones open an article without a view transition too (WritingList). */
let enteringArticle = false;

export function markArticleEntrance() {
  enteringArticle = true;
}

/** Whether this article render is arriving from the home page on a phone, once. */
export function takeArticleEntrance() {
  const e = enteringArticle;
  enteringArticle = false;
  return e;
}

/**
 * A phone page turn is in flight (either way). The page wrapper then mounts without a
 * <ViewTransition>: React starts a view transition whenever one mounts, even with no
 * animation, and the snapshot plus whole-page style pass is what stalls phones.
 */
export const phoneTurnPending = () => enteringArticle || arriving !== null;
