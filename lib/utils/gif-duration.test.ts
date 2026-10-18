import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { gifDurationMs } from './gif-duration';

// A frame: graphic control extension (delay in 1/100 s), image descriptor, LZW size, one data block.
const frame = (delay: number) => [
  0x21,
  0xf9,
  4,
  0,
  delay & 0xff,
  delay >> 8,
  0,
  0,
  0x2c,
  0,
  0,
  0,
  0,
  1,
  0,
  1,
  0,
  0,
  2,
  2,
  0x4c,
  0x01,
  0,
];
const gif = (...frames: number[][]) =>
  new Uint8Array([
    ...[...'GIF89a'].map((c) => c.charCodeAt(0)),
    1,
    0,
    1,
    0,
    0x80,
    0,
    0, // 1×1, a two-colour global table
    0,
    0,
    0,
    255,
    255,
    255,
    ...frames.flat(),
    0x3b,
  ]);

describe('gifDurationMs', () => {
  it('sums the frame delays, as browsers play them, and refuses what is not a whole GIF', () => {
    expect(gifDurationMs(gif(frame(50), frame(25)))).toBe(750);
    expect(gifDurationMs(gif(frame(0), frame(1), frame(2)))).toBe(220); // ≤ 10ms plays as 100ms
    const whole = gif(frame(50));
    expect(gifDurationMs(whole.slice(0, whole.length - 1))).toBeNull(); // no trailer
    expect(gifDurationMs(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBeNull(); // a JPEG
    const sample = new Uint8Array(readFileSync('public/samples/loop.gif'));
    expect(gifDurationMs(sample)).toBeGreaterThan(0);
  });
});
