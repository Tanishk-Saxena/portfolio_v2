import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { caveat, newsreader, plexSans } from '@/lib/fonts';
import { InlineScript } from '@/components/site/inline-script';
import { siteUrl } from '@/lib/site';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const NAME = 'Tanishk Saxena';
const DESCRIPTION =
  'Tanishk Saxena is a frontend engineer in Delhi building quiet, careful software for the web.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${NAME} — Software Engineer`,
    template: `%s — ${NAME}`,
  },
  description: DESCRIPTION,
  authors: [{ name: NAME, url: '/' }],
  creator: NAME,
  openGraph: {
    type: 'website',
    siteName: NAME,
    locale: 'en_GB',
    url: '/',
    title: `${NAME} — Software Engineer`,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e7' },
    { media: '(prefers-color-scheme: dark)', color: '#191714' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-theme="light"
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
