import { describe, expect, it } from 'vitest';
import { arcAngles } from './arc';

describe('arcAngles', () => {
  it('spreads six items evenly from −177° to −93° (the mockup geometry)', () => {
    const angles = arcAngles(6);
    expect(angles[0]).toBe(-177);
    expect(angles[5]).toBe(-93);
    expect(angles[1] - angles[0]).toBeCloseTo(16.8);
  });

  it('centres a single item and handles empty lists', () => {
    expect(arcAngles(1)).toEqual([-135]);
    expect(arcAngles(0)).toEqual([]);
  });
});
