'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Project } from '@/lib/domain/types';
import { formatProjectKind } from '@/lib/utils/format';
import { GitHubIcon, GlobeIcon } from '@/components/ui/icons';

/**
 * Project card (spec §6 ProjectCard, Q15). A stretched <button> opens the modal; the live and
 * source links are *siblings* layered above it, so nothing interactive is nested. At rest only
 * the image shows. The overlay (veil, caption, links) appears on hover or keyboard focus, and
 * is always visible on narrow layouts and touch devices.
 */
const SHOWN =
  'group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 @max-wide/page:opacity-100 [@media(hover:none)]:opacity-100';
const REVEAL = `opacity-0 ${SHOWN}`;
/** Hidden links must not catch clicks meant for the card (mockup: pointer-events none). */
const REVEAL_POINTER =
  'pointer-events-none group-hover:pointer-events-auto group-has-[:focus-visible]:pointer-events-auto @max-wide/page:pointer-events-auto [@media(hover:none)]:pointer-events-auto';
/** Links drop in from 6px above, the caption rises from 8px below (spec §5.3). */
const SETTLE =
  'group-hover:translate-y-0 group-has-[:focus-visible]:translate-y-0 @max-wide/page:translate-y-0 [@media(hover:none)]:translate-y-0';

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (card: HTMLElement) => void;
}) {
  const { title, kind, year, image, liveUrl, repoUrl } = project;

  return (
    <article className="group relative flex-[1_1_100%] rounded-card transition-transform duration-350 ease-out-soft has-[.card-trigger:focus-visible]:outline-2 has-[.card-trigger:focus-visible]:outline-offset-2 has-[.card-trigger:focus-visible]:outline-accent motion-safe:hover:-translate-y-0.75 @wide/page:flex-[0_0_calc((100%-2*var(--spacing-grid-projects))/3)]">
      {/* Lift shadow on its own layer: fading opacity is cheaper than animating box-shadow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card opacity-0 shadow-card-hover transition-opacity duration-350 group-hover:opacity-100"
      />
      <div className="relative aspect-4/3 overflow-hidden rounded-card border border-border-card bg-surface">
        <div className="absolute inset-0 grid place-items-center [transition:filter_.4s_ease,scale_.5s_var(--ease-out-soft)] group-hover:blur-[3px] motion-safe:group-hover:scale-[1.04]">
          {image ? (
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 760px) 360px, 100vw"
              className="object-cover"
              style={{ objectPosition: image.focalPoint }}
            />
          ) : (
            <span className="text-micro tracking-label text-muted uppercase">
              No preview to show
            </span>
          )}
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(12_10_8/.82)_0%,rgb(12_10_8/.62)_50%,rgb(12_10_8/.06)_100%)] transition-opacity duration-350 ${REVEAL}`}
        />

        <button
          type="button"
          data-page-item={index}
          aria-haspopup="dialog"
          onClick={(e) => onOpen(e.currentTarget.closest('article') ?? e.currentTarget)}
          className="card-trigger absolute inset-0 z-1 cursor-pointer focus-visible:outline-none"
        >
          <span className="sr-only">
            {title}, {formatProjectKind(kind)}, {year}. Open details
          </span>
        </button>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-4 bottom-3.5 z-1 flex flex-col gap-0.75 [transition:opacity_.3s_ease,translate_.38s_var(--ease-out-soft)] motion-safe:translate-y-2 ${REVEAL} ${SETTLE}`}
        >
          <span className="line-clamp-2 font-serif text-card-name text-on-accent">{title}</span>
          <span className="text-micro tracking-button text-card-kind uppercase">
            {formatProjectKind(kind)} — {year}
          </span>
        </div>

        {(liveUrl || repoUrl) && (
          <div
            className={`absolute top-2.5 right-2.5 z-2 flex gap-2 [transition:opacity_.3s_ease,translate_.35s_var(--ease-out-soft)] motion-safe:-translate-y-1.5 ${REVEAL} ${REVEAL_POINTER} ${SETTLE}`}
          >
            {liveUrl && (
              <CardLink href={liveUrl} label={`${title} live site`}>
                <GlobeIcon />
              </CardLink>
            )}
            {repoUrl && (
              <CardLink href={repoUrl} label={`${title} source`}>
                <GitHubIcon />
              </CardLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function CardLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      data-ripple="accent-fill"
      className="hit-44 relative grid size-9.5 place-items-center rounded-full bg-card-icon-bg text-card-ink hover:bg-on-accent hover:text-card-ink"
    >
      {children}
    </a>
  );
}
