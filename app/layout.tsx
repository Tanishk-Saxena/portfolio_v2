import type { CSSProperties } from 'react';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { caveat, newsreader, plexSans } from '@/lib/fonts';
import { InlineScript } from '@/components/site/inline-script';
import { getRepositories } from '@/lib/container';
import { OG_SIZE } from '@/lib/og/size';
import { siteUrl } from '@/lib/site';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

/**
 * The site's metadata, from the admin (Phase 9 roadmap item 24): Settings holds the title and
 * description; the profile's Name is the author, the site name and the suffix of every other
 * page's title ("Article — Name").
 */
export async function generateMetadata(): Promise<Metadata> {
  const repos = getRepositories();
  const [settings, profile] = await Promise.all([repos.settings.get(), repos.profile.get()]);
  const { siteTitle: title, siteDescription: description } = settings;
  return {
    metadataBase: siteUrl,
    title: { default: title, template: `%s — ${profile.name}` },
    description,
    authors: [{ name: profile.name, url: '/' }],
    creator: profile.name,
    openGraph: {
      type: 'website',
      siteName: profile.name,
      locale: 'en_GB',
      url: '/',
      title,
      description,
      images: [{ url: '/og', ...OG_SIZE, alt: `${profile.name} — portfolio` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e7' },
    { media: '(prefers-color-scheme: dark)', color: '#191714' },
  ],
};

/**
 * The saved style settings (ADMIN-DESIGN-SPEC §8.9) that reach every page: the accent
 * (`data-accent`, styles/tokens.css), the press feedback (`data-press`) and the grain's opacity. Defaults are the shipped look.
 */
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const settings = await getRepositories().settings.get();
  return (
    <html
      lang="en"
      data-theme="light"
      data-accent={settings.accent}
      data-press={settings.pressFeedback}
      style={{ '--grain-opacity': settings.grain / 100 } as CSSProperties}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${newsreader.variable} ${plexSans.variable} ${caveat.variable}`}
    >
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body className="font-sans">
        {children}
        {/* Cookieless page views and real-user Web Vitals; both inert off Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
