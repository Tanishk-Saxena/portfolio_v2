import { newsreaderItalic, plexMono } from '@/lib/fonts';

let warmed = false;

/**
 * Starts downloading the article-only faces (pull-quote italic, code mono) ahead of the page
 * turn. Their @font-face rules are already on the home page, but nothing requests the files
 * until the article renders, and React holds a view transition until newly used fonts load
 * (up to ~500ms): on a real network that froze the screen, ripple included, before the
 * article rose in. Not preloaded, so the home page's first paint doesn't pay for them.
 */
export function warmArticleFonts() {
  if (warmed || !('fonts' in document)) return;
  warmed = true;
  const load = (font: string) => void document.fonts.load(font).catch(() => {});
  load(`italic 300 1em ${newsreaderItalic.style.fontFamily}`);
  load(`400 1em ${plexMono.style.fontFamily}`);
}
