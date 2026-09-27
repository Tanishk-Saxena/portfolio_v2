'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { JUMP_EVENT } from '@/lib/anchor-jump';
import { isNarrow } from '@/lib/viewport';

export const PAGE_SIZE = 3; // spec §7: Projects and Writing page in threes

/**
 * How far each list was expanded, for this tab's lifetime. Client navigation remounts the
 * home page (e.g. back from an article); remembering the count means the row the reader
 * left from exists on the first render, so the return lands on it instead of scrolling
 * down from the top. Module state is fresh on every full load, so SSR and hydration agree.
 */
const remembered = new Map<string, number>();

// Show more timeline (ms).
const GROW_MS = 650;
const ITEMS_AT_MS = 520; // items start as the growth settles
const STAGGER_MS = 140;
const EASE = 'cubic-bezier(0.215, 0.61, 0.355, 1)'; // ease-out cubic (matched in followGrowth)

/** Where the section and its Show more button were before the new page rendered. */
interface Before {
  height: number;
  moreTop: number | null; // page Y of the Show more block (null once it's gone)
}

const pageTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

function measure(container: HTMLElement): Before {
  const more = container.nextElementSibling;
  return {
    height: container.parentElement?.offsetHeight ?? 0,
    moreTop: more ? pageTop(more) : null,
  };
}

/**
 * The button's move, both ways: it slides from where it was to where it now sits (FLIP,
 * transform only), the section's height changes on the same curve so everything below
 * travels with it, and the page follows (below). On Show more the new items are still
 * invisible here; on Show less the leaving items have already faded out.
 */
function growSection(box: HTMLElement, container: HTMLElement, before: Before) {
  const html = document.documentElement;
  html.style.overflowAnchor = 'none'; // the browser mustn't re-anchor the scroll mid-move
  const to = box.offsetHeight;
  box.animate([{ height: `${before.height}px` }, { height: `${to}px` }], {
    duration: GROW_MS,
    easing: EASE,
  });
  const more = container.nextElementSibling as HTMLElement | null;
  if (more && before.moreTop !== null) {
    const delta = before.moreTop - pageTop(more);
    more.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], {
      duration: GROW_MS,
      easing: EASE,
    });
  }
  followGrowth(box, to);
  window.setTimeout(() => html.style.removeProperty('overflow-anchor'), GROW_MS);
}

/**
 * Scrolls the page just far enough to keep the section's new end (its button, or the last
 * item) in view: down after Show more, up after Show less. Phones get one native smooth scroll (runs on
 * the compositor; per-frame scrollTo stutters there). Wide layouts step the scroll in sync
 * with the growth (the native curve is too quick there). The header treats it as a jump.
 */
function followGrowth(box: HTMLElement, finalHeight: number) {
  const pad = parseFloat(getComputedStyle(box).paddingBottom) || 0;
  const endY = box.getBoundingClientRect().top + window.scrollY + finalHeight - pad;
  const from = window.scrollY;
  const vh = window.innerHeight;
  let target: number;
  if (endY > from + vh - 24)
    target = endY - vh + 24; // grew past the bottom: follow down
  else if (endY < from + vh * 0.35)
    target = Math.max(0, endY - vh * 0.6); // shrank away: up
  else return; // still comfortably in view
  window.dispatchEvent(new Event(JUMP_EVENT));
  if (isNarrow()) {
    window.scrollTo({ top: target, behavior: 'smooth' });
    return;
  }
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / GROW_MS);
    window.scrollTo({ top: from + (target - from) * (1 - (1 - t) ** 3), behavior: 'instant' });
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Reveal a list in pages. After "show more", focus moves to the first newly revealed item
 * (found by `data-page-item` index inside the container ref), so keyboard and screen-reader
 * users continue exactly where the new content starts. `key` names the list for
 * `remembered`.
 */
export function usePagedList(key: string, total: number, pageSize = PAGE_SIZE) {
  const [visible, setVisible] = useState(() =>
    Math.min(Math.max(pageSize, remembered.get(key) ?? 0), total),
  );
  const containerRef = useRef<HTMLElement | null>(null);
  const focusIndex = useRef<number | null>(null);
  const before = useRef<Before | null>(null);
  const collapsing = useRef(false);

  const showMore = useCallback(() => {
    before.current = containerRef.current ? measure(containerRef.current) : null;
    setVisible((v) => {
      focusIndex.current = v;
      return Math.min(v + pageSize, total);
    });
  }, [pageSize, total]);

  /**
   * Back to the first page (owner revision, spec §10): the extra items fade out, last first;
   * then the button glides back up as the section shrinks and the page follows. Focus stays
   * on the button, which is now Show more again.
   */
  const showLess = useCallback(() => {
    const container = containerRef.current;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leaving = container ? ([...container.children].slice(pageSize) as HTMLElement[]) : [];
    const fades = still
      ? []
      : leaving.map(
          (el, k) =>
            el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 240,
              delay: (leaving.length - 1 - k) * 60,
              easing: 'ease-in',
              fill: 'forwards',
            }).finished,
        );
    void Promise.all(fades)
      .catch(() => {})
      .then(() => {
        before.current = container ? measure(container) : null;
        collapsing.current = true;
        setVisible(Math.min(pageSize, total));
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
    remembered.set(key, visible);
  }, [key, visible]);

  // Show more, as a sequence (owner revision, spec §10):
  //   1. the Show more button glides down to where it ends up, the section grows with it,
  //      and the page scrolls just enough to keep it in view;
  //   2. then the new items fade up, one by one, into the space that opened.
  // A layout effect, so it starts before the new layout is ever painted (no snap-back).
  useLayoutEffect(() => {
    const start = focusIndex.current;
    const container = containerRef.current;
    const box = container?.parentElement; // the section: list + Show more
    const from = before.current;
    const collapsed = collapsing.current;
    focusIndex.current = null;
    before.current = null;
    collapsing.current = false;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (collapsed) {
      if (from && box && container && !still) growSection(box, container, from);
      return;
    }
    if (start === null || !container || !box) return;

    if (from && !still) growSection(box, container, from);

    for (let i = start; i < visible; i++) {
      let item: HTMLElement | null = container.querySelector<HTMLElement>(
        `[data-page-item="${i}"]`,
      );
      while (item && item.parentElement !== container) item = item.parentElement;
      item?.animate(
        still
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'none' },
            ],
        {
          duration: 600,
          delay: still ? 0 : ITEMS_AT_MS + (i - start) * STAGGER_MS,
          easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)', // --ease-out-soft
          fill: 'backwards',
        },
      );
    }
    container
      .querySelector<HTMLElement>(`[data-page-item="${start}"]`)
      ?.focus({ preventScroll: true });
  }, [visible]);

  return {
    visible,
    hasMore: visible < total,
    /** Fully expanded beyond the first page: offer Show less. */
    canCollapse: visible >= total && total > pageSize,
    showMore,
    showLess,
    reveal,
    containerRef,
  };
}
