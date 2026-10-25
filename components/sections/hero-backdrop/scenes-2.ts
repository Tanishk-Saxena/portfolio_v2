import type { Setup } from './use-canvas-loop';

/*
 * [EXPERIMENT] Round two of the drawn hero backgrounds (owner, 2026-10-26: "more unique, out
 * of the box"), each after a well-known reference. Kept to the right of the words where they
 * would compete, faint, and cheap enough for a phone at 30 frames a second.
 */

/** Strength across the hero: nothing over the words at the left, full at the right. */
const rightward = (x: number, w: number, from = 0.38) =>
  Math.min(1, Math.max(0, (x / w - from) / (1 - from)) * 1.6);

/** The spinning ASCII donut (donut.c), in the page's mono face, to the right of the words. */
export const ascii: Setup = (ctx, w, h, c) => {
  const CELL = w < 600 ? 9 : 11;
  const cols = Math.floor((w < 600 ? w : w * 0.36) / (CELL * 0.62));
  const rows = Math.floor((h * 0.72) / CELL);
  const x0 = w < 600 ? 0 : w * 0.61;
  const y0 = h * 0.08;
  const CHARS = '.,-~:;=!*#$@';
  ctx.font = `${CELL}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  return {
    frame(t) {
      const A = t * 0.5;
      const B = t * 0.23;
      const out = new Array<string>(cols * rows).fill(' ');
      const z = new Float32Array(cols * rows);
      const [cA, sA, cB, sB] = [Math.cos(A), Math.sin(A), Math.cos(B), Math.sin(B)];
      const K = Math.min(cols * 0.62, rows) * 0.42;
      for (let j = 0; j < 6.28; j += 0.07) {
        const [cj, sj] = [Math.cos(j), Math.sin(j)];
        for (let i = 0; i < 6.28; i += 0.02) {
          const [ci, si] = [Math.cos(i), Math.sin(i)];
          const hh = cj + 2;
          const D = 1 / (si * hh * sA + sj * cA + 5);
          const tt = si * hh * cA - sj * sA;
          const x = Math.floor(cols / 2 + (K * 1.6 * D * (ci * hh * cB - tt * sB)) / 0.62);
          const y = Math.floor(rows / 2 + K * 1.6 * D * (ci * hh * sB + tt * cB));
          const N = Math.floor(
            8 * ((sj * sA - si * cj * cA) * cB - si * cj * sA - sj * cA - ci * cj * sB),
          );
          const o = x + cols * y;
          if (y >= 0 && y < rows && x >= 0 && x < cols && D > z[o]) {
            z[o] = D;
            out[o] = CHARS[Math.max(0, N)];
          }
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.42;
      for (let y = 0; y < rows; y++) {
        ctx.fillText(out.slice(y * cols, (y + 1) * cols).join(''), x0, y0 + y * CELL);
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** Conway's Game of Life on a dot grid; cells ease in and out, and the cursor seeds new life. */
export const life: Setup = (ctx, w, h, c) => {
  const CELL = w < 600 ? 12 : 14;
  const cols = Math.ceil(w / CELL);
  const rows = Math.ceil(h / CELL);
  let grid = new Uint8Array(cols * rows);
  const glow = new Float32Array(cols * rows);
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sow = () => {
    for (let i = 0; i < grid.length; i++)
      grid[i] = rnd() < 0.18 && rightward((i % cols) * CELL, w, 0.48) > 0 ? 1 : 0;
  };
  sow();
  let last = 0;
  let quiet = 0;
  return {
    frame(t, p) {
      if (p.active) {
        const px = Math.floor(p.x / CELL);
        const py = Math.floor(p.y / CELL);
        for (const [dx, dy] of [
          [0, 0],
          [1, 0],
          [-1, 1],
          [0, 1],
          [1, 2],
        ]) {
          const x = px + dx;
          const y = py + dy;
          if (x >= 0 && x < cols && y >= 0 && y < rows) grid[y * cols + x] = 1;
        }
      }
      if (t - last > 0.16) {
        last = t;
        const next = new Uint8Array(grid.length);
        let changes = 0;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            let n = 0;
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++)
                if (dx || dy) n += grid[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)];
            const i = y * cols + x;
            next[i] = n === 3 || (n === 2 && grid[i]) ? 1 : 0;
            if (next[i] !== grid[i]) changes++;
          }
        }
        grid = next;
        quiet = changes < cols * 0.15 ? quiet + 1 : 0;
        if (quiet > 30) {
          sow();
          quiet = 0;
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = c.accent;
      for (let i = 0; i < grid.length; i++) {
        glow[i] += ((grid[i] ? 1 : 0) - glow[i]) * 0.2;
        if (glow[i] < 0.03) continue;
        const x = (i % cols) * CELL + CELL / 2;
        const fade = rightward(x, w, 0.48);
        if (!fade) continue;
        ctx.globalAlpha = 0.45 * glow[i] * fade;
        ctx.beginPath();
        ctx.arc(x, Math.floor(i / cols) * CELL + CELL / 2, CELL * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** Vercel / Linear: a faint grid with pulses of light running along its lines. */
export const beams: Setup = (ctx, w, h, c) => {
  const CELL = w < 600 ? 40 : 56;
  let seed = 9;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  type Beam = { x: number; y: number; dx: number; dy: number; len: number; speed: number };
  const spawn = (): Beam => {
    const across = rnd() < 0.5;
    return {
      x: across ? 0 : Math.floor((0.35 + rnd() * 0.65) * (w / CELL)) * CELL,
      y: across ? Math.floor(rnd() * (h / CELL)) * CELL : 0,
      dx: across ? 1 : 0,
      dy: across ? 0 : 1,
      len: 90 + rnd() * 120,
      speed: 140 + rnd() * 160,
    };
  };
  const list: Beam[] = Array.from({ length: w < 600 ? 3 : 6 }, () => {
    const b = spawn();
    b.x += b.dx * rnd() * w;
    b.y += b.dy * rnd() * h;
    return b;
  });
  let prev = 0;
  return {
    frame(t) {
      const dt = prev ? Math.min(t - prev, 0.1) : 0;
      prev = t;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = c.ink;
      ctx.globalAlpha = 0.06;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0.5; x < w; x += CELL) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0.5; y < h; y += CELL) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      ctx.lineWidth = 1.5;
      for (const b of list) {
        b.x += b.dx * b.speed * dt;
        b.y += b.dy * b.speed * dt;
        const tx = b.x - b.dx * b.len;
        const ty = b.y - b.dy * b.len;
        const grad = ctx.createLinearGradient(tx, ty, b.x, b.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, c.accent);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.8 * rightward(b.x, w, 0.25);
        ctx.beginPath();
        ctx.moveTo(tx + 0.5, ty + 0.5);
        ctx.lineTo(b.x + 0.5, b.y + 0.5);
        ctx.stroke();
        if (b.x - b.len > w || b.y - b.len > h) Object.assign(b, spawn());
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** Truchet tiles: quarter-circle arcs; one tile at a time turns, and the maze re-routes. */
export const truchet: Setup = (ctx, w, h, c) => {
  const S = w < 600 ? 40 : 54;
  const cols = Math.ceil(w / S);
  const rows = Math.ceil(h / S);
  let seed = 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const turn = Array.from({ length: cols * rows }, () => (rnd() < 0.5 ? 0 : 1));
  const shown = Float32Array.from(turn);
  let last = 0;
  return {
    frame(t) {
      if (t - last > 0.12) {
        last = t;
        const i = Math.floor(rnd() * turn.length);
        turn[i] += 1;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = w < 600 ? 2 : 2.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < turn.length; i++) {
        shown[i] += (turn[i] - shown[i]) * 0.12;
        const x = (i % cols) * S;
        const y = Math.floor(i / cols) * S;
        const fade = rightward(x + S / 2, w, 0.5);
        if (!fade) continue;
        ctx.globalAlpha = 0.3 * fade;
        ctx.save();
        ctx.translate(x + S / 2, y + S / 2);
        ctx.rotate((shown[i] * Math.PI) / 2);
        ctx.beginPath();
        ctx.arc(-S / 2, -S / 2, S / 2, 0, Math.PI / 2);
        ctx.moveTo(0, S / 2);
        ctx.arc(S / 2, S / 2, S / 2, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };
};
