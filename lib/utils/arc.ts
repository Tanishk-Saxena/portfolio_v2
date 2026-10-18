import type { MenuLayout } from '@/lib/domain/types';

/**
 * Angles (degrees) for items spread evenly along an arc, as in the mockup's floating nav
 * (spec §5.3 "Nav geometry"): the bottom-right dock fans items from −177° (left) to −93°
 * (up). 0° points right; negative angles turn upwards (screen coordinates).
 */
export function arcAngles(count: number, from = -177, to = -93): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(from + to) / 2];
  return Array.from({ length: count }, (_, i) => from + ((to - from) * i) / (count - 1));
}

/**
 * Where the menu's items sit (Settings → Menu layout, ADMIN-DESIGN-SPEC §8.9): along the
 * bottom-right arc, or evenly round a full wheel starting straight up (θ = −90° + 360° × i / n).
 * The button is always bottom right (owner, spec §10: the centre position is gone).
 */
export function navAngles(count: number, layout: MenuLayout): number[] {
  if (layout === 'wheel') return Array.from({ length: count }, (_, i) => -90 + (360 * i) / count);
  return arcAngles(count);
}
