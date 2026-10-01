export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
/** The admin remembers its own mode, separately from the site (Q-A7). */
export const ADMIN_THEME_STORAGE_KEY = 'admin-theme';

const ADMIN_PATH = /^\/admin(\/|$)/;

export function themeStorageKey(pathname: string) {
  return ADMIN_PATH.test(pathname) ? ADMIN_THEME_STORAGE_KEY : THEME_STORAGE_KEY;
}

/**
 * Runs synchronously in <head> before first paint (Q7): stored choice (the admin's own key
 * under /admin), else the OS preference. On the home page it also turns off the browser's pixel scroll restoration
 * (reloaded lists start collapsed, so the old offset lands in the wrong place): the page opens
 * at its #section instead: kept hidden (`data-anchoring`) until the HTML is parsed, then
 * scrolled there and shown, so the hero never flashes. Articles keep native restoration (exact position). Kept as a string so it can be inlined without a network request.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${ADMIN_PATH}.test(location.pathname)?'${ADMIN_THEME_STORAGE_KEY}':'${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}try{var d=document.documentElement,h=location.hash,home=location.pathname==='/';history.scrollRestoration=home?'manual':'auto';if(home&&h&&h!=='#hero'){d.setAttribute('data-anchoring','');var done=0,go=function(){if(done)return;done=1;try{var e=document.getElementById(decodeURIComponent(h.slice(1)));if(e)e.scrollIntoView({behavior:'instant'})}catch(x){}d.removeAttribute('data-anchoring')};document.addEventListener('DOMContentLoaded',go);setTimeout(go,1500)}}catch(e){}})()`;

export function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(themeStorageKey(location.pathname), theme);
  } catch {
    // storage unavailable (private mode) — the choice still applies for this page
  }
}
