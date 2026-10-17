/*
 * The signature's two entrances (spec §10 "Phase 9 picks", "Signature intro"), run by one
 * inline script in <head> before first paint, so nothing shows in the wrong state first.
 * Both are skipped under reduced motion, where the name is simply there.
 *
 * The intro (Settings → Signature intro, `data-intro-setting` on <html>) plays on a fresh
 * visit to the home page: not on a reload, back/forward, a #section link or a page turn in
 * the app. It moves **the navbar mark itself**: enlarged and centred over a paper overlay,
 * written left to right, then flown home with a transform. There is no second copy to hand
 * off to, so it lands with no shift, and no glyph data to ship (what shelved the first
 * version, Phase 4 notes). States on <html> (styles/tokens.css): `data-intro` = `wait`
 * (overlay up, mark hidden until measured), `write`, `fly`, then removed. Any key, click,
 * wheel or touch ends it at once; a fallback ends it if anything stalls.
 *
 * Otherwise the navbar mark writes itself in place (`data-sign`) on every full page load.
 * Either way the attribute comes off at the end, so a header that mounts later (a page turn
 * in the app) shows the name at rest.
 */

/** The navbar name's font size (`--text-signature`); the intro enlarges from it. */
const NAV_PX = 31;
/** The intro's name size: the mockup's `clamp(54px, 12.5vw, 104px)`. */
const BIG_MIN = 54;
const BIG_VW = 0.125;
const BIG_MAX = 104;
/** From the first written frame to the flight: the writing (1.5s), the underline, a hold. */
const FLY_AT_MS = 2300;
/** The flight (.95s) and the overlay's fade, then the end. */
const LAND_MS = 1100;
const FALLBACK_MS = 8000;
/** The page's own entrance waits for the intro (spec §5.3: `--enter` 2.3s while it plays). */
const ENTER_AFTER_INTRO = '2.4s';
/** The mark's tilt in the navbar (`-rotate-4` on its slot), undone when aiming it. */
const TILT_RAD = (4 * Math.PI) / 180;

const intro = `
var mark,ended=false,dx=0,dy=0,inputs=['keydown','pointerdown','wheel','touchstart'];
function end(){if(ended)return;ended=true;d.removeAttribute('data-intro');inputs.forEach(function(t){removeEventListener(t,end,true)})}
function place(cx,cy){var w=innerWidth,h=innerHeight,k=Math.min(Math.max(${BIG_MIN},w*${BIG_VW}),${BIG_MAX})/${NAV_PX};
dx=w/2-cx;dy=h*.46-cy;var c=Math.cos(${TILT_RAD}),s=Math.sin(${TILT_RAD}),st=d.style;
st.setProperty('--intro-x',(dx*c-dy*s)+'px');st.setProperty('--intro-y',(dx*s+dy*c)+'px');st.setProperty('--intro-k',k)}
function centre(){var r=mark.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
function start(){if(ended)return;mark=document.querySelector('[data-signature-mark]');if(!mark)return end();
var c=centre();place(c[0],c[1]);d.setAttribute('data-intro','write');
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(ended||d.getAttribute('data-intro')!=='write')return;var c=centre();place(c[0]-dx,c[1]-dy)});
setTimeout(function(){if(ended)return;d.setAttribute('data-intro','fly');setTimeout(end,${LAND_MS})},${FLY_AT_MS})}
d.setAttribute('data-intro','wait');d.style.setProperty('--enter','${ENTER_AFTER_INTRO}');
inputs.forEach(function(t){addEventListener(t,end,{capture:true,passive:true})});setTimeout(end,${FALLBACK_MS});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();`;

const write = `
var done=function(){d.removeAttribute('data-sign')};d.setAttribute('data-sign','write');
d.addEventListener('animationend',function(e){if(e.animationName==='sign-line')done()});setTimeout(done,${FALLBACK_MS});`;

export const signatureInitScript =
  `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;
var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
if(d.getAttribute('data-intro-setting')==='on'&&location.pathname==='/'&&!location.hash&&(!nav||nav.type==='navigate')){${intro}}else{${write}}}catch(e){}})()`.replace(
    /\n/g,
    '',
  );
