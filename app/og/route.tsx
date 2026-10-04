import { getRepositories } from '@/lib/container';
import { savedAccent } from '@/lib/og/accent';
import { renderOgCard } from '@/lib/og/og-card';

/*
 * Site-wide share card: the hero, as a 1200×630 image. Articles have their own. A route
 * handler, not the `opengraph-image` file convention: that convention's alt text is a
 * constant, and this one carries the profile's Name (set beside the URL in the root
 * layout's metadata).
 */
export async function GET() {
  const [profile, accent] = await Promise.all([getRepositories().profile.get(), savedAccent()]);
  return renderOgCard({
    accent,
    name: profile.name,
    eyebrow: profile.eyebrow,
    title: profile.headline,
    highlight: profile.headlineHighlight,
  });
}
