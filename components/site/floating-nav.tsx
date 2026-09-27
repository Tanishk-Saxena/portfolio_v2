'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSectionSpy } from '@/lib/hooks/use-section-spy';
import { jumpTo } from '@/lib/anchor-jump';
import { afterRipple, RIPPLE_MS } from '@/lib/ripple';

const PICKED_FILL = {
  transitionDelay: `${Math.round(RIPPLE_MS * 0.63)}ms`,
  transitionDuration: '1ms', // with 0s the browser skips the delay and fills at once
};
import { arcAngles } from '@/lib/utils/arc';
import { BackToTop } from './back-to-top';
import { CLOSE_ICON, SectionGlyph, type NavSection } from './nav-sections';

/**
 * Floating section navigation (spec §6 FloatingNav, Q26). A round button bottom-right shows
 * the current section's icon; it opens an arc of destinations over a blurred curtain.
 * Appears once the hero is past; sticky, parking above the footer rule.
 *
 * Geometry is pure CSS: each item is rotate(θ) translateX(var(--r)) rotate(-θ), with
 * --r = 250px narrow / 334px wide via the page container query. Phase 4 animates it.
 */
export function FloatingNav({ sections }: { sections: NavSection[] }) {
  const { active, pastHero } = useSectionSpy(sections.map((s) => s.id));

  // The URL follows the section being read, so a reload returns there (owner revision).
  useEffect(() => {
    const hash = pastHero && active ? `#${active}` : ''; // at the top: no hash
    if (location.hash === hash) return;
    history.replaceState(history.state, '', location.pathname + location.search + hash);
  }, [active, pastHero]);

  // Native #hero links (the signature) would leave #hero behind: the top has no hash.
  useEffect(() => {
    const strip = () => {
      if (location.hash === '#hero') {
        history.replaceState(history.state, '', location.pathname + location.search);
      }
    };
    window.addEventListener('hashchange', strip);
    return () => window.removeEventListener('hashchange', strip);
  }, []);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const angles = arcAngles(sections.length);
  // A tapped destination is the selection from the tap on (the old one unfills at once), until
  // the section spy catches up after the jump; then the spy leads again.
  const [picked, setPicked] = useState<string | null>(null);
  if (picked !== null && picked === active) setPicked(null);
  const current = sections.find((s) => s.id === (picked ?? active)) ?? sections[0];
  const shown = pastHero || open;
  const reducedMotion = useReducedMotion();
  const n = sections.length;
  const closeTotal = 1.02 + (n - 1) * 0.07;

  /**
   * The spiral (spec §5.3): each item rides a rotating arm from the button to its place on
   * the arc: rotate(θ + 200° → θ), arm length 0 → r, counter-rotated so the icon stays
   * upright, scaling .35 → 1. It opens on a soft overshoot-free curve with a 62ms stagger,
   * and unwinds in reverse order on close. Reduced motion: items fade in place.
   */
  function spiral(th: number, i: number): CSSProperties {
    const place = `rotate(${th}deg) translateX(var(--r)) rotate(${-th}deg) scale(1)`;
    const tucked = `rotate(${th + 200}deg) translateX(0px) rotate(${-(th + 200)}deg) scale(.35)`;
    const delay = open ? i * 0.062 : (n - 1 - i) * 0.07;
    return {
      transform: open || reducedMotion ? place : tucked,
      opacity: open ? 1 : 0,
      transition: reducedMotion
        ? 'opacity .3s ease'
        : open
          ? `transform .82s var(--ease-spiral-out) ${delay}s, opacity .34s ease ${delay}s`
          : `transform 1.02s var(--ease-spiral-in) ${delay}s, opacity .5s ease ${delay}s`,
    };
  }

  // Escape closes; focus returns to the button that opened the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      fabRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    const first =
      menuRef.current?.querySelector<HTMLElement>('[aria-current="true"]') ??
      menuRef.current?.querySelector<HTMLElement>('a');
    first?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep Tab inside the open menu (items + the close button).
  function trapTab(e: KeyboardEvent) {
    if (!open || e.key !== 'Tab') return;
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? []), fabRef.current];
    const focusables = items.filter((el): el is HTMLElement => el !== null);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Jump, close, and move focus into the destination section.
  function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    setPicked(id);
    afterRipple(e, () => {
      setOpen(false);
      jumpTo(id);
    });
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-55 bg-scrim-nav backdrop-blur-[14px] [transition:opacity_.5s_ease,visibility_0s_linear_var(--vis-delay)] ${open ? '[--vis-delay:0s]' : 'pointer-events-none invisible opacity-0 [--vis-delay:.5s]'}`}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[calc(var(--spacing-float)+114px)] z-60 flex flex-col items-end justify-end pr-float">
        <div className="pointer-events-auto sticky bottom-float size-14.5" onKeyDown={trapTab}>
          <nav
            id={menuId}
            ref={menuRef}
            aria-label="Sections"
            inert={!open}
            // Stay visible until the last item has unwound, then hide.
            style={{ transition: `visibility 0s linear ${open ? 0 : closeTotal}s` }}
            className={`[--r:250px] @wide/page:[--r:334px] ${open ? '' : 'invisible'}`}
          >
            <ul>
              {sections.map((section, i) => {
                const on = section.id === current.id;
                // Just picked: its fill snaps in underneath once the ripple covers nearly all
                // of it, so the ripple then fades over the same colour (no flicker).
                const justPicked = on && section.id === picked;
                return (
                  <li
                    key={section.id}
                    style={spiral(angles[i], i)}
                    className="absolute top-1/2 left-1/2 -mt-5.5 -ml-5.5 size-11"
                  >
                    <a
                      href={`#${section.id}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={(e) => go(e, section.id)}
                      data-ripple={on ? 'paper' : 'accent-fill'}
                      style={justPicked ? PICKED_FILL : undefined}
                      className={`relative grid size-11 place-items-center rounded-full border shadow-float transition-[background-color,color,border-color] duration-250 ${on ? 'border-accent-fill bg-accent-fill text-on-accent hover:text-on-accent' : 'border-border-navdot bg-paper text-ink hover:border-accent active:text-on-accent'}`}
                    >
                      <SectionGlyph d={section.icon} />
                      <span
                        className={`absolute top-[calc(100%+5px)] left-1/2 -translate-x-1/2 rounded-pill border px-1.75 py-0.75 text-nav font-medium tracking-nav whitespace-nowrap uppercase ${on ? 'border-accent-fill bg-accent-fill text-on-accent' : 'border-border-card bg-paper text-ink'}`}
                      >
                        {section.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <BackToTop visible={pastHero && !open} />

          <button
            ref={fabRef}
            type="button"
            aria-label="Jump to section"
            aria-expanded={open}
            aria-controls={menuId}
            inert={!shown}
            onClick={() => {
              setPicked(null);
              setOpen((o) => !o);
            }}
            data-ripple="paper"
            className={`absolute inset-0 grid cursor-pointer place-items-center rounded-full bg-ink text-paper shadow-fab [transition:background-color_.4s_ease,color_.4s_ease,opacity_.35s_ease,scale_.4s_var(--ease-out-soft),visibility_0s_linear_var(--vis-delay)] hover:opacity-92 active:text-ink ${shown ? '[--vis-delay:0s]' : 'invisible opacity-0 [--vis-delay:.4s] motion-safe:scale-70'}`}
          >
            {/* The glyph swaps to × and turns a quarter (spec §5.3 FAB icon). */}
            <span
              className={`grid place-items-center transition-transform duration-500 ease-out-soft motion-reduce:transition-none ${open ? 'motion-safe:rotate-90' : ''}`}
            >
              <SectionGlyph d={open ? CLOSE_ICON : current.icon} size={22} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
