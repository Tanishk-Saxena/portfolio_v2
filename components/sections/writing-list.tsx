'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { ArticleSummary } from '@/lib/domain/types';
import { usePagedList } from '@/lib/hooks/use-paged-list';
import { formatMonthYear } from '@/lib/utils/format';
import { ShowMoreButton } from '@/components/ui/show-more-button';
import { TO_ARTICLE } from '@/components/site/page-transition';
import { openArticle } from '@/components/site/open-article';
import { warmArticleFonts } from '@/lib/article-fonts';
import { rememberScroll } from '@/lib/scroll-memory';

/**
 * Hover as mocked: padding-left 0 → 16px with the surface wash. The title and read time
 * step in while the date stays pinned to the right edge. (A transform would drag the date
 * into the edge too.) One row, hover devices only, so the layout cost is negligible.
 */
const ROW =
  'group block scroll-mt-anchor-row border-t border-border-row py-6 pr-4 [transition:padding-left_.3s_ease,background-color_.3s_ease] hover:bg-surface hover:pl-4 hover:text-inherit focus-visible:outline-offset-[-2px] motion-reduce:[transition:background-color_.3s_ease]';

/** Title with its read time on the line below (owner's call); the date sits right, level with
 * the title's first line. Every row has the same shape whatever the title length. */
const CONTENT = 'grid grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-1.5';

/**
 * Writing rows (spec §6 WritingRow), three at a time. A `#post-<slug>` deep link expands
 * the list far enough to contain its row, then scrolls to it: the hash can't resolve
 * before the row exists ([DN] "Routing").
 */
export function WritingList({ articles }: { articles: ArticleSummary[] }) {
  const { visible, hasMore, canCollapse, showMore, showLess, reveal, containerRef } = usePagedList(
    'writing',
    articles.length,
  );
  const pendingAnchor = useRef<string | null>(null);
  const router = useRouter();

  // 1) On load, a #post-<slug> hash expands the list far enough to contain that row…
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash);
    if (!hash.startsWith('#post-')) return;
    const index = articles.findIndex((a) => `#post-${a.slug}` === hash);
    if (index === -1) return;
    pendingAnchor.current = hash.slice(1);
    reveal(index);
  }, [articles, reveal]);

  // Article fonts download once the list is near the screen, so opening one never waits on them.
  useEffect(() => {
    const list = containerRef.current;
    if (!list) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        warmArticleFonts();
        io.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(list);
    return () => io.disconnect();
  }, [containerRef]);

  // 2) …and scrolls only once that row has actually rendered (no frame-timing race).
  useEffect(() => {
    const id = pendingAnchor.current;
    const row = id ? document.getElementById(id) : null;
    if (!row) return;
    pendingAnchor.current = null;
    // Instant: the page's smooth scroll-behavior would visibly travel down from the top.
    row.scrollIntoView({ behavior: 'instant' });
  }, [visible]);

  return (
    <>
      <div
        ref={(el) => {
          containerRef.current = el;
        }}
        className="flex flex-col"
      >
        {articles.slice(0, visible).map((article, i) => {
          const content = (
            <span className={CONTENT}>
              <h3 className="max-w-[34ch] font-serif text-h3-post">{article.title}</h3>
              <span className="col-start-1 row-start-2 text-small text-muted">
                {article.readMinutes} min
              </span>
              <time
                dateTime={article.publishedAt}
                className="col-start-2 row-start-1 text-small text-muted tabular-nums"
              >
                {formatMonthYear(article.publishedAt)}
              </time>
            </span>
          );
          const shared = {
            id: `post-${article.slug}`,
            'data-page-item': i,
            'data-ripple': 'press-writing',
            className: ROW,
          };

          return article.hasBody || !article.externalUrl ? (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              transitionTypes={TO_ARTICLE}
              // Fetch the article as the finger lands, so it's ready when the page turns.
              onPointerDown={() => {
                warmArticleFonts();
                router.prefetch(`/articles/${article.slug}`);
              }}
              onClick={(e) => {
                rememberScroll();
                // Modified clicks keep the browser's behaviour.
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                openArticle((h, o) => router.push(h, o), `/articles/${article.slug}`);
              }}
              {...shared}
            >
              {content}
            </Link>
          ) : (
            <a
              key={article.slug}
              href={article.externalUrl}
              target="_blank"
              rel="noreferrer"
              {...shared}
            >
              {content}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          );
        })}
      </div>
      {(hasMore || canCollapse) && (
        <ShowMoreButton
          label={hasMore ? 'Show more' : 'Show less'}
          onClick={hasMore ? showMore : showLess}
        />
      )}
    </>
  );
}
