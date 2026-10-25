import type { Setup } from './use-canvas-loop';

/*
 * [EXPERIMENT] The drawn hero backgrounds (use-canvas-loop.ts runs them). Each is sized to the
 * hero, scaled by its area so a phone draws less, and kept faint: the hero's words lead.
 */

/** A seeded random, so a scene looks the same on every load. */
function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** Nodes drifting slowly, linked by faint lines when close; they lean away from the cursor. */
export const constellation: Setup = (ctx, w, h, c) => {
  const rand = seeded(7);
  const count = Math.min(90, Math.round((w * h) / 15000));
  const LINK = 130;
  const nodes = Array.from({ length: count }, () => ({
    x: rand() * w,
    y: rand() * h,
    vx: (rand() - 0.5) * 9,
    vy: (rand() - 0.5) * 9,
  }));
  let prev = 0;
  return {
    frame(t, p) {
      const dt = prev ? Math.min(t - prev, 0.1) : 0;
      prev = t;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (p.active) {
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 140 && d > 0) {
            n.x += (dx / d) * (140 - d) * 0.02;
            n.y += (dy / d) * (140 - d) * 0.02;
          }
        }
        n.x = (n.x + n.vx * dt + w) % w;
        n.y = (n.y + n.vy * dt + h) % h;
      }
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d > LINK) continue;
          ctx.globalAlpha = 0.22 * (1 - d / LINK);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.5;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** A printed dot screen with a slow wave rolling through it; the cursor sends out a ripple. */
export const halftone: Setup = (ctx, w, h, c) => {
  const GAP = w < 600 ? 16 : 20;
  const MAX = GAP * 0.3;
  return {
    frame(t, p) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.2;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          // Only on the right, clear of the words, strongest at the top right.
          const reach = Math.min(1, Math.max(0, (x / w - 0.45) * 2.2 - (y / h) * 0.4));
          let s = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.008 - t * 0.9);
          if (p.active) {
            const d = Math.hypot(x - p.x, y - p.y);
            if (d < 220) s += 0.6 * (1 - d / 220) * (0.5 + 0.5 * Math.sin(d * 0.06 - t * 4));
          }
          const r = MAX * reach * Math.min(1, s);
          if (r < 0.4) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** Fine lines carried on a slowly turning current, like wind on water; they leave short trails. */
export const flow: Setup = (ctx, w, h, c) => {
  const rand = seeded(11);
  const count = Math.min(320, Math.round((w * h) / 4000));
  const spawn = () => ({ x: rand() * w, y: rand() * h, age: Math.floor(rand() * 200) });
  const parts = Array.from({ length: count }, spawn);
  const angle = (x: number, y: number, t: number) =>
    Math.sin(x * 0.0035 + t * 0.12) * 1.6 + Math.cos(y * 0.004 - t * 0.09) * 1.4;
  return {
    frame(t, p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.07;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = c.accent;
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const q of parts) {
        let a = angle(q.x, q.y, t);
        if (p.active) {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d < 160) a += (1 - d / 160) * 1.5;
        }
        const nx = q.x + Math.cos(a) * 1.4;
        const ny = q.y + Math.sin(a) * 1.4;
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(nx, ny);
        q.x = nx;
        q.y = ny;
        if (++q.age > 260 || nx < 0 || nx > w || ny < 0 || ny > h)
          Object.assign(q, spawn(), { age: 0 });
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
};
