'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { Project } from '@/lib/domain/types';
import { formatProjectKind } from '@/lib/utils/format';
import { CloseIcon, GitHubIcon, GlobeIcon } from '@/components/ui/icons';

const CLOSE_MS = 320; // spec §5.3: unmount after the reverse animation

export interface ModalOrigin {
  x: number;
  y: number;
  s: number;
}

/**
 * Where the modal scales out of: the clicked card, relative to the viewport centre.
 * Computed at click time, so the dialog's very first frame is already at the right card.
 */
export function originFrom(card: HTMLElement): ModalOrigin {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { x: 0, y: 0, s: 1 }; // reduced motion: fade only
  }
  const rect = card.getBoundingClientRect();
  return {
    x: Math.round(rect.left + rect.width / 2 - window.innerWidth / 2),
    y: Math.round(rect.top + rect.height / 2 - window.innerHeight / 2),
    s: Math.max(0.22, Math.min(0.8, rect.height / Math.min(window.innerHeight * 0.8, 620))),
  };
}

/**
 * Project modal (spec §6 ProjectModal, Q16). Native <dialog> + showModal(): focus trap,
 * Escape, inert background and focus return to the trigger come from the platform.
 * Scales out of the clicked card and back into it on close (spec §5 "Signature moments" 3).
 * It starts at 880×420 wide / 420×600 narrow and grows with its copy up to 88svh (owner, spec
 * §10), so a full description never scrolls; past that the body scrolls, with a thin bar in
 * the theme's colours, so over-long copy is never cut off.
 */
export function ProjectModal({
  project,
  origin,
  onClose,
}: {
  project: Project | null;
  origin: ModalOrigin;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [shown, setShown] = useState(false);
  const from = origin;

  useEffect(() => {
    const dialog = ref.current;
    if (!project || !dialog || dialog.open) return;
    // This render already placed the (closed) dialog at the card; open it there, then
    // transition to the centre two frames later.
    dialog.showModal();
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [project]);

  function close() {
    setShown(false);
    window.setTimeout(() => ref.current?.close(), CLOSE_MS);
  }

  const style: CSSProperties = {
    transform: shown ? 'none' : `translate(${from.x}px, ${from.y}px) scale(${from.s})`,
    opacity: shown ? 1 : 0,
    transition: `transform .46s var(--ease-out-soft), opacity .3s ease`,
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      data-state={shown ? 'in' : 'out'}
      style={style}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault(); // Escape: animate out first
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // backdrop click
      }}
      className="project-modal m-auto max-h-none w-[min(420px,100%-2*var(--spacing-stage))] max-w-none overflow-hidden rounded-modal border border-border-card bg-paper p-0 text-ink shadow-modal @wide/page:w-[min(880px,100%-2*var(--spacing-stage))]"
    >
      {project && (
        <div className="flex max-h-[88svh] min-h-[min(600px,88svh)] flex-col @wide/page:min-h-[min(420px,88svh)] @wide/page:flex-row">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            data-ripple="ink"
            className="hit-44 absolute top-3 right-3 z-2 grid size-9.5 cursor-pointer place-items-center rounded-full border border-border-close bg-paper text-ink hover:border-accent active:text-paper"
          >
            <CloseIcon />
          </button>

          <div className="relative grid aspect-video w-full flex-none place-items-center border-b border-border-divider bg-surface @wide/page:aspect-auto @wide/page:w-98 @wide/page:self-stretch @wide/page:border-r @wide/page:border-b-0">
            {project.image ? (
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                sizes="(min-width: 760px) 392px, 420px"
                className="object-cover"
                style={{ objectPosition: project.image.focalPoint }}
              />
            ) : (
              <span className="text-micro tracking-label text-muted uppercase">
                No preview to show
              </span>
            )}
          </div>

          <div className="themed-scroll flex min-h-0 min-w-0 flex-auto flex-col justify-start gap-3 overflow-y-auto p-5 @wide/page:justify-center @wide/page:gap-3.5 @wide/page:p-8">
            <span className="text-micro tracking-label text-accent uppercase">
              {formatProjectKind(project.kind)}
            </span>
            {/* The year sits under the name: beside the type it ran under the close button. */}
            <div className="flex flex-col gap-1">
              <h3
                id={titleId}
                className="font-serif text-modal-title @wide/page:text-modal-title-wide"
              >
                {project.title}
              </h3>
              <span className="text-label text-muted tabular-nums">{project.year}</span>
            </div>
            {project.description && (
              <p className="text-body-sm text-muted @wide/page:text-body">{project.description}</p>
            )}
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Built with">
                {project.tags.slice(0, 3).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-pill border border-border-header px-2.75 py-1.5 text-label tracking-tag text-accent"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1 flex flex-wrap gap-2.5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-ripple="paper"
                  className="inline-flex h-11 items-center gap-2.25 rounded-pill bg-accent-fill px-4.5 text-meta text-on-accent hover:text-on-accent hover:opacity-92 active:text-accent"
                >
                  <GlobeIcon />
                  Live site<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-ripple="ink"
                  className="inline-flex h-11 items-center gap-2.25 rounded-pill border border-border-quiet px-4.5 text-meta text-ink hover:border-accent active:text-paper"
                >
                  <GitHubIcon />
                  Source<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
