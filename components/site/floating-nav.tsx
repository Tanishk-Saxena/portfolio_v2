'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useSectionHash } from '@/lib/hooks/use-section-hash';
import { useSectionSpy } from '@/lib/hooks/use-section-spy';
import { jumpTo } from '@/lib/anchor-jump';
import type { MenuLayout, NavPosition } from '@/lib/domain/types';
import { navAngles } from '@/lib/utils/arc';
import { BackToTop } from './back-to-top';
import { closeDuration, curtain, dockRewind, spiral, WHEEL_DOCK } from './nav-motion';
import { CLOSE_ICON, SectionGlyph, type NavSection } from './nav-sections';

/**
 * Floating section navigation (spec §6 FloatingNav, Q26). A round button (bottom right, or
 * bottom centre) shows the current section's icon; it opens an arc of destinations, or a
 * full wheel round the screen's centre, over a blurred curtain (Settings, ADMIN-DESIGN-SPEC
 * §8.9). Appears once the hero is past; sticky, parking above the footer rule.
 *
 * Geometry is pure CSS: each item is rotate(θ) translateX(var(--r)) rotate(-θ), with
 * --r = 250px narrow / 334px wide via the page container query (the wheel: 150px at every
 * width). Phase 4 animates it.
 */
export function FloatingNav({
  sections,
  position = 'right',
  layout = 'arc',
}: {
  sections: NavSection[];
  position?: NavPosition;
  layout?: MenuLayout;
}) {
  const { active, pastHero } = useSectionSpy(sections.map((s) => s.id));

  useSectionHash(active, pastHero);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const angles = navAngles(sections.length, position, layout);
  const right = position === 'right';
  const wheel = layout === 'wheel';
  // A tapped destination is the selection from the tap on (the old one unfills at once), until
  // the section spy catches up after the jump; then the spy leads again.
  const [picked, setPicked] = useState<string | null>(null);
  if (picked !== null && picked === active) setPicked(null);
  const current = sections.find((s) => s.id === (picked ?? active)) ?? sections[0];
  const shown = pastHero || open;
  const reducedMotion = useReducedMotion();
  // Reduced motion: the items only fade (.3s), so the close is over by then.
  const closeTotal = reducedMotion ? 0.3 : closeDuration(sections.length);

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
    setOpen(false);
    jumpTo(id);
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{ transition: curtain(open, closeTotal, reducedMotion) }}
        className={`fixed inset-0 z-55 bg-scrim-nav backdrop-blur-[14px] ${open ? '' : 'pointer-events-none invisible opacity-0'}`}
      />

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-60 flex flex-col justify-end ${right ? 'bottom-[calc(var(--spacing-float)+114px)] items-end pr-float' : 'bottom-[calc(var(--spacing-float)+30px)] items-center'}`}
      >
        <div
          className="pointer-events-auto sticky bottom-float size-14.5 transition-transform duration-[calc(720ms*var(--motion))] ease-spiral-out"
          // The wheel opens round the screen's centre: the dock slides there (spec §5.3), and
          // goes home as that slide rewound (owner, spec §10).
          style={
            wheel
              ? open
                ? { transform: WHEEL_DOCK[position] }
                : reducedMotion
                  ? undefined
                  : dockRewind(sections.length)
              : undefined
          }
          onKeyDown={trapTab}
        >
          <nav
            id={menuId}
            ref={menuRef}
            aria-label="Sections"
            inert={!open}
            // Stay visible until the last item has unwound, then hide.
            style={{ transition: `visibility 0s linear ${open ? 0 : closeTotal}s` }}
            className={`${wheel ? '[--r:150px]' : '[--r:250px] @wide/page:[--r:334px]'} ${open ? '' : 'invisible'}`}
          >
            <ul>
              {sections.map((section, i) => {
                const on = section.id === current.id;
                return (
                  <li
                    key={section.id}
                    style={spiral(angles[i], i, sections.length, open, reducedMotion)}
                    className="absolute top-1/2 left-1/2 -mt-5.5 -ml-5.5 size-11"
                  >
                    <a
                      href={`#${section.id}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={(e) => go(e, section.id)}
                      data-ripple={on ? 'paper' : 'accent-fill'}
                      className={`relative grid size-11 place-items-center rounded-full border shadow-float transition-[background-color,color,border-color] duration-250 ${on ? 'border-accent-fill bg-accent-fill text-on-accent hover:text-on-accent' : 'border-border-navdot bg-paper text-ink hover:border-accent'}`}
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
            className={`absolute inset-0 grid cursor-pointer place-items-center rounded-full bg-ink text-paper shadow-fab [transition:background-color_.4s_ease,color_.4s_ease,opacity_.35s_ease,scale_.4s_var(--ease-out-soft),visibility_0s_linear_var(--vis-delay)] hover:opacity-92 ${shown ? '[--vis-delay:0s]' : 'invisible opacity-0 [--vis-delay:.4s] motion-safe:scale-70'}`}
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
