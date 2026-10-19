import type { CSSProperties } from 'react';
import type { SignaturePen } from '@/lib/signature-pen';

// The handwritten name plus its accent underline (spec §3.4). Used in the navbar slot and,
// larger, in the intro. The underline path is verbatim from the mockup. On the home page it
// also carries the intro's pen (lib/signature-pen.ts): the name's letters as outlines, laid
// exactly over the text and shown only while the intro writes them (styles/tokens.css).

export const SIGNATURE_PATH = 'M4,7 C70,2 214,1 292,6 C298,6.5 299,9 290,10';

export function SignatureMark({ name, pen }: { name: string; pen?: SignaturePen | null }) {
  return (
    <span
      data-signature-mark
      data-write-ms={pen?.writeMs}
      style={pen ? ({ '--sig-write': `${pen.writeMs}ms` } as CSSProperties) : undefined}
      className="flex flex-col items-stretch leading-none"
    >
      <span
        data-signature-name
        className="relative block font-script text-signature font-(--script-weight) whitespace-nowrap text-ink"
      >
        {name}
        {pen && <PenStrokes pen={pen} />}
      </span>
      <svg
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
        data-signature-line
        className="mt-px h-1.25 w-full overflow-visible"
      >
        <path
          d={SIGNATURE_PATH}
          stroke="var(--accent)"
          strokeWidth="2.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

/** Each letter's outline, traced by a wide pen clipped to the letter (one per page: home). */
function PenStrokes({ pen }: { pen: SignaturePen }) {
  return (
    <svg
      data-signature-pen
      aria-hidden="true"
      viewBox={`0 ${-pen.baseline} ${pen.width} ${pen.height}`}
      fill="none"
      style={{ width: `${pen.widthEm}em`, height: `${pen.heightEm}em` }}
      className="pointer-events-none absolute top-0 left-0 hidden overflow-visible text-ink"
    >
      <defs>
        {pen.letters.map((l, i) => (
          <clipPath key={i} id={`sig-clip-${i}`}>
            <path id={`sig-letter-${i}`} d={l.d} pathLength={1} />
          </clipPath>
        ))}
      </defs>
      {pen.letters.map((l, i) => (
        <use
          key={i}
          href={`#sig-letter-${i}`}
          clipPath={`url(#sig-clip-${i})`}
          stroke="currentColor"
          strokeWidth={pen.pen}
          strokeLinecap="round"
          style={{ animationDelay: `${l.delay}ms`, animationDuration: `${l.duration}ms` }}
        />
      ))}
    </svg>
  );
}
