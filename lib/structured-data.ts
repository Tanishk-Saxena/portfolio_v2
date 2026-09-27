import type { Article, Experience, Profile, SocialLink } from '@/lib/domain/types';
import { absoluteUrl } from '@/lib/site';

/*
 * schema.org JSON-LD (brief §6 Phase 5): the home page is a ProfilePage about a Person;
 * each on-site article is a BlogPosting by that Person. Google's Rich Results Test
 * recognises both.
 */

type JsonLd = Record<string, unknown>;

/** A profile link counts as `sameAs` only when it points at a profile, not a service's home page. */
const isProfileUrl = (url: string) => {
  try {
    return new URL(url).pathname.replace(/\/+$/, '') !== '';
  } catch {
    return false;
  }
};

export function personJsonLd(
  profile: Profile,
  experience: Experience[],
  links: SocialLink[],
): JsonLd {
  const current = experience.find((e) => e.endDate === null);
  const sameAs = links.map((l) => l.url).filter(isProfileUrl);
  return {
    '@type': 'Person',
    '@id': absoluteUrl('/#person'),
    name: profile.name,
    url: absoluteUrl('/'),
    description: profile.standfirst,
    email: `mailto:${profile.email}`,
    ...(profile.portrait && { image: absoluteUrl(profile.portrait.src) }),
    ...(current && {
      jobTitle: current.role,
      worksFor: { '@type': 'Organization', name: current.org },
    }),
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function profilePageJsonLd(person: JsonLd): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl('/'),
    mainEntity: person,
  };
}

export function blogPostingJsonLd(
  article: Article,
  profile: Profile,
  description?: string,
): JsonLd {
  const url = absoluteUrl(`/articles/${article.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    ...(description && { description }),
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Person',
      '@id': absoluteUrl('/#person'),
      name: profile.name,
      url: absoluteUrl('/'),
    },
  };
}

/** Serialises for a `<script type="application/ld+json">`; `<` escaped so content can't close the tag. */
export const serializeJsonLd = (data: JsonLd) => JSON.stringify(data).replace(/</g, '\\u003c');
