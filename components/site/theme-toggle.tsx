'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { applyTheme, readTheme, themeStorageKey, type Theme } from '@/lib/theme';

// The theme lives on <html data-theme> (set pre-paint by the inline script). This component
// only mirrors it, so there's no hydration flash and no duplicated state.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/**
 * `site`: a pressed-state button named "Dark mode". `admin`: names the mode it switches to,
 * on the admin's outline (ADMIN-DESIGN-SPEC §5); `small` is the sidebar's 40px circle.
 */
export function ThemeToggle({
  variant = 'site',
  small = false,
}: {
  variant?: 'site' | 'admin';
  small?: boolean;
}) {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => 'light');

  // Dev-only: Strict Mode's remount resets <html> attributes; re-apply the stored choice.
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(themeStorageKey(location.pathname));
      if (stored === 'light' || stored === 'dark') applyTheme(stored);
    } catch {}
  }, []);

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      aria-label={variant === 'admin' ? `Switch to ${dark ? 'light' : 'dark'} mode` : 'Dark mode'}
      aria-pressed={variant === 'admin' ? undefined : dark}
      onClick={() => applyTheme(dark ? 'light' : 'dark')}
      data-ripple="accent-fill"
      className={`grid flex-none cursor-pointer place-items-center rounded-full border ${variant === 'admin' ? `border-line ${small ? 'size-10' : 'size-11'}` : 'size-11.5 border-border-control'} transition-[border-color,background-color] duration-300 hover:border-accent`}
    >
      {/* Half-filled dial; turns over in dark mode (spec §6 ThemeToggle). */}
      <span
        aria-hidden="true"
        className="size-4.25 rounded-full border-[1.5px] border-accent bg-[linear-gradient(90deg,var(--accent)_50%,transparent_50%)] transition-transform duration-[calc(500ms*var(--motion))] ease-dial dark:rotate-180"
      />
    </button>
  );
}
