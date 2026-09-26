import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from 'next/font/google';

// Spec §2.1 / Q20–Q21: self-hosted, subset, swap, automatic size-adjusted fallbacks.
// Only fonts the first screen needs are preloaded; article-only faces load on that route.

export const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal'],
  axes: ['opsz'], // optical sizing is what gives the display type its mockup look
  display: 'swap',
  variable: '--font-newsreader',
});

// The pull-quote italic is used on articles only (spec §2.2 pull-quote: 300 italic).
// Split out so the home page doesn't download 140KB it never shows.
export const newsreaderItalic = Newsreader({
  subsets: ['latin'],
  style: ['italic'],
  weight: '300',
  display: 'swap',
  preload: false,
  variable: '--font-newsreader-italic',
});

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-sans',
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-caveat',
});

// Article route only (Q19) — not preloaded on the main page.
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-plex-mono',
});
