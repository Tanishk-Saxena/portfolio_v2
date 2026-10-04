import type { ContributionRepository } from '@/lib/domain/repositories';
import type { ContributionCalendar, ContributionDay } from '@/lib/domain/types';

/*
 * The contribution calendar from GitHub's GraphQL API (owner, DESIGN-SPEC §10 "Contributions";
 * Phase 9 roadmap item 29e). Server only: the token never reaches the browser. The response
 * is cached and refetched at most once a day, so the page stays prerendered. Anything that
 * goes wrong (no token, no such user, GitHub down) is `null`: the site shows no heat map
 * and the build never fails over it.
 */

const ENDPOINT = 'https://api.github.com/graphql';
const ONE_DAY = 60 * 60 * 24;

const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS: Record<string, ContributionDay['level']> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface ApiDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

/** GitHub's response as the domain's calendar; null when it holds none. */
export function toCalendar(json: unknown): ContributionCalendar | null {
  const calendar = (
    json as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks: { contributionDays: ApiDay[] }[];
            };
          };
        } | null;
      };
    }
  )?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || !Array.isArray(calendar.weeks)) return null;
  const weeks = calendar.weeks
    .map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    )
    .filter((week) => week.length > 0);
  return weeks.length ? { total: calendar.totalContributions, weeks } : null;
}

export function createGithubContributions(
  token = process.env.GITHUB_TOKEN,
): ContributionRepository {
  return {
    get: async (username) => {
      const login = username.trim();
      if (!token || !login) return null;
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY, variables: { login } }),
          next: { revalidate: ONE_DAY },
        });
        return response.ok ? toCalendar(await response.json()) : null;
      } catch {
        return null;
      }
    },
  };
}
