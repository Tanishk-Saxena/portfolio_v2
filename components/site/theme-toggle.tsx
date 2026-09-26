'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { applyTheme, readTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

// The theme lives on <html data-theme> (set pre-paint by the inline script). This component
// only mirrors it, so there's no hydration flash and no duplicated state.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => 'light');

  // Dev-only: Strict Mode's remount resets <html> attributes; re-apply the stored choice.
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') applyTheme(stored);
    } catch {}
  }, []);

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={() => applyTheme(dark ? 'light' : 'dark')}
      className="grid size-11.5 flex-none cursor-pointer place-items-center rounded-full border border-border-control transition-[border-color,background-color] duration-300 hover:border-accent active:border-accent-fill active:bg-accent-fill"
    >
      {/* Half-filled dial; turns over in dark mode (spec §6 ThemeToggle). */}
      <span
        aria-hidden="true"
        className="size-4.25 rounded-full border-[1.5px] border-accent bg-[linear-gradient(90deg,var(--accent)_50%,transparent_50%)] transition-transform duration-[calc(500ms*var(--motion))] ease-dial dark:rotate-180"
      />
    </button>
  );
}
