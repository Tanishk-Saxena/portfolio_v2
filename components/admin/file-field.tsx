'use client';

import { useRef, useState } from 'react';
import type { ImageValue } from '@/lib/admin/schema';
import { checkUpload, UPLOADS, type UploadKind } from '@/lib/admin/uploads';
import { SmallCloseIcon } from './admin-icons';
import { showToast } from './toast';

/** An image's own size, read before upload so the site can reserve its space (CLS, §10). */
async function measure(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** Signed URL from the server, then straight to Storage (ADMIN-DESIGN-SPEC §10). */
async function upload(kind: UploadKind, file: File): Promise<string | null> {
  const signed = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, type: file.type, bytes: file.size }),
  }).catch(() => null);
  if (!signed?.ok) return null;
  const { signedUrl, publicUrl } = (await signed.json()) as {
    signedUrl: string;
    publicUrl: string;
  };
  const form = new FormData();
  form.append('cacheControl', '31536000'); // every upload has a new name
  form.append('', file);
  const put = await fetch(signedUrl, { method: 'PUT', body: form }).catch(() => null);
  return put?.ok ? publicUrl : null;
}

const fileName = (src: string) => decodeURIComponent(src.split('/').pop() ?? src);

/**
 * The schema's file field (ADMIN-DESIGN-SPEC §5): a drop zone when empty, else a row with a
 * thumbnail (image) or extension tile (PDF), the name, Replace and remove. Image values carry
 * their size; PDF values are the URL.
 */
export function FileField({
  kind,
  value,
  onChange,
  ...control
}: {
  id: string;
  kind: UploadKind;
  value: ImageValue | string | null;
  onChange: (value: ImageValue | string | null) => void;
  'aria-describedby'?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rule = UPLOADS[kind];
  const src = typeof value === 'string' ? value : (value?.src ?? '');

  async function take(file: File | undefined) {
    if (!file) return;
    const refused = checkUpload(kind, file.type, file.size);
    if (refused) {
      showToast(refused);
      return;
    }
    setBusy(true);
    const size = kind === 'image' ? await measure(file).catch(() => null) : null;
    const url = kind === 'image' && !size ? null : await upload(kind, file);
    setBusy(false);
    if (!url) {
      showToast('Could not upload. Try again.');
      return;
    }
    onChange(kind === 'image' ? { src: url, ...size! } : url);
  }

  const picker = (
    <input
      ref={input}
      {...control}
      type="file"
      accept={rule.accept}
      className="sr-only"
      onChange={(e) => {
        void take(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  if (src) {
    return (
      <div className="flex items-center gap-3 rounded-row border border-line-input bg-field p-2.5">
        {kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element -- a 56px admin thumbnail
          <img src={src} alt="" className="size-14 flex-none rounded-sm object-cover" />
        ) : (
          <span className="grid size-14 flex-none place-items-center rounded-sm bg-surface text-cue tracking-label text-muted uppercase">
            {src.split('.').pop()?.slice(0, 4) ?? 'file'}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-meta">
          {busy ? 'Uploading…' : fileName(src)}
        </span>
        <label className="relative inline-flex h-9 flex-none cursor-pointer items-center rounded-full border border-line px-3 text-small hover:border-accent has-focus-visible:outline-2 has-focus-visible:outline-accent">
          Replace
          {picker}
        </label>
        <button
          type="button"
          aria-label="Remove file"
          onClick={() => onChange(null)}
          className="grid size-9 flex-none cursor-pointer place-items-center rounded-full text-muted hover:text-accent"
        >
          <SmallCloseIcon />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void take(e.dataTransfer.files[0]);
      }}
      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-row border border-dashed bg-field p-4 text-center transition-colors duration-150 hover:border-accent has-focus-visible:outline-2 has-focus-visible:outline-accent ${dragging ? 'border-accent' : 'border-line-input'}`}
    >
      <span className="text-meta">
        {busy ? (
          'Uploading…'
        ) : (
          <>
            Drop a file or <span className="text-accent">browse</span>
          </>
        )}
      </span>
      <span className="text-label text-muted">{rule.acceptText}</span>
      {picker}
    </label>
  );
}
