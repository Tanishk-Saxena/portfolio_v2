'use client';

import { useEffect } from 'react';
import { jumpTo } from '@/lib/anchor-jump';
import { afterRipple, RIPPLE_MS } from '@/lib/ripple';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material standard
const FADE_MS = 300;
const TOUCH_DELAY_MS = 100; // a touch only ripples once it's clearly a press, not a scroll
const CANCEL_MS = 120; // a press that turned into a scroll clears quickly
const SLOP_PX = 10;

/**
 * Press ripple (owner revision, spec §10): on any `[data-ripple="<tone>"]` control, the
 * pressed colour grows outward from the touch point, then fades after release. One
 * delegated listener; each wave is a transient span animated with transform/opacity only.
 * Touch presses wait briefly and are dropped if the finger starts scrolling. Under reduced
 * motion the colour fades in place. Tones map to colours in styles/tokens.css.
 */
export function RippleHost() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');

    function spawn(el: HTMLElement, clientX: number, clientY: number) {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const r = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      let layer = el.querySelector<HTMLElement>(':scope > .ripple-layer');
      if (!layer) {
        layer = document.createElement('span');
        layer.className = 'ripple-layer';
        layer.setAttribute('aria-hidden', 'true');
        el.append(layer);
      }
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.dataset.tone = el.dataset.ripple;
      Object.assign(wave.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${r * 2}px`,
        height: `${r * 2}px`,
      });
      layer.append(wave);
      el.dataset.pressed = ''; // styles can follow the wave, not just the finger (:active)

      const grow = reduce.matches
        ? wave.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'forwards' })
        : wave.animate(
            [
              { transform: 'translate(-50%, -50%) scale(0)' },
              { transform: 'translate(-50%, -50%) scale(1)' },
            ],
            { duration: RIPPLE_MS, easing: EASE, fill: 'forwards' },
          );

      const fade = (after: Promise<unknown>, duration = FADE_MS) =>
        void after
          .then(
            () =>
              wave.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration,
                easing: 'ease',
                fill: 'forwards',
              }).finished,
          )
          .catch(() => {})
          .finally(() => {
            wave.remove();
            if (layer && !layer.childElementCount) {
              layer.remove();
              delete el.dataset.pressed;
            }
          });

      return {
        release: () => fade(grow.finished), // finish growing, then fade
        cancel: () => fade(Promise.resolve(), CANCEL_MS), // a scroll took over: clear now
      };
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-ripple]');
      if (!el || el.matches(':disabled')) return;

      let wave: ReturnType<typeof spawn> | null = null;
      let timer = 0;
      const start = () => {
        timer = 0;
        wave ??= spawn(el, e.clientX, e.clientY);
      };
      const cleanup = () => {
        window.clearTimeout(timer);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('pointermove', onMove);
      };
      const onUp = () => {
        cleanup();
        start(); // a quick tap still gets its ripple
        wave?.release();
      };
      const onCancel = () => {
        cleanup();
        wave?.cancel();
      };
      const onMove = (m: PointerEvent) => {
        if (Math.hypot(m.clientX - e.clientX, m.clientY - e.clientY) > SLOP_PX) onCancel();
      };

      if (e.pointerType === 'touch') timer = window.setTimeout(start, TOUCH_DELAY_MS);
      else start();
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      window.addEventListener('pointermove', onMove, { passive: true });
    };

    // In-page links with a ripple (Get in touch, back to top) jump once it has had its lead,
    // like Show more; otherwise the scroll starts before the ripple is seen.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[data-ripple][href^="#"]',
      );
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      afterRipple(e, () => jumpTo(a.hash.slice(1)));
    };

    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
