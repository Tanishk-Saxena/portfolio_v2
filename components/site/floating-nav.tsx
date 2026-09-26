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
import { useSectionSpy } from '@/lib/hooks/use-section-spy';
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
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const angles = arcAngles(sections.length);
  const current = sections.find((s) => s.id === active) ?? sections[0];
  const shown = pastHero || open;

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
    setOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    history.pushState(null, '', `#${id}`);
    target.scrollIntoView();
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-55 bg-scrim-nav backdrop-blur-[14px] ${open ? '' : 'pointer-events-none invisible opacity-0'}`}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[calc(var(--spacing-float)+114px)] z-60 flex flex-col items-end justify-end pr-float">
        <div className="pointer-events-auto sticky bottom-float size-14.5" onKeyDown={trapTab}>
          <nav
            id={menuId}
            ref={menuRef}
            aria-label="Sections"
            inert={!open}
            className={`[--r:250px] @wide/page:[--r:334px] ${open ? '' : 'invisible'}`}
          >
            <ul>
              {sections.map((section, i) => {
                const on = section.id === current.id;
                return (
                  <li
                    key={section.id}
                    style={{ '--th': `${angles[i]}deg` } as CSSProperties}
                    className="absolute top-1/2 left-1/2 -mt-5.5 -ml-5.5 size-11 [transform:rotate(var(--th))_translateX(var(--r))_rotate(calc(var(--th)*-1))]"
                  >
                    <a
                      href={`#${section.id}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={(e) => go(e, section.id)}
                      className={`relative grid size-11 place-items-center rounded-full border shadow-float ${on ? 'border-accent-fill bg-accent-fill text-on-accent hover:text-on-accent' : 'border-border-navdot bg-paper text-ink hover:border-accent'}`}
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
            onClick={() => setOpen((o) => !o)}
            className={`absolute inset-0 grid cursor-pointer place-items-center rounded-full bg-ink text-paper shadow-fab hover:opacity-92 active:bg-paper active:text-ink ${shown ? '' : 'invisible scale-70 opacity-0'}`}
          >
            <SectionGlyph d={open ? CLOSE_ICON : current.icon} size={22} />
          </button>
        </div>
      </div>
    </>
  );
}
