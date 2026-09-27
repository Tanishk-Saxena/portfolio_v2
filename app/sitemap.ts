import type { MetadataRoute } from 'next';
import { getRepositories } from '@/lib/container';
import { absoluteUrl } from '@/lib/site';

// The single-page site plus every on-site article (external-only articles live elsewhere).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getRepositories().articles.list();
  const onSite = articles.filter((a) => a.hasBody);
  const latest = onSite[0]?.publishedAt;
  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'monthly', priority: 1 },
    ...onSite.map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: a.publishedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
