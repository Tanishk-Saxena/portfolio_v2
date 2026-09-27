/*
 * The site's public origin, for absolute URLs (canonical, Open Graph, sitemap, JSON-LD).
 *
 *   NEXT_PUBLIC_SITE_URL           explicit, e.g. the custom domain (wins)
 *   VERCEL_PROJECT_PRODUCTION_URL  set by Vercel: the production domain, even on previews
 *   otherwise                      http://localhost:3000
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL('http://localhost:3000');
}

export const siteUrl = resolveSiteUrl();

/** Absolute URL for a site path. */
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
