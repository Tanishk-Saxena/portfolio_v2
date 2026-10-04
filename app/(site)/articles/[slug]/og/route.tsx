import { getRepositories } from '@/lib/container';
import { savedAccent } from '@/lib/og/accent';
import { renderOgCard } from '@/lib/og/og-card';
import { formatLongDate } from '@/lib/utils/format';

// Per-article share card: the title in the article's accent display type. A route handler
// for the same reason as the site's (app/og/route.tsx); the article page's metadata names it.
export async function GET(_request: Request, ctx: RouteContext<'/articles/[slug]/og'>) {
  const { slug } = await ctx.params;
  const repos = getRepositories();
  const [article, profile, accent] = await Promise.all([
    repos.articles.getBySlug(slug),
    repos.profile.get(),
    savedAccent(),
  ]);
  const title = article?.title ?? profile.name;
  return renderOgCard({
    name: profile.name,
    eyebrow: article
      ? `Writing — ${formatLongDate(article.publishedAt)} · ${article.readMinutes} min read`
      : 'Writing',
    title,
    accent,
    titleColor: accent,
    titleSize: title.length > 60 ? 64 : 76,
  });
}

// Prerender one card per on-site article at build time, like the pages themselves.
export async function generateStaticParams() {
  const articles = await getRepositories().articles.list();
  return articles.filter((a) => a.hasBody).map((a) => ({ slug: a.slug }));
}
