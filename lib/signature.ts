/*
 * The signature intro (spec §10 "Signature intro"), run by an inline script in <head> before
 * first paint, so nothing shows in the wrong state first. Skipped under reduced motion.
 *
 * With Settings → Signature intro on (`data-intro-setting` on <html>) it plays when the home
 * page loads at the top: a fresh visit or a reload (owner, 2026-10-18); not for a #section
 * URL, back/forward, a visit from another page of the site (an article) or a page turn in
 * the app. Anywhere else, and with the setting off, the name is simply there: no animation.
 * It moves **the navbar mark itself**: enlarged and centred over a paper overlay,
 * written left to right, then flown home with a transform. There is no second copy to hand
 * off to, so it lands with no shift, and no glyph data to ship (what shelved the first
 * version, Phase 4 notes). States on <html> (styles/tokens.css): `data-intro` = `wait`
 * (overlay up, mark hidden until measured), `write`, `fly`, then removed. Any key, click,
 * wheel or touch ends it at once; a fallback ends it if anything stalls. The hero's own
 * entrance is held while `data-intro` is set (styles/tokens.css), so it starts once the name
 * is home, never behind it. The attribute comes off at the end, so a header that mounts later
 * (a page turn in the app) shows the name at rest.
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
d.setAttribute('data-intro','wait');
inputs.forEach(function(t){addEventListener(t,end,{capture:true,passive:true})});setTimeout(end,${FALLBACK_MS});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();`;

export const signatureInitScript =
  `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;
var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0],type=nav?nav.type:'navigate';
var fromSite=type==='navigate'&&document.referrer.indexOf(location.origin+'/')===0;
if(d.getAttribute('data-intro-setting')==='on'&&location.pathname==='/'&&!location.hash&&(type==='navigate'||type==='reload')&&!fromSite){${intro}}}catch(e){}})()`.replace(
    /\n/g,
    '',
  );
