import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * App icon: the handwritten initial on the accent chip, the hero's highlight in miniature.
 * `radius` is a fraction of the size (0 for Apple's own mask).
 */
export async function renderMonogram(size: number, radius = 0.22) {
  const caveat = await readFile(join(process.cwd(), 'assets/og-fonts/caveat-600.ttf'));
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#a9491f',
        borderRadius: size * radius,
        color: '#fdf8f0',
        fontFamily: 'Caveat',
        fontSize: size * 0.9,
        lineHeight: 1,
        padding: `0 ${size * 0.12}px ${size * 0.02}px 0`,
      }}
    >
      T
    </div>,
    {
      width: size,
      height: size,
      fonts: [{ name: 'Caveat', data: caveat, weight: 600, style: 'normal' }],
    },
  );
}
