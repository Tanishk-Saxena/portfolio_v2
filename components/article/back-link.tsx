import { HomeLink } from '@/components/site/home-link';
import { ArrowLeftIcon } from '@/components/ui/icons';

/**
 * The article's Back link (owner revision, spec §10). If the reader came from the home
 * page, it returns them to their exact scroll position; otherwise (a direct visit) it goes
 * to the Writing section.
 */
export function BackLink() {
  return (
    <HomeLink
      href="/#writing"
      restore
      className="hit-44 relative mb-article-back inline-flex items-center gap-2 text-label tracking-label text-muted uppercase transition-colors duration-200 hover:text-accent"
    >
      <ArrowLeftIcon />
      Writing
    </HomeLink>
  );
}
