'use client';

import { useLayoutEffect } from 'react';
import { takeArticleEntrance } from '@/lib/page-arrival';

/**
 * Phones, arriving from the home page (WritingList): the article rises into place, the phone
 * counterpart of the page sheet. Runs before the first paint, so the article never flashes
 * in at rest first. The push already scrolled to the top.
 */
export function ArticleEntrance() {
  useLayoutEffect(() => {
    if (!takeArticleEntrance()) return;
    document.querySelector('main')?.animate(
      [
        { opacity: 0, transform: 'translateY(28px)' },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: 460,
        easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)', // --ease-out-soft
        fill: 'backwards',
      },
    );
  }, []);
  return null;
}
