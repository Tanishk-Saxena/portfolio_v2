import type { CSSProperties } from 'react';
import type { Profile } from '@/lib/domain/types';
import { splitHighlight } from '@/lib/utils/split-highlight';
import { DownloadIcon } from '@/components/ui/icons';
import { ScrollCue } from './scroll-cue';

/** Stagger offsets after --enter (spec §5.3 hero entrance: .05 / .14 / .24 / .34s). */
const offset = (s: number) => ({ '--enter-offset': `${s}s` }) as CSSProperties;

/** Hero (spec §7): eyebrow, poster-scale line with one handwritten word, standfirst, CTAs. */
export function Hero({ profile }: { profile: Profile }) {
  const { before, word, after } = splitHighlight(profile.headline, profile.headlineHighlight);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      // Bottom padding: the mockup's 78px, or enough to keep long copy clear of the scroll cue
      // (cue offset + 42px glyph + 10px gap + label + breathing room), whichever is larger.
      className="relative measure-page flex min-h-svh flex-col justify-center pt-29 pb-[max(78px,calc(clamp(22px,4vh,38px)+84px))]"
    >
      <p
        className="enter-fade mb-7 text-label tracking-eyebrow text-muted uppercase"
        style={offset(0.05)}
      >
        {profile.eyebrow}
      </p>

      {/* LCP element: rises but is never transparent (Q9 R2). */}
      <h1
        id="hero-heading"
        className="enter-rise max-w-hero-title font-serif text-display font-light text-pretty text-ink"
        style={offset(0.14)}
      >
        {before}
        {word && (
          <em className="mx-[-0.04em] inline-block rounded-sm bg-accent-fill pt-[.04em] pr-[.16em] pb-[.1em] pl-[.14em] align-[-.03em] font-script text-[1.1em] leading-[.84] font-semibold text-on-accent not-italic">
            {word}
          </em>
        )}
        {after}
      </h1>

      <p
        className="enter-fade mt-8 max-w-hero-standfirst text-body-lg text-muted"
        style={offset(0.24)}
      >
        {profile.standfirst}
      </p>

      <div className="enter-fade mt-11 flex flex-wrap gap-3" style={offset(0.34)}>
        {profile.resumeUrl && (
          <a
            href={profile.resumeUrl}
            download
            data-ripple="paper"
            className="inline-flex h-12.5 items-center gap-2.5 rounded-pill border border-accent-fill bg-accent-fill px-6 text-body-sm font-medium text-on-accent transition-[translate,opacity,background-color,color] duration-250 hover:text-on-accent hover:opacity-92 active:translate-y-0 active:text-accent active:duration-180 motion-safe:hover:-translate-y-0.5"
          >
            Download résumé
            <DownloadIcon />
          </a>
        )}
        {profile.ctaLabel && (
          <a
            href="#contact"
            data-ripple="accent-fill"
            className="inline-flex h-12.5 items-center rounded-pill border border-border-control px-6 text-body-sm transition-[border-color,background-color,color] duration-250 hover:border-accent active:border-accent-fill active:text-on-accent active:duration-180"
          >
            {profile.ctaLabel}
          </a>
        )}
      </div>

      <ScrollCue />
    </section>
  );
}
