'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { JUMP_EVENT } from '@/lib/anchor-jump';
import { isNarrow } from '@/lib/viewport';

const TOP_ZONE = 120; // always shown this close to the top
const THRESHOLD = 8; // px of travel before a direction counts (ignores jitter)
const JUMP_MS = 1200; // how long an in-page jump's own scrolling is ignored

/**
 * The fixed header's behaviour (CSS `.site-header` in styles/tokens.css): hidden while the
 * reader scrolls down, back on any upward scroll, a tap on the page, keyboard focus inside
 * it, or near the top — on the phone layout only; wide layouts keep it. In-page jumps land sections flush at the top, so the header tucks
 * away for them (and ignores the jump's own scrolling). One passive scroll listener.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    let jumpUntil = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - lastY;
        if (!isNarrow()) {
          setHidden(false); // wide layouts keep the header (owner revision)
          lastY = y;
          return;
        }
        if (performance.now() < jumpUntil) {
          if (y < TOP_ZONE) setHidden(false); // a jump to the top still shows it
          lastY = y;
          return;
        }
        if (y < TOP_ZONE) setHidden(false);
        else if (dy > THRESHOLD) setHidden(!ref.current?.contains(document.activeElement));
        else if (dy < -THRESHOLD) setHidden(false);
        else return; // too small to count: keep the reference point
        lastY = y;
      });
    };
    // A tap (not a drag) anywhere brings it back, as on native reading apps.
    let start: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      start = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) setHidden(false);
      start = null;
    };
    const onJump = () => {
      if (!isNarrow()) return;
      jumpUntil = performance.now() + JUMP_MS;
      setHidden(true);
    };
    // Loaded straight onto a section (#hash, e.g. a reload): it sits flush at the top.
    if (location.hash && location.hash !== '#hero') onJump();
    window.addEventListener(JUMP_EVENT, onJump);
    window.addEventListener('hashchange', onJump); // native #links (back to top, signature)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(JUMP_EVENT, onJump);
      window.removeEventListener('hashchange', onJump);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-hidden={hidden || undefined}
      onFocus={() => setHidden(false)}
      style={{ viewTransitionName: 'site-header' }}
      className="site-header fixed inset-x-0 top-0 z-50 border-b border-border-header bg-paper-fade backdrop-blur-[10px]"
    >
      {children}
    </header>
  );
}
