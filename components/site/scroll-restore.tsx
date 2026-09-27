'use client';

import { useLayoutEffect } from 'react';
import { takeArrival } from '@/lib/page-arrival';
import { takeRestore } from '@/lib/scroll-memory';

/** The home page settles in from just above (the phone counterpart of the page sheet). */
function arrive() {
  for (const el of document.querySelectorAll<HTMLElement>('main, main ~ footer')) {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(-16px)' },
        { opacity: 1, transform: 'none' },
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)', // --ease-out-soft
        fill: 'backwards',
      },
    );
  }
}

/**
 * Back from an article, puts the home page at the reader's saved position (lib/scroll-memory)
 * before its first paint and before the page transition snapshots it; on phones it also plays
 * a light entrance (arrive). A full load or reload onto a #section is positioned once by the
 * pre-paint script (lib/theme.ts), never here: a jump at hydration time (seconds later on a
 * phone) would yank back a reader who had already started scrolling.
 */
export function ScrollRestore() {
  useLayoutEffect(() => {
    const y = takeRestore();
    const arrival = takeArrival(); // phones, back from an article (HomeLink)
    // Place the page first, then play the entrance: measuring mid-entrance lands short.
    if (y !== null) window.scrollTo({ top: y, behavior: 'instant' });
    else if (arrival?.hash) {
      document.getElementById(arrival.hash)?.scrollIntoView({ behavior: 'instant' });
      history.replaceState(history.state, '', `#${arrival.hash}`); // the URL names the section
    } else if (arrival) window.scrollTo({ top: 0, behavior: 'instant' }); // the signature: top
    if (arrival) arrive();
  }, []);
  return null;
}
