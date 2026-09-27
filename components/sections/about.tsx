import Image from 'next/image';
import type { Profile } from '@/lib/domain/types';
import { SectionHeading } from './section';

/** About (spec §7): full-bleed accent band, portrait beside a lead line and paragraphs. */
export function About({ profile }: { profile: Profile }) {
  const { portrait } = profile;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="band bg-accent-fill pt-band-about pb-band text-ink transition-colors duration-450 @wide/page:scroll-mt-header"
    >
      <div data-reveal-group className="measure-page">
        <SectionHeading id="about-heading">About</SectionHeading>

        <div className="grid items-start gap-grid-about @wide/page:grid-cols-[var(--spacing-portrait-wide)_minmax(0,1fr)] @wide/page:items-center">
          <div className="relative mx-auto grid aspect-4/5 w-full max-w-(--spacing-portrait) place-items-center overflow-hidden rounded-sm border border-border-header bg-surface @wide/page:mx-0 @wide/page:max-w-none">
            {portrait ? (
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                sizes="(min-width: 760px) 360px, 224px"
                className="object-cover"
                style={{ objectPosition: portrait.focalPoint }}
              />
            ) : (
              <span className="text-micro tracking-label text-ink uppercase">Portrait</span>
            )}
          </div>

          <div className="max-w-[60ch] @wide/page:max-w-none">
            <p className="mb-7 font-serif text-lead font-light text-pretty">{profile.aboutLead}</p>
            {profile.aboutParagraphs.map((paragraph, i) => (
              <p key={i} className="mb-5 text-body text-muted last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
