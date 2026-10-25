/*
 * [EXPERIMENT] The hero backgrounds drawn in markup (styles/hero-backdrop.css moves them).
 */

/** Topographic rings round two peaks, each a circle bent by a few slow waves. */
function contourPaths() {
  const peaks = [
    { cx: 1180, cy: 210, rings: 9 },
    { cx: 260, cy: 760, rings: 6 },
  ];
  const paths: string[] = [];
  for (const [k, peak] of peaks.entries()) {
    for (let i = 1; i <= peak.rings; i++) {
      const base = i * 46;
      let d = '';
      for (let s = 0; s <= 96; s++) {
        const a = (s / 96) * Math.PI * 2;
        const r =
          base *
          (1 +
            0.13 * Math.sin(3 * a + i * 0.7 + k) +
            0.07 * Math.cos(5 * a - i * 0.4) +
            0.04 * Math.sin(8 * a + k * 2));
        d += `${s ? 'L' : 'M'}${(peak.cx + r * Math.cos(a)).toFixed(1)},${(peak.cy + r * 0.78 * Math.sin(a)).toFixed(1)}`;
      }
      paths.push(`${d}Z`);
    }
  }
  return paths;
}

const CONTOURS = contourPaths();

export function Contours() {
  return (
    <svg className="bd-contours" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      {CONTOURS.map((d, i) => (
        <path key={i} d={d} pathLength={1} className={i % 3 === 0 ? 'bd-contour-run' : undefined} />
      ))}
    </svg>
  );
}

export function Mesh() {
  return (
    <>
      <span className="bd-blob bd-blob-1" />
      <span className="bd-blob bd-blob-2" />
      <span className="bd-blob bd-blob-3" />
    </>
  );
}

export function Aurora() {
  return (
    <>
      <span className="bd-ribbon bd-ribbon-1" />
      <span className="bd-ribbon bd-ribbon-2" />
      <span className="bd-ribbon bd-ribbon-3" />
    </>
  );
}
