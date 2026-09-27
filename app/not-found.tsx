import type { Metadata } from 'next';
import { HomeLink } from '@/components/site/home-link';
import { RippleHost } from '@/components/site/ripple-host';
import { SiteHeader } from '@/components/site/site-header';
import { getRepositories } from '@/lib/container';

export const metadata: Metadata = { title: 'Not found' };

/**
 * 404 (owner revision, spec §10): any unknown URL, including an article that has since been
 * taken down. Same shell and type as an article, one line of apology, and a way back to the
 * writing list.
 */
export default async function NotFound() {
  const profile = await getRepositories().profile.get();

  return (
    <div className="@container/page relative min-h-svh overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      <SiteHeader name={profile.name} onHome={false} />
      <main className="measure-article pt-article-top pb-article-bottom">
        <p className="mb-7 text-label tracking-eyebrow text-muted uppercase">
          <span className="mr-1 font-serif text-h3-post tracking-normal text-accent">404</span> ·
          Not found
        </p>
        <h1 className="max-w-article-title font-serif text-h1 font-light text-pretty text-accent">
          This page has wandered off.
        </h1>
        <p className="mt-6 max-w-[46ch] text-body text-muted">
          The article may have been taken down, or the link is off by a letter or two. The rest of
          the writing is still where it was.
        </p>
        <HomeLink
          href="/#writing"
          data-ripple="paper"
          className="mt-10 inline-flex h-12.5 items-center rounded-pill border border-accent-fill bg-accent-fill px-6 text-body-sm font-medium text-on-accent transition-[opacity,color] duration-250 hover:text-on-accent hover:opacity-92 active:text-accent"
        >
          Back to writing
        </HomeLink>
      </main>
      <RippleHost />
    </div>
  );
}
