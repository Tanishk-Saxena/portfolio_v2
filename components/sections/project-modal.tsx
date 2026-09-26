'use client';

import Image from 'next/image';
import { useEffect, useId, useRef } from 'react';
import type { Project } from '@/lib/domain/types';
import { formatProjectKind } from '@/lib/utils/format';
import { CloseIcon, GitHubIcon, GlobeIcon } from '@/components/ui/icons';

/**
 * Project modal (spec §6 ProjectModal, Q16). Native <dialog> + showModal(): focus trap,
 * Escape, inert background and focus return to the trigger come from the platform.
 * Fixed size (880×420 wide, 420×600 narrow, both capped at 88svh). The body can scroll
 * as a last resort so over-long copy never gets cut off.
 */
export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (project && dialog && !dialog.open) dialog.showModal();
  }, [project]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close(); // backdrop click
      }}
      className="m-auto h-[min(600px,88svh)] max-h-none w-[min(420px,100%-2*var(--spacing-stage))] max-w-none overflow-hidden rounded-modal border border-border-card bg-paper p-0 text-ink shadow-modal backdrop:bg-scrim-modal backdrop:backdrop-blur-[16px] @wide/page:h-[min(420px,88svh)] @wide/page:w-[min(880px,100%-2*var(--spacing-stage))]"
    >
      {project && (
        <div className="flex h-full flex-col @wide/page:flex-row">
          <button
            type="button"
            aria-label="Close"
            onClick={() => ref.current?.close()}
            className="hit-44 absolute top-3 right-3 z-2 grid size-9.5 cursor-pointer place-items-center rounded-full border border-border-close bg-paper text-ink hover:border-accent active:bg-ink active:text-paper"
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
              <span className="text-micro tracking-label text-muted uppercase">Project image</span>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-auto flex-col justify-start gap-3 overflow-y-auto p-5 @wide/page:justify-center @wide/page:gap-3.5 @wide/page:p-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
              <span className="text-micro tracking-label text-accent uppercase">
                {formatProjectKind(project.kind)}
              </span>
              <span className="ml-auto text-label text-muted tabular-nums">{project.year}</span>
            </div>
            <h3
              id={titleId}
              className="font-serif text-modal-title @wide/page:text-modal-title-wide"
            >
              {project.title}
            </h3>
            <p className="text-body-sm text-muted @wide/page:text-body">
              {project.description || project.summary}
            </p>
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
                  className="inline-flex h-11 items-center gap-2.25 rounded-pill bg-accent-fill px-4.5 text-meta text-on-accent hover:text-on-accent hover:opacity-92 active:bg-paper active:text-accent"
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
                  className="inline-flex h-11 items-center gap-2.25 rounded-pill border border-border-quiet px-4.5 text-meta text-ink hover:border-accent active:bg-ink active:text-paper"
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
