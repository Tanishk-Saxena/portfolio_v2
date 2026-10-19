// The slice of opentype.js (no bundled types) that lib/signature-pen.ts uses.
declare module 'opentype.js' {
  export interface PathCommand {
    type: 'M' | 'L' | 'C' | 'Q' | 'Z';
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }
  export interface Path {
    commands: PathCommand[];
    toPathData(decimalPlaces?: number): string;
  }
  export interface Glyph {
    getPath(x: number, y: number, fontSize: number): Path;
  }
  export interface Font {
    unitsPerEm: number;
    tables: { hhea: { ascender: number; descender: number } };
    forEachGlyph(
      text: string,
      x: number,
      y: number,
      fontSize: number,
      options: { kerning?: boolean },
      callback: (glyph: Glyph, x: number, y: number, fontSize: number) => void,
    ): number;
    getAdvanceWidth(text: string, fontSize: number, options?: { kerning?: boolean }): number;
  }
  export function parse(buffer: ArrayBuffer): Font;
}
