import { getRepositories } from '@/lib/container';
import type { Accent } from '@/lib/domain/types';

/**
 * Each accent's base colour, as in styles/tokens.css (`--accent-base`): light-mode text and
 * every fill. `next/og` can't read CSS variables, so the images take the hex from here.
 */
export const ACCENT_BASE: Record<Accent, string> = {
  terracotta: '#a9491f',
  slate: '#2f5d72',
};

/**
 * The saved accent (Settings, ADMIN-DESIGN-SPEC §8.9) for the share cards and app icons. They
 * are rendered at build time, so a deploy picks up the current setting (owner, §14); an admin
 * save also marks them stale, so they follow on their next request.
 */
export async function savedAccent(): Promise<string> {
  const settings = await getRepositories().settings.get();
  return ACCENT_BASE[settings.accent];
}
