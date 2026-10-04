import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGithubContributions, toCalendar } from './github-contributions';

const day = (date: string, contributionCount: number, contributionLevel: string) => ({
  date,
  contributionCount,
  contributionLevel,
});
const response = (weeks: unknown[], totalContributions = 7) => ({
  data: {
    user: { contributionsCollection: { contributionCalendar: { totalContributions, weeks } } },
  },
});

describe('GitHub contributions', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps the API calendar to the domain; anything else is no calendar', () => {
    const calendar = toCalendar(
      response([
        {
          contributionDays: [day('2026-09-26', 0, 'NONE'), day('2026-09-27', 3, 'SECOND_QUARTILE')],
        },
        { contributionDays: [] }, // dropped
        {
          contributionDays: [day('2026-09-28', 4, 'FOURTH_QUARTILE'), day('2026-09-29', 1, 'NEW')],
        },
      ]),
    );
    expect(calendar).toEqual({
      total: 7,
      weeks: [
        [
          { date: '2026-09-26', count: 0, level: 0 },
          { date: '2026-09-27', count: 3, level: 2 },
        ],
        [
          { date: '2026-09-28', count: 4, level: 4 },
          { date: '2026-09-29', count: 1, level: 0 }, // an unknown level reads as none
        ],
      ],
    });
    for (const nothing of [null, {}, { data: { user: null } }, { errors: [{}] }, response([])]) {
      expect(toCalendar(nothing)).toBeNull();
    }
  });

  it('asks GitHub only with a token and a username, and never throws', async () => {
    const fetched = vi.fn(async () =>
      Response.json(response([{ contributionDays: [day('2026-09-27', 2, 'FIRST_QUARTILE')] }], 2)),
    );
    vi.stubGlobal('fetch', fetched);
    expect(await createGithubContributions('').get('octocat')).toBeNull();
    expect(await createGithubContributions('token').get('  ')).toBeNull();
    expect(fetched).not.toHaveBeenCalled();

    expect((await createGithubContributions('token').get(' octocat '))?.total).toBe(2);
    const [, init] = fetched.mock.calls[0] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token');
    expect(JSON.parse(String(init.body)).variables).toEqual({ login: 'octocat' });

    vi.stubGlobal('fetch', async () => new Response('no', { status: 401 }));
    expect(await createGithubContributions('bad').get('octocat')).toBeNull();
    vi.stubGlobal('fetch', async () => Promise.reject(new Error('offline')));
    expect(await createGithubContributions('token').get('octocat')).toBeNull();
  });
});
