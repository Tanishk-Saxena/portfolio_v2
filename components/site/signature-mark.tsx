// The handwritten name plus its accent underline (spec §3.4). Used in the navbar slot and,
// larger, in the intro (Phase 4). The underline path is verbatim from the mockup.

export const SIGNATURE_PATH = 'M4,7 C70,2 214,1 292,6 C298,6.5 299,9 290,10';

export function SignatureMark({ name }: { name: string }) {
  return (
    <span className="flex flex-col items-stretch leading-none">
      <span className="block font-script text-signature font-semibold whitespace-nowrap text-ink">
        {name}
      </span>
      <svg
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
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
