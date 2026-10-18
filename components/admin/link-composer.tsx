'use client';

import { useId, useState } from 'react';
import { type LinkValue, linkProblem } from '@/lib/admin/schema';
import { OUTLINE_PILL } from './admin-classes';
import { WELL } from './field';

/*
 * A link's id. `crypto.randomUUID` exists only on https and localhost, so the phone on the
 * LAN address (plain http) builds one from `getRandomValues`, which works everywhere.
 */
const newId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');

/**
 * The new-link row under the contact links (owner, ADMIN-DESIGN-SPEC §14): a label and a URL,
 * then Add. A link joins the list only once both are right, so an empty one never exists.
 * Enter in either input adds too.
 */
export function LinkComposer({ max, onAdd }: { max?: number; onAdd: (link: LinkValue) => void }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>();
  const errorId = useId();

  function add() {
    const problem = linkProblem({ label, url }, max, 'The new link');
    setError(problem);
    if (problem) return;
    onAdd({ id: newId(), label: label.trim(), url: url.trim() });
    setLabel('');
    setUrl('');
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    add();
  };
  const control = {
    onKeyDown,
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': error ? true : undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-2 @wide:flex-row">
        <input
          {...control}
          type="text"
          aria-label="Label of the new link"
          value={label}
          placeholder="Label, e.g. GitHub"
          onChange={(e) => setLabel(e.target.value)}
          className={`${WELL} h-11 px-3 @wide:w-44 @wide:flex-none`}
        />
        <input
          {...control}
          type="url"
          aria-label="URL of the new link"
          value={url}
          placeholder="https://"
          onChange={(e) => setUrl(e.target.value)}
          className={`${WELL} h-11 min-w-0 px-3 @wide:flex-1`}
        />
        <button
          type="button"
          onClick={add}
          className={`${OUTLINE_PILL} cursor-pointer justify-center`}
        >
          Add link
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-admin-hint font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
