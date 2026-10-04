import type { ContributionCalendar, ContributionDay } from '@/lib/domain/types';

// PLACEHOLDER — a made-up year of activity, the same on every build: 53 weeks ending on a
// fixed Saturday, busier on weekdays, with a quiet fortnight. GitHub's real calendar replaces
// it once DATA_SOURCE=supabase has a username (Settings) and a GITHUB_TOKEN.
const LAST_DAY = Date.UTC(2026, 9, 3); // Saturday 3 October 2026
const WEEKS = 53;
const DAY_MS = 24 * 60 * 60 * 1000;

function build(): ContributionCalendar {
  let seed = 20261003;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const weeks: ContributionDay[][] = [];
  let total = 0;
  for (let w = 0; w < WEEKS; w += 1) {
    const week: ContributionDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      const time = LAST_DAY - ((WEEKS - 1 - w) * 7 + (6 - d)) * DAY_MS;
      const weekend = d === 0 || d === 6;
      const quiet = w === 30 || w === 31;
      const roll = random();
      const busy = quiet ? 0 : weekend ? roll * 0.6 : roll;
      const level = (busy < 0.3 ? 0 : busy < 0.55 ? 1 : busy < 0.75 ? 2 : busy < 0.9 ? 3 : 4) as
        0 | 1 | 2 | 3 | 4;
      const count = [0, 2, 5, 9, 14][level];
      total += count;
      week.push({ date: new Date(time).toISOString().slice(0, 10), count, level });
    }
    weeks.push(week);
  }
  return { total, weeks };
}

export const contributions: ContributionCalendar = build();
