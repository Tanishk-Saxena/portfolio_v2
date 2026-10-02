import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SIGNATURE_PATH } from '@/components/site/signature-mark';
import { siteUrl } from '@/lib/site';
import { splitHighlight } from '@/lib/utils/split-highlight';

/*
 * Share cards (Open Graph / Twitter), rendered at build time by `next/og`. They echo the
 * hero in light mode: paper, the signature, a micro-caps eyebrow and the display line.
 * Static TTFs live in assets/og-fonts (OFL); they are never sent to visitors.
 */

export const OG_SIZE = { width: 1200, height: 630 };

// Light-mode token values (styles/tokens.css); CSS variables don't exist inside next/og.
const C = {
  paper: '#f5f0e7',
  ink: '#23201c',
  muted: '#6d655c',
  onAccent: '#fdf8f0',
  rule: 'rgba(35, 32, 28, 0.14)',
};

const font = (file: string) => readFile(join(process.cwd(), 'assets/og-fonts', file));

async function loadFonts() {
  const [display, script, sans] = await Promise.all([
    font('newsreader-display-300.ttf'),
    font('caveat-600.ttf'),
    font('plex-sans-400.ttf'),
  ]);
  return [
    { name: 'Newsreader', data: display, weight: 300 as const, style: 'normal' as const },
    { name: 'Caveat', data: script, weight: 600 as const, style: 'normal' as const },
    { name: 'Plex', data: sans, weight: 400 as const, style: 'normal' as const },
  ];
}

interface CardProps {
  name: string;
  eyebrow: string;
  /** The display line. */
  title: string;
  /** One word of `title` set in the handwriting face on an accent chip (the hero's). */
  highlight?: string | null;
  titleColor?: string;
  titleSize?: number;
  /** The saved accent's base colour (`lib/og/accent.ts`). */
  accent: string;
}

/** Words as flex items: satori can't mix inline boxes in running text. */
function DisplayLine({ title, highlight, accent, titleColor = C.ink, titleSize = 88 }: CardProps) {
  const { before, word, after } = splitHighlight(title, highlight ?? null);
  const words = (s: string) => s.split(/\s+/).filter(Boolean);
  const gap = titleSize * 0.24;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        maxWidth: 1000,
        fontFamily: 'Newsreader',
        fontSize: titleSize,
        lineHeight: 1.08,
        letterSpacing: '-0.02em',
        color: titleColor,
      }}
    >
      {words(before).map((w, i) => (
        <span key={`b${i}`} style={{ marginRight: gap }}>
          {w}
        </span>
      ))}
      {word && (
        <span
          style={{
            fontFamily: 'Caveat',
            fontSize: titleSize * 1.1,
            lineHeight: 0.84,
            background: accent,
            color: C.onAccent,
            borderRadius: 6,
            padding: `${titleSize * 0.04}px ${titleSize * 0.16}px ${titleSize * 0.1}px ${titleSize * 0.14}px`,
          }}
        >
          {word}
        </span>
      )}
      {/* Trailing punctuation hugs the chip; later words keep their gap. */}
      {words(after).map((w, i) => (
        <span key={`a${i}`} style={{ marginLeft: i === 0 && !/^\s/.test(after) ? 0 : gap }}>
          {w}
        </span>
      ))}
    </div>
  );
}

export async function renderOgCard(props: CardProps) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 84px 60px',
        background: C.paper,
        color: C.ink,
        fontFamily: 'Plex',
      }}
    >
      {/* Signature: handwritten name over the mockup's accent underline. */}
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start' }}>
        <span style={{ fontFamily: 'Caveat', fontSize: 46, lineHeight: 1 }}>{props.name}</span>
        <svg
          width={Math.round(props.name.length * 18.4)}
          height={10}
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
        >
          <path
            d={SIGNATURE_PATH}
            stroke={props.accent}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <span
          style={{
            fontSize: 22,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.muted,
          }}
        >
          {props.eyebrow}
        </span>
        <DisplayLine {...props} />
      </div>

      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${C.rule}`,
          paddingTop: 22,
          fontSize: 22,
          color: C.muted,
        }}
      >
        {siteUrl.host}
      </div>
    </div>,
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
