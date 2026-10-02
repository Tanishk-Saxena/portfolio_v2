import { getRepositories } from '@/lib/container';
import { savedAccent } from '@/lib/og/accent';
import { OG_SIZE, renderOgCard } from '@/lib/og/og-card';

// Site-wide share card: the hero, as a 1200×630 image. Articles override it.
export const alt = 'Tanishk Saxena — portfolio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  const [profile, accent] = await Promise.all([getRepositories().profile.get(), savedAccent()]);
  return renderOgCard({
    accent,
    name: profile.name,
    eyebrow: profile.eyebrow,
    title: profile.headline,
    highlight: profile.headlineHighlight,
  });
}
