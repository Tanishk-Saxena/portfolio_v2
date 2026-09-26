'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { ArticleSummary } from '@/lib/domain/types';
import { usePagedList } from '@/lib/hooks/use-paged-list';
import { formatMonthYear } from '@/lib/utils/format';
import { ShowMoreButton } from '@/components/ui/show-more-button';

const ROW =
  'flex scroll-mt-anchor-row flex-wrap items-baseline gap-x-5 gap-y-1.5 border-t border-border-row py-6 pr-4 hover:bg-surface hover:text-inherit focus-visible:outline-offset-[-2px] active:bg-press-writing';

/**
 * Writing rows (spec §6 WritingRow), three at a time. A `#post-<slug>` deep link expands
 * the list far enough to contain its row, then scrolls to it: the hash can't resolve
 * before the row exists ([DN] "Routing").
 */
export function WritingList({ articles }: { articles: ArticleSummary[] }) {
  const { visible, hasMore, showMore, reveal, containerRef } = usePagedList(articles.length);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash);
    if (!hash.startsWith('#post-')) return;
    const index = articles.findIndex((a) => `#post-${a.slug}` === hash);
    if (index === -1) return;
    reveal(index);
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
  }, [articles, reveal]);

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
            <>
              <h3 className="max-w-[34ch] font-serif text-h3-post">{article.title}</h3>
              <span className="text-small text-muted">{article.readMinutes} min</span>
              <time
                dateTime={article.publishedAt}
                className="ml-auto text-small text-muted tabular-nums"
              >
                {formatMonthYear(article.publishedAt)}
              </time>
            </>
          );
          const shared = { id: `post-${article.slug}`, 'data-page-item': i, className: ROW };

          return article.hasBody || !article.externalUrl ? (
            <Link key={article.slug} href={`/articles/${article.slug}`} {...shared}>
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
      {hasMore && <ShowMoreButton onClick={showMore} />}
    </>
  );
}
