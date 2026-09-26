'use client';

import { useEffect, useState } from 'react';

/**
 * Which section is under the middle of the viewport, and whether the hero has been
 * scrolled past (hero bottom above 140px from the top, as mocked). IntersectionObserver
 * only, with no scroll listeners, so it costs nothing while scrolling on slow phones.
 */
export function useSectionSpy(sectionIds: string[], heroId = 'hero') {
  const [active, setActive] = useState<string | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const key = sectionIds.join(',');

  useEffect(() => {
    const ids = key.split(',');
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    // A 1px line across the middle of the viewport: whichever section crosses it is active.
    const middle = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    elements.forEach((el) => middle.observe(el));

    const hero = document.getElementById(heroId);
    const heroWatch = new IntersectionObserver(
      ([entry]) => {
        const above = entry.boundingClientRect.top < 0;
        setPastHero(!entry.isIntersecting && above);
        if (entry.isIntersecting) setActive(null);
      },
      { rootMargin: '-140px 0px 0px 0px' },
    );
    if (hero) heroWatch.observe(hero);

    return () => {
      middle.disconnect();
      heroWatch.disconnect();
    };
  }, [key, heroId]);

  return { active, pastHero };
}
