'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const PAGE_SIZE = 3; // spec §7: Projects and Writing page in threes

/**
 * Reveal a list in pages. After "show more", focus moves to the first newly revealed item
 * (found by `data-page-item` index inside the container ref), so keyboard and screen-reader
 * users continue exactly where the new content starts.
 */
export function usePagedList(total: number, pageSize = PAGE_SIZE) {
  const [visible, setVisible] = useState(Math.min(pageSize, total));
  const containerRef = useRef<HTMLElement | null>(null);
  const focusIndex = useRef<number | null>(null);

  const showMore = useCallback(() => {
    setVisible((v) => {
      focusIndex.current = v;
      return Math.min(v + pageSize, total);
    });
  }, [pageSize, total]);

  /** Grow the page count until `index` is visible (deep links like #post-slug). */
  const reveal = useCallback(
    (index: number) => {
      setVisible((v) => Math.min(Math.max(v, Math.ceil((index + 1) / pageSize) * pageSize), total));
    },
    [pageSize, total],
  );

  useEffect(() => {
    if (focusIndex.current === null) return;
    const target = containerRef.current?.querySelector<HTMLElement>(
      `[data-page-item="${focusIndex.current}"]`,
    );
    focusIndex.current = null;
    target?.focus({ preventScroll: false });
  }, [visible]);

  return { visible, hasMore: visible < total, showMore, reveal, containerRef };
}
