'use client';

import { ArrowUpIcon } from '@/components/ui/icons';

/**
 * Back-to-top (spec §6 BackToTop): 42px visual (hit area extended to 44px), 16px above the
 * nav button, shown with it once the hero is past and hidden while the menu is open.
 * Focus lands on the hero heading afterwards, so keyboard users aren't dropped on <body>.
 */
export function BackToTop({ visible }: { visible: boolean }) {
  function toTop() {
    window.scrollTo({ top: 0 }); // honours CSS scroll-behavior (instant under reduced motion)
    const heading = document.getElementById('hero-heading');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      inert={!visible}
      className={`hit-44 absolute bottom-full left-1/2 mb-4 -ml-5.25 grid size-10.5 cursor-pointer place-items-center rounded-full border border-border-quiet bg-paper text-ink shadow-float-top hover:border-accent active:border-accent-fill active:bg-accent-fill active:text-on-accent ${visible ? '' : 'invisible opacity-0'}`}
    >
      <ArrowUpIcon />
    </button>
  );
}
