'use client';

import { useLayoutEffect } from 'react';
import { takeRestore } from '@/lib/scroll-memory';

let firstLoad = true; // module state: true only for the page's full (re)load

/**
 * Sets the home page's scroll before its first paint (and before the page transition
 * snapshots it):
 * - back from an article: the saved position (lib/scroll-memory), so the return lands in place;
 * - a full load or reload with a #section: that section. The browser's own pixel restoration
 *   is off (lib/theme.ts), because after a reload the expanded lists are collapsed and the old
 *   offset would land in the wrong place.
 */
export function ScrollRestore() {
  useLayoutEffect(() => {
    const load = firstLoad;
    firstLoad = false;
    const y = takeRestore();
    if (y !== null) {
      window.scrollTo({ top: y, behavior: 'instant' });
      return;
    }
    const target = load && location.hash ? document.getElementById(location.hash.slice(1)) : null;
    target?.scrollIntoView({ behavior: 'instant' });
  }, []);
  return null;
}
