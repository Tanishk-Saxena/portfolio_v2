import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from 'next/font/google';

// Spec §2.1 / Q20–Q21: self-hosted, subset, swap, automatic size-adjusted fallbacks.

export const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-newsreader',
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
