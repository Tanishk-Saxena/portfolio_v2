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
      className="band scroll-mt-header bg-accent-fill py-band text-ink transition-colors duration-450"
    >
      <div className="measure-page">
        <SectionHeading id="about-heading">About</SectionHeading>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] items-start gap-grid-about">
          <div className="relative grid aspect-4/5 max-w-90 place-items-center overflow-hidden rounded-sm border border-border-header bg-surface">
            {portrait ? (
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                sizes="(min-width: 760px) 360px, 100vw"
                className="object-cover"
                style={{ objectPosition: portrait.focalPoint }}
              />
            ) : (
              <span className="text-micro tracking-label text-ink uppercase">Portrait</span>
            )}
          </div>

          <div className="max-w-[60ch]">
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
