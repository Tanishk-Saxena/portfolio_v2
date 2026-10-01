import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ArticleBody } from '@/components/article/article-body';
import { ArticleEntrance } from '@/components/article/article-entrance';
import { BackLink } from '@/components/article/back-link';
import { ListenButton } from '@/components/article/listen-button';
import { HomeLink } from '@/components/site/home-link';
import { JsonLd } from '@/components/site/json-ld';
import { PageTransition } from '@/components/site/page-transition';
import { SiteHeader } from '@/components/site/site-header';
import { getRepositories } from '@/lib/container';
import type { Article } from '@/lib/domain/types';
import { newsreaderItalic, plexMono } from '@/lib/fonts';
import { blogPostingJsonLd } from '@/lib/structured-data';
import { formatLongDate } from '@/lib/utils/format';
import { plainExcerpt } from '@/lib/utils/markdown';

// One static page per on-site article (spec §7; brief §5 nullable-body pattern).
export async function generateStaticParams() {
  const articles = await getRepositories().articles.list();
  return articles.filter((a) => a.hasBody).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const repos = getRepositories();
  const [article, profile] = await Promise.all([
    repos.articles.getBySlug(slug),
    repos.profile.get(),
  ]);
  if (!article) return {};
  const path = `/articles/${article.slug}`;
  const description = describe(article);
  return {
    title: article.title,
    description,
    alternates: { canonical: path },
    // Replaces the root openGraph wholesale (metadata merges shallowly), so restate the basics.
    openGraph: {
      type: 'article',
      siteName: profile.name,
      locale: 'en_GB',
      url: path,
      title: article.title,
      description,
      publishedTime: article.publishedAt,
    },
  };
}

const describe = (article: Article) =>
  article.excerpt || (article.body ? plainExcerpt(article.body) : undefined);

export default async function ArticlePage(props: PageProps<'/articles/[slug]'>) {
  const { slug } = await props.params;
  const repos = getRepositories();
  const [article, profile] = await Promise.all([
    repos.articles.getBySlug(slug),
    repos.profile.get(),
  ]);

  if (!article) notFound();
  if (!article.hasBody || !article.body) {
    if (article.externalUrl) redirect(article.externalUrl);
    notFound();
  }

  return (
    <>
      <JsonLd data={blogPostingJsonLd(article, profile, describe(article))} />
      <SiteHeader name={profile.name} onHome={false} />
      <PageTransition>
        <main
          className={`measure-article pt-article-top pb-article-bottom ${plexMono.variable} ${newsreaderItalic.variable}`}
        >
          <BackLink />

          <article id="article">
            <h1 className="max-w-article-title font-serif text-h1 font-light text-pretty text-accent">
              {article.title}
            </h1>

            <div className="mt-article-meta-top flex flex-wrap items-center gap-x-4.5 gap-y-2.5 border-b border-border-article pb-article-meta-bottom text-small text-muted">
              <time dateTime={article.publishedAt}>{formatLongDate(article.publishedAt)}</time>
              <span aria-hidden="true" className="size-0.75 rounded-full bg-muted" />
              <span>{article.readMinutes} min read</span>
              {article.listen && <ListenButton targetId="article" />}
            </div>

            <ArticleBody markdown={article.body} />
          </article>
          <ArticleEntrance />

          <footer className="mt-article-footer-top flex flex-wrap items-center justify-between gap-3.5 border-t border-border-article pt-article-meta-bottom text-small">
            <span className="text-muted">Written by {profile.name}</span>
            <HomeLink
              href="/#writing"
              className="hit-44 relative inline-flex items-center text-accent transition-colors duration-200 active:text-ink"
            >
              More writing
            </HomeLink>
          </footer>
        </main>
      </PageTransition>
    </>
  );
}
