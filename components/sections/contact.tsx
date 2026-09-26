import { Fragment } from 'react';
import type { Profile, SocialLink } from '@/lib/domain/types';
import { SectionHeading } from './section';

/** Long addresses wrap after "@" and "." first, before breaking anywhere else. */
function withBreaks(email: string) {
  return email.split(/(?<=[@.])/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

/** Contact (spec §7): accent band, one sentence, the address at display size, socials. */
export function Contact({ profile, links }: { profile: Profile; links: SocialLink[] }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="band scroll-mt-header bg-accent-fill pt-band pb-band-end text-ink transition-colors duration-450"
    >
      <div className="measure-page">
        <SectionHeading id="contact-heading">Contact</SectionHeading>
        <p className="max-w-[18ch] font-serif text-statement font-light text-pretty">
          {profile.contactStatement}
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-9 inline-block border-b border-border-control pb-1 font-serif text-email wrap-anywhere text-accent transition-colors duration-300 hover:border-accent"
        >
          {withBreaks(profile.email)}
        </a>
        {links.length > 0 && (
          <ul className="mt-13 flex flex-wrap gap-x-7 text-body-sm text-muted">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center"
                >
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
