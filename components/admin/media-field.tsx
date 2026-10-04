'use client';

import { useRef, useState } from 'react';
import type { MediaValue } from '@/lib/admin/schema';
import { checkUpload, UPLOADS } from '@/lib/admin/uploads';
import { GripIcon, SmallCloseIcon } from './admin-icons';
import { upload } from './file-field';
import { showToast } from './toast';
import { useDragSort } from './use-drag-sort';

const fileName = (src: string) => decodeURIComponent(src.split('/').pop() ?? src);
const rule = UPLOADS.media;

/**
 * A project's modal media (owner, ADMIN-DESIGN-SPEC §14): a list of images, GIFs and videos,
 * in the order the modal shows them. Add by dropping, pasting or browsing (several at once);
 * drag a row to reorder; × removes. At `max` the add zone goes.
 */
export function MediaField({
  value,
  max = Infinity,
  onChange,
  ...control
}: {
  id: string;
  value: MediaValue[];
  max?: number;
  onChange: (value: MediaValue[]) => void;
  'aria-describedby'?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const sort = useDragSort(
    value.map((m) => m.src),
    (src, to) => {
      const next = value.filter((m) => m.src !== src);
      const moved = value.find((m) => m.src === src);
      if (moved) next.splice(to, 0, moved);
      onChange(next);
    },
    { axis: 'y' },
  );

  async function take(files: File[]) {
    const room = max - value.length;
    if (busy || !files.length || room <= 0) return;
    setBusy(true);
    const added: MediaValue[] = [];
    for (const file of files.slice(0, room)) {
      const refused = checkUpload('media', file.type, file.size);
      const src = refused ? null : await upload('media', file);
      if (src) added.push({ kind: file.type.startsWith('video/') ? 'video' : 'image', src });
      else showToast(refused ?? `Could not upload ${file.name}. Try again.`);
    }
    setBusy(false);
    if (added.length) onChange([...value, ...added]);
  }

  return (
    <div
      className="flex flex-col gap-2"
      // A pasted image lands here while the focus is anywhere inside the field.
      onPaste={(e) => {
        const files = [...e.clipboardData.files];
        if (!files.length) return;
        e.preventDefault();
        void take(files);
      }}
    >
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((item) => (
            <li
              key={item.src}
              data-sort-id={item.src}
              className={`flex items-center gap-2.5 rounded-row border border-line-input bg-field p-2 ${sort.dragging === item.src ? 'relative z-10 shadow-float' : ''}`}
            >
              <span
                {...sort.handle(item.src)}
                aria-hidden="true"
                title="Drag to reorder"
                className={`flex h-12 w-6 flex-none touch-none items-center justify-center text-muted select-none hover:text-accent ${sort.dragging === item.src ? 'cursor-grabbing text-accent' : 'cursor-grab'}`}
              >
                <GripIcon />
              </span>
              {item.kind === 'video' ? (
                <video
                  src={item.src}
                  muted
                  preload="metadata"
                  className="size-12 flex-none rounded-sm object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- a 48px admin thumbnail
                <img src={item.src} alt="" className="size-12 flex-none rounded-sm object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate text-meta">{fileName(item.src)}</span>
              <span className="flex-none text-label tracking-label text-muted uppercase">
                {item.kind}
              </span>
              <button
                type="button"
                aria-label={`Remove ${fileName(item.src)}`}
                onClick={() => onChange(value.filter((m) => m.src !== item.src))}
                className="grid size-9 flex-none cursor-pointer place-items-center rounded-full text-muted hover:text-accent"
              >
                <SmallCloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < max && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void take([...e.dataTransfer.files]);
          }}
          className={`flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-row border border-dashed bg-field p-4 text-center transition-colors duration-150 hover:border-accent has-focus-visible:outline-2 has-focus-visible:outline-accent ${dragging ? 'border-accent' : 'border-line-input'}`}
        >
          <span className="text-meta">
            {busy ? (
              'Uploading…'
            ) : (
              <>
                Drop, paste or <span className="text-accent">browse</span>
              </>
            )}
          </span>
          <span className="text-label text-muted">{rule.acceptText}</span>
          <input
            ref={input}
            {...control}
            type="file"
            multiple
            accept={rule.accept}
            className="sr-only"
            onChange={(e) => {
              void take([...(e.target.files ?? [])]);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
