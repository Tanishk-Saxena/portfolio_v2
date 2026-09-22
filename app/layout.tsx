import type { Metadata, Viewport } from 'next';
import { caveat, newsreader, plexSans } from '@/lib/fonts';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tanishk Saxena — Software Engineer',
    template: '%s — Tanishk Saxena',
  },
  description:
    'Tanishk Saxena is a frontend engineer in Delhi building quiet, careful software for the web.',
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
