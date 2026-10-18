'use client';

import { useEffect } from 'react';

/**
 * Holds the page still while `locked` (the open nav menu, owner spec §10): the root stops
 * scrolling and keeps its scrollbar's room, so nothing shifts sideways on desktop. A script's
 * own scroll (the jump to a chosen section) still goes through.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { style } = document.documentElement;
    const before = { overflow: style.overflow, gutter: style.scrollbarGutter };
    style.scrollbarGutter = 'stable';
    style.overflow = 'hidden';
    return () => {
      style.overflow = before.overflow;
      style.scrollbarGutter = before.gutter;
    };
  }, [locked]);
}
