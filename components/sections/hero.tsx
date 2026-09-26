import type { Profile } from '@/lib/domain/types';
import { splitHighlight } from '@/lib/utils/split-highlight';
import { DownloadIcon, MouseIcon } from '@/components/ui/icons';

/** Hero (spec §7): eyebrow, poster-scale line with one handwritten word, standfirst, CTAs. */
export function Hero({ profile }: { profile: Profile }) {
  const { before, word, after } = splitHighlight(profile.headline, profile.headlineHighlight);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      // Bottom padding: the mockup's 78px, or enough to keep long copy clear of the scroll cue
      // (cue offset + 42px glyph + 10px gap + label + breathing room), whichever is larger.
      className="relative measure-page flex min-h-svh scroll-mt-header flex-col justify-center pt-29 pb-[max(78px,calc(clamp(22px,4vh,38px)+84px))]"
    >
      <p className="mb-7 text-label tracking-eyebrow text-muted uppercase">{profile.eyebrow}</p>

      <h1
        id="hero-heading"
        className="max-w-[16ch] font-serif text-display font-light text-pretty text-ink"
      >
        {before}
        {word && (
          <em className="-mx-[.04em] inline-block rounded-sm bg-accent-fill pt-[.04em] pr-[.16em] pb-[.1em] pl-[.14em] align-[-.03em] font-script text-[1.1em] leading-[.84] font-semibold text-on-accent not-italic">
            {word}
          </em>
        )}
        {after}
      </h1>

      <p className="mt-8 max-w-[52ch] text-body-lg text-muted">{profile.standfirst}</p>

      <div className="mt-11 flex flex-wrap gap-3">
        {profile.resumeUrl && (
          <a
            href={profile.resumeUrl}
            download
            className="inline-flex h-12.5 items-center gap-2.5 rounded-pill border border-accent-fill bg-accent-fill px-6 text-body-sm font-medium text-on-accent hover:text-on-accent hover:opacity-92 active:bg-paper active:text-accent"
          >
            Download résumé
            <DownloadIcon />
          </a>
        )}
        <a
          href="#contact"
          className="inline-flex h-12.5 items-center rounded-pill border border-border-control px-6 text-body-sm hover:border-accent active:border-accent-fill active:bg-accent-fill active:text-on-accent"
        >
          Get in touch
        </a>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[clamp(22px,4vh,38px)] left-1/2 flex w-15 -translate-x-1/2 flex-col items-center gap-2.5 text-muted"
      >
        <MouseIcon />
        <span className="text-cue tracking-cue uppercase">Scroll</span>
      </div>
    </section>
  );
}
