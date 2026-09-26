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
