import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * App icon: the handwritten initials, TS (owner, spec §10), on the accent chip, the hero's
 * highlight in miniature.
 * `radius` is a fraction of the size (0 for Apple's own mask); `accent` is the saved one.
 */
export async function renderMonogram(size: number, accent: string, radius = 0.22) {
  const caveat = await readFile(join(process.cwd(), 'assets/og-fonts/caveat-600.ttf'));
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: accent,
        borderRadius: size * radius,
        color: '#fdf8f0',
        fontFamily: 'Caveat',
        fontSize: size * 0.72,
        letterSpacing: -size * 0.03,
        lineHeight: 1,
        padding: `${size * 0.06}px ${size * 0.2}px 0 0`,
      }}
    >
      TS
    </div>,
    {
      width: size,
      height: size,
      fonts: [{ name: 'Caveat', data: caveat, weight: 600, style: 'normal' }],
    },
  );
}
