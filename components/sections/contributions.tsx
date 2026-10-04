import type { ContributionCalendar, ContributionDay } from '@/lib/domain/types';

const LEVEL = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const;

/** Phones show the latest half year: a full year of columns would be too thin to read. */
const NARROW_WEEKS = 26;

const utc = (date: string) => new Date(`${date}T00:00:00Z`);
const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const dayMonth = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const number = new Intl.NumberFormat('en-GB');

const tooltip = (day: ContributionDay) =>
  `${day.count === 0 ? 'No' : number.format(day.count)} contribution${day.count === 1 ? '' : 's'} on ${dayMonth.format(utc(day.date))}`;

/**
 * The GitHub contribution heat map (spec §10 "Contributions"): a year of days as a grid of
 * weeks, tinted with the site's accent, never GitHub's green. It sits under the skills grid
 * as part of that section. One image to assistive tech (the total is its name); the cells'
 * tooltips are a pointer nicety. Static: no motion, no script.
 */
export function Contributions({ calendar }: { calendar: ContributionCalendar }) {
  const { weeks, total } = calendar;
  const hiddenOnNarrow = weeks.length - NARROW_WEEKS;
  const summary = `${number.format(total)} contribution${total === 1 ? '' : 's'} on GitHub in the last year`;

  return (
    <div className="mt-grid-skills-row">
      <div className="mb-4.5 flex items-baseline justify-between gap-4">
        <h3 className="text-label font-medium tracking-label text-muted uppercase">
          Contributions
        </h3>
        <p className="text-small text-muted tabular-nums">
          {number.format(total)} in the last year
        </p>
      </div>
      <div role="img" aria-label={summary} className="flex gap-0.75">
        {weeks.map((week, i) => {
          // A month is named above the week it begins in; not on the last weeks, where the
          // name would run past the edge.
          const started =
            i > 0 && month.format(utc(week[0].date)) !== month.format(utc(weeks[i - 1][0].date));
          const label = started && i < weeks.length - 2 ? month.format(utc(week[0].date)) : '';
          // Seven slots, Sunday first: the first and last weeks may be partial.
          const slots = Array.from({ length: 7 }, (_, weekday) =>
            week.find((day) => utc(day.date).getUTCDay() === weekday),
          );
          return (
            <div
              key={week[0].date}
              aria-hidden="true"
              className={`min-w-0 flex-1 flex-col gap-0.75 ${i < hiddenOnNarrow ? 'hidden @wide/page:flex' : 'flex'}`}
            >
              <span className="h-5 text-label whitespace-nowrap text-muted">{label}</span>
              {slots.map((day, weekday) =>
                day ? (
                  <span
                    key={weekday}
                    title={tooltip(day)}
                    className={`aspect-square rounded-xs ${LEVEL[day.level]}`}
                  />
                ) : (
                  <span key={weekday} className="aspect-square" />
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
