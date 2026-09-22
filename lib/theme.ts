export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * Runs synchronously in <head> before first paint (Q7): stored choice, else the OS
 * preference. Kept as a string so it can be inlined without a network request.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage unavailable (private mode) — the choice still applies for this page
  }
}
