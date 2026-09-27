'use client';

import { useEffect } from 'react';

/**
 * Arms the section reveals (CSS in styles/tokens.css). One IntersectionObserver for the
 * page; each group is revealed once, then unobserved. Groups already on screen when it arms
 * are marked static, so nothing visible ever blinks out. Not armed under reduced motion or
 * without IntersectionObserver, so the content is simply there.
 */
export function RevealObserver() {
  useEffect(() => {
    const html = document.documentElement;
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }
    const groups = [...document.querySelectorAll<HTMLElement>('[data-reveal-group]')];
    const vh = window.innerHeight;
    for (const el of groups) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.dataset.revealed = 'static';
    }
    html.dataset.reveal = '';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.revealed ??= 'in';
          observer.unobserve(el);
        }
      },
      // Reveal a little before the group is fully in: its top crosses 90% of the viewport.
      { rootMargin: '0px 0px -10% 0px' },
    );
    groups.filter((el) => !el.dataset.revealed).forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      delete html.dataset.reveal;
    };
  }, []);

  return null;
}
