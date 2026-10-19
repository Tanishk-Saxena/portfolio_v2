import { describe, expect, it } from 'vitest';
import { signaturePen } from './signature-pen';

describe('signaturePen', () => {
  it('writes the name letter by letter, lifting the pen between letters and longer between words', () => {
    for (const face of ['allura', 'caveat'] as const) {
      const pen = signaturePen('Ta Sa', face)!;
      expect(pen.letters).toHaveLength(4); // the space is a lift, not a letter
      const [t, a, s] = pen.letters;
      expect(a.delay - (t.delay + t.duration)).toBeLessThan(s.delay - (a.delay + a.duration));
      const last = pen.letters.at(-1)!;
      expect(pen.writeMs).toBe(last.delay + last.duration);
      expect(pen.letters.every((l) => l.d.startsWith('M') && l.duration > 0)).toBe(true);
      expect(pen.widthEm).toBeGreaterThan(1);
      expect(pen.baseline).toBeGreaterThan(0);
      expect(pen.baseline).toBeLessThan(pen.height);
    }
  });
});
