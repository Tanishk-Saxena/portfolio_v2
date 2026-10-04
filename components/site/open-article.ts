import { markArticleEntrance } from '@/lib/page-arrival';
import { isNarrow } from '@/lib/viewport';
import { TO_ARTICLE } from './page-transition';

const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

type Push = (href: string, options?: { transitionTypes?: string[] }) => void;

/**
 * Opens an article from the Writing list, at once.
 * Wide layouts: the page-sheet view transition. Phones: the list lifts away, then the article
 * rises in (ArticleEntrance): cheap transform/opacity, because snapshotting the full-length
 * home page for a view transition stalls phone GPUs (the same reason HomeLink skips it).
 */
export function openArticle(push: Push, href: string) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !isNarrow()) {
    push(href, { transitionTypes: TO_ARTICLE });
    return;
  }
  markArticleEntrance();
  const go = () => push(href);
  const main = document.querySelector('main');
  if (!main) return go();
  main
    .animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-12px)' }], {
      duration: 170,
      easing: EASE_IN,
      fill: 'forwards',
    })
    .finished.then(go, go);
}
