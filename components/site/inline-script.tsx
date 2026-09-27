'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * A blocking inline script (pre-paint theme, etc.) rendered only in the server HTML. During
 * hydration it matches that HTML; afterwards, and in any pure client render (e.g. a 404 in
 * dev), it renders nothing, so React never creates a <script> in the browser (which it warns
 * about, and would never execute anyway). The script has already run by then.
 */
export function InlineScript({ html }: { html: string }) {
  const serverOrHydrating = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
  return serverOrHydrating ? <script dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
