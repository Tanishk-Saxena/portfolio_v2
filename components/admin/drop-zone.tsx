'use client';

import { type KeyboardEvent, useId, useRef, useState } from 'react';

/**
 * The add zone of the file and media fields (owner, ADMIN-DESIGN-SPEC §14): a paste target, a
 * drop target, and an **Open files** button, which alone opens the file picker. Pressing the
 * zone only focuses it, ready for a paste (Ctrl+V / ⌘V, or a long press → Paste on a phone).
 *
 * The paste target is an editable box with `inputMode="none"`: an editable element is what
 * phones offer Paste on, and inputMode keeps their keyboard away. Typing is refused; a paste
 * hands its files on and inserts nothing.
 */
export function DropZone({
  id,
  accept,
  acceptText,
  multiple = false,
  busy,
  onFiles,
  ...control
}: {
  id: string;
  accept: string;
  acceptText: string;
  multiple?: boolean;
  busy: boolean;
  onFiles: (files: File[]) => void;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const howId = useId();
  const describedBy = [howId, control['aria-describedby']].filter(Boolean).join(' ');

  // Only moving focus away and pasting get through; nothing is typed into the box.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles([...e.dataTransfer.files]);
      }}
      className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-row border border-dashed bg-field p-4 text-center transition-[border-color,box-shadow] duration-150 focus-within:border-solid focus-within:border-accent focus-within:ring-3 focus-within:ring-halo hover:border-accent ${dragging ? 'border-accent' : 'border-line-input'}`}
    >
      <div
        id={id}
        role="textbox"
        aria-labelledby={control['aria-labelledby']}
        aria-describedby={describedBy}
        aria-multiline="false"
        contentEditable
        suppressContentEditableWarning
        inputMode="none"
        spellCheck={false}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBeforeInput={(e) => e.preventDefault()}
        onPaste={(e) => {
          e.preventDefault();
          const files = [...e.clipboardData.files];
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
        onFocus={() => setReady(true)}
        onBlur={() => setReady(false)}
        className="absolute inset-0 cursor-text rounded-row caret-transparent outline-none"
      />
      <span id={howId} className="pointer-events-none relative text-meta">
        {busy
          ? 'Uploading…'
          : ready
            ? 'Ready: paste now, or drop'
            : 'Drop here, or press here and paste'}
      </span>
      <span className="pointer-events-none relative text-label text-muted">{acceptText}</span>
      <button
        type="button"
        data-ripple="paper"
        onClick={() => input.current?.click()}
        className="relative mt-1 inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-meta font-medium text-accent hover:underline"
      >
        Open files
      </button>
      <input
        ref={input}
        type="file"
        multiple={multiple}
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
