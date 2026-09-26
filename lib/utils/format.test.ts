import { describe, expect, it } from 'vitest';
import { formatLongDate, formatMonthYear, formatProjectKind, formatYearRange } from './format';

describe('format', () => {
  it('formats list and article dates as mocked', () => {
    expect(formatMonthYear('2026-08-14')).toBe('Aug 2026');
    expect(formatLongDate('2026-08-14')).toBe('14 August 2026');
  });

  it('accepts month-precision dates', () => {
    expect(formatMonthYear('2024-07')).toBe('Jul 2024');
  });

  it('formats year ranges with a spaced em dash', () => {
    expect(formatYearRange('2023-01', null)).toBe('2023 — now');
    expect(formatYearRange('2021-01', '2023-01')).toBe('2021 — 2023');
    expect(formatYearRange('2024-02', '2024-09')).toBe('2024');
  });

  it('labels project kinds', () => {
    expect(formatProjectKind('open-source')).toBe('Open source');
    expect(formatProjectKind('client-work')).toBe('Client work');
  });
});
