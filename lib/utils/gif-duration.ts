/**
 * One play of a GIF, in ms: the sum of its frames' delays, read from the file's own blocks.
 * Browsers show a delay of 10ms or less as 100ms, and so does this. Null when the bytes are
 * not a GIF or end early. The modal media gives a GIF exactly one play before moving on
 * (owner, spec §10 "Modal media").
 */
export function gifDurationMs(bytes: Uint8Array): number | null {
  const at = (i: number) => bytes[i] ?? -1;
  const signature = String.fromCharCode(...bytes.slice(0, 6));
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null;

  const tableSize = (packed: number) => (packed & 0x80 ? 3 * 2 ** ((packed & 7) + 1) : 0);
  // Data sub-blocks: a length byte, that many bytes, until a zero length.
  const skipBlocks = (from: number) => {
    let i = from;
    while (i < bytes.length && at(i) !== 0) i += at(i) + 1;
    return i + 1;
  };

  let i = 13 + tableSize(at(10)); // header, screen descriptor, global colour table
  let delay = 0; // the pending frame's delay, from its graphic control extension
  let total = 0;
  while (i < bytes.length) {
    const block = at(i);
    if (block === 0x3b) return total; // trailer
    if (block === 0x21) {
      if (at(i + 1) === 0xf9) delay = (at(i + 4) | (at(i + 5) << 8)) * 10;
      i = skipBlocks(i + 2);
    } else if (block === 0x2c) {
      total += delay <= 10 ? 100 : delay;
      delay = 0;
      i = skipBlocks(i + 10 + tableSize(at(i + 9)) + 1); // descriptor, local table, LZW size
    } else {
      return null;
    }
  }
  return null; // no trailer: a cut-off file
}
