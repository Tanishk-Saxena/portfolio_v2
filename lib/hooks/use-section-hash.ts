import { useEffect } from 'react';

/** Keeps the URL's hash on the section being read; the top of the page has none. */
export function useSectionHash(active: string | null, pastHero: boolean) {
  // The URL follows the section being read, so a reload returns there (owner revision).
  useEffect(() => {
    const hash = pastHero && active ? `#${active}` : ''; // at the top: no hash
    if (location.hash === hash) return;
    history.replaceState(history.state, '', location.pathname + location.search + hash);
  }, [active, pastHero]);

  // Native #hero links (the signature) would leave #hero behind: the top has no hash.
  useEffect(() => {
    const strip = () => {
      if (location.hash === '#hero') {
        history.replaceState(history.state, '', location.pathname + location.search);
      }
    };
    window.addEventListener('hashchange', strip);
    return () => window.removeEventListener('hashchange', strip);
  }, []);
}
