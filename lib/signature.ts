/**
 * The navbar signature writes itself on a full page load (spec §10 "Phase 9 picks"): a soft,
 * slanted edge crosses the name left to right, then the underline draws (styles/tokens.css,
 * `data-sign`). Runs in <head> before first paint, so the name never shows unwritten first.
 * Skipped under reduced motion. The attribute comes off when the underline has drawn (the
 * animations start at first paint, however late that is on a slow phone), or after a long
 * fallback, so a header that mounts later (a page turn in the app) shows the name at rest.
 */
const FALLBACK_MS = 8000;

export const signatureInitScript = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement,done=function(){d.removeAttribute('data-sign')};d.setAttribute('data-sign','write');d.addEventListener('animationend',function(e){if(e.animationName==='sign-line')done()});setTimeout(done,${FALLBACK_MS})}catch(e){}})()`;
