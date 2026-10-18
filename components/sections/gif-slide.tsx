'use client';

import { useEffect, useMemo, useState } from 'react';
import { gifDurationMs } from '@/lib/utils/gif-duration';

/**
 * A GIF in the modal media (owner, spec §10). With rotation on (`measure`), the file is read
 * once to learn its length (`onDuration`), and each time the slide comes into view it plays
 * from its first frame: a fresh object URL is a new image to the browser, so its animation
 * starts over, with no second download. Otherwise it is a plain image, looping as GIFs do.
 */
export function GifSlide({
  src,
  alt,
  active,
  measure,
  onDuration,
}: {
  src: string;
  alt: string;
  active: boolean;
  measure: boolean;
  onDuration: (ms: number) => void;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!measure) return;
    let live = true;
    fetch(src)
      .then((r) => (r.ok ? r.blob() : null))
      .then(async (b) => {
        if (!b || !live) return;
        const ms = gifDurationMs(new Uint8Array(await b.arrayBuffer()));
        if (!live) return;
        setBlob(b);
        if (ms) onDuration(ms);
      })
      .catch(() => {}); // the plain image still shows; its turn falls back to an image's
    return () => {
      live = false;
    };
    // `onDuration` is a fresh closure each render; the file is read once per source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, measure]);

  // A new URL each time the slide becomes the one in view: the play starts at frame one.
  const played = useMemo(() => (active && blob ? URL.createObjectURL(blob) : null), [active, blob]);
  useEffect(() => () => void (played && URL.revokeObjectURL(played)), [played]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a GIF keeps its frames as is
    <img src={played ?? src} alt={alt} className="absolute inset-0 size-full object-cover" />
  );
}
