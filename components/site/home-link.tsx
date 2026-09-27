'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ComponentProps } from 'react';
import { markArrival } from '@/lib/page-arrival';
import { requestRestore } from '@/lib/scroll-memory';
import { isNarrow } from '@/lib/viewport';
import { TO_HOME } from './page-transition';

const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

/**
 * Any way back to the portfolio from an article (Back, More writing, the signature).
 * `restore`: return to the reader's saved scroll position when there is one (spec §10).
 * Wide layouts: the page-sheet view transition. Phones: the article slides out, then the home
 * page fades in (ScrollRestore) — cheap transform/opacity instead of full-page snapshots.
 */
export function HomeLink({
  href,
  restore = false,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; restore?: boolean }) {
  const router = useRouter();
  useEffect(() => router.prefetch('/'), [router]); // ready before the tap

  return (
    <Link
      href={href}
      transitionTypes={TO_HOME}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        const restored = restore && requestRestore();
        const target = restored ? '/' : href;
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const phone = isNarrow() && !still;
        if (!phone && !restored) return; // the Link's own navigation + view transition
        e.preventDefault();
        // Phones: the home page places itself (ScrollRestore) before its entrance plays, so the
        // hash stays out of the push (Next's own hash scroll would measure mid-entrance).
        const go = () =>
          router.push(phone ? target.split('#')[0] : target, {
            scroll: !restored && !phone,
            transitionTypes: phone ? undefined : TO_HOME,
          });
        if (!phone) return go();
        markArrival(target);
        const main = document.querySelector('main');
        if (!main) return go();
        main
          .animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(12px)' }], {
            duration: 170,
            easing: EASE_IN,
            fill: 'forwards',
          })
          .finished.then(go, go);
      }}
      {...props}
    />
  );
}
