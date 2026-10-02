import type { MenuLayout, NavPosition } from '@/lib/domain/types';

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

/** The arc for each nav button position (spec §5.3): bottom-centre fans wider, both sides. */
const ARCS: Record<NavPosition, [from: number, to: number]> = {
  right: [-177, -93],
  centre: [-158, -22],
};

/**
 * Where the menu's items sit (Settings → Menu layout, ADMIN-DESIGN-SPEC §8.9): along the
 * position's arc, or evenly round a full wheel starting straight up (θ = −90° + 360° × i / n).
 */
export function navAngles(count: number, position: NavPosition, layout: MenuLayout): number[] {
  if (layout === 'wheel') return Array.from({ length: count }, (_, i) => -90 + (360 * i) / count);
  return arcAngles(count, ...ARCS[position]);
}
