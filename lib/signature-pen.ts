import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type Font, type PathCommand } from 'opentype.js';
import type { ScriptFont } from '@/lib/domain/types';

/*
 * The signature intro's pen (spec §10 "Signature writing"; owner, 2026-10-19): the name in the
 * script face as one outline per letter, drawn on the server from the same font file the page
 * uses, so the intro can write it stroke by stroke. Each letter's outline is traced by a pen
 * wide enough to fill its strokes and clipped to the letter, so the ink follows the outline's
 * own path (down a stem, round a bowl) and nothing ahead of the pen shows. Letters go one
 * after another at an even pen speed, with a lift between them and a longer one between words.
 * Only the home page carries it (the intro plays nowhere else): a few KB of path data.
 */

/** Font units per em for the paths: integers at 1000 are sharp at the intro's 104px. */
const EM = 1000;
/** The name's line box (`--text-signature--line-height`), in em. */
const LINE = 0.95;
/** Pen width per face, in font units: twice the face's thickest stroke, so one pass fills it. */
const PEN: Record<ScriptFont, number> = { allura: 110, caveat: 130 };
const FILES: Record<ScriptFont, string> = { allura: 'allura-400.ttf', caveat: 'caveat-600.ttf' };

/** The ink time for the whole name, shared by its letters by length; then the lifts. */
const INK_MS = 1050;
const LIFT_MS = 25;
const WORD_MS = 110;
/** The first stroke starts after this (the overlay settles). */
const START_MS = 200;

export type SignaturePen = {
  /** Advance width, the line box's height and the baseline's depth in it, in font units. */
  width: number;
  height: number;
  baseline: number;
  /** The same box in em, to size the SVG over the text. */
  widthEm: number;
  heightEm: number;
  pen: number;
  letters: { d: string; delay: number; duration: number }[];
  /** When the last stroke ends, from the start of writing. */
  writeMs: number;
};

const fonts = new Map<ScriptFont, Font>();
const pens = new Map<string, SignaturePen | null>();

function font(face: ScriptFont) {
  let f = fonts.get(face);
  if (!f) {
    const buf = readFileSync(join(process.cwd(), 'assets/og-fonts', FILES[face]));
    f = parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    fonts.set(face, f);
  }
  return f;
}

/** The outline's length, its curves flattened to short chords. */
export function outlineLength(commands: PathCommand[]) {
  let len = 0;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const to = (nx: number, ny: number) => {
    len += Math.hypot(nx - x, ny - y);
    x = nx;
    y = ny;
  };
  for (const c of commands) {
    if (c.type === 'M') {
      x = sx = c.x!;
      y = sy = c.y!;
    } else if (c.type === 'L') to(c.x!, c.y!);
    else if (c.type === 'Z') to(sx, sy);
    else {
      const [x0, y0] = [x, y];
      for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        const u = 1 - t;
        if (c.type === 'Q')
          to(
            u * u * x0 + 2 * u * t * c.x1! + t * t * c.x!,
            u * u * y0 + 2 * u * t * c.y1! + t * t * c.y!,
          );
        else
          to(
            u * u * u * x0 + 3 * u * u * t * c.x1! + 3 * u * t * t * c.x2! + t * t * t * c.x!,
            u * u * u * y0 + 3 * u * u * t * c.y1! + 3 * u * t * t * c.y2! + t * t * t * c.y!,
          );
      }
    }
  }
  return len;
}

/** The name as pen strokes in the given face, or null if the font can't be read. */
export function signaturePen(name: string, face: ScriptFont): SignaturePen | null {
  const key = `${face}\n${name}`;
  if (pens.has(key)) return pens.get(key)!;
  let pen: SignaturePen | null = null;
  try {
    const f = font(face);
    const glyphs: { d: string; len: number; lift: number }[] = [];
    let lift = 0;
    f.forEachGlyph(name, 0, 0, EM, { kerning: true }, (g, gx, gy, size) => {
      const path = g.getPath(gx, gy, size);
      const d = path.toPathData(0);
      // A blank (a space) makes the next lift a word's.
      if (!d) {
        lift = WORD_MS;
        return;
      }
      glyphs.push({ d, len: outlineLength(path.commands), lift });
      lift = LIFT_MS;
    });
    const total = glyphs.reduce((sum, g) => sum + g.len, 0) || 1;
    let at = START_MS;
    const letters = glyphs.map((g, i) => {
      at += i ? g.lift : 0;
      const duration = Math.round((INK_MS * g.len) / total);
      const letter = { d: g.d, delay: at, duration };
      at += duration;
      return letter;
    });
    // Half-leading puts the baseline this far down a LINE-tall box (as CSS lays out the text).
    const { ascender, descender } = f.tables.hhea;
    const scale = EM / f.unitsPerEm;
    const baseline = Math.round(
      (LINE * EM - (ascender - descender) * scale) / 2 + ascender * scale,
    );
    const width = Math.round(f.getAdvanceWidth(name, EM, { kerning: true }));
    pen = {
      width,
      height: LINE * EM,
      baseline,
      widthEm: width / EM,
      heightEm: LINE,
      pen: PEN[face],
      letters,
      writeMs: at,
    };
  } catch {
    pen = null;
  }
  pens.set(key, pen);
  return pen;
}
