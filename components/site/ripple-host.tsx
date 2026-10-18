'use client';

import { useEffect } from 'react';
import { jumpTo } from '@/lib/anchor-jump';
import { RIPPLE_MS } from '@/lib/ripple';

const EASE = 'cubic-bezier(0.2, 0.85, 0.25, 1)'; // --ease-out-soft
const CANCEL_MS = 120; // a press that turned into a scroll clears quickly
const SLOP_PX = 10;

/**
 * Press feedback (owner revision, spec §10) on every `[data-ripple]` control: the ripple, a
 * wash of the control's own text colour that grows from the touch point and fades as it
 * goes, so it stays in the control's colour family on every surface. (Ring and Press-in were
 * compared and dropped, owner 2026-10-18.) It starts on pointer-down and nothing waits for it: the action runs at once. One delegated
 * listener; each mark is a transient span animated with transform/opacity only. A touch that
 * turns into a scroll clears its mark. Under reduced motion the wash fades in place.
 */
export function RippleHost() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');

    function layerOf(el: HTMLElement, name: string) {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      let layer = el.querySelector<HTMLElement>(`:scope > .${name}`);
      if (!layer) {
        layer = document.createElement('span');
        layer.className = name;
        layer.setAttribute('aria-hidden', 'true');
        el.append(layer);
      }
      return layer;
    }

    /** Removes the mark once its animation ends, or sooner if the press was a scroll. */
    function mark(layer: HTMLElement, node: HTMLElement, animation: Animation) {
      const clear = () => {
        node.remove();
        if (!layer.childElementCount) layer.remove();
      };
      animation.finished.then(clear, clear);
      return () => {
        const fade = node.animate([{ opacity: 0 }], { duration: CANCEL_MS, fill: 'forwards' });
        fade.finished.then(clear, clear);
      };
    }

    function wave(el: HTMLElement, clientX: number, clientY: number) {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const r = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
      const layer = layerOf(el, 'ripple-layer');
      const node = document.createElement('span');
      node.className = 'ripple-wave';
      Object.assign(node.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${r * 2}px`,
        height: `${r * 2}px`,
      });
      layer.append(node);
      const frames = reduce.matches
        ? [{ transform: 'translate(-50%, -50%) scale(1)' }, { opacity: 0 }]
        : [
            { transform: 'translate(-50%, -50%) scale(0)' },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
          ];
      return mark(layer, node, node.animate(frames, { duration: RIPPLE_MS, easing: EASE }));
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-ripple]');
      if (!el || el.matches(':disabled')) return;
      const cancel = wave(el, e.clientX, e.clientY);

      const cleanup = () => {
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('pointermove', onMove);
      };
      const onCancel = () => {
        cleanup();
        cancel();
      };
      const onMove = (m: PointerEvent) => {
        if (Math.hypot(m.clientX - e.clientX, m.clientY - e.clientY) > SLOP_PX) onCancel();
      };
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', onCancel);
      window.addEventListener('pointermove', onMove, { passive: true });
    };

    // In-page links (Get in touch, back to top) jump through jumpTo: the URL, the header
    // and the focus follow. At once: nothing waits for the press mark.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[data-ripple][href^="#"]',
      );
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      jumpTo(a.hash.slice(1));
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
