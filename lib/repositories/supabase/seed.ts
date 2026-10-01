import type { FixtureDataset } from '../fixtures/dataset';
import {
  fromArticleRecord,
  fromExperience,
  fromProfile,
  fromProject,
  fromQuote,
  fromSettings,
  fromSkillGroup,
  fromSocialLink,
} from './rows';

/*
 * The seed SQL for a dataset: the shipped placeholders become the database's starting content
 * (brief §5). Written through the same row mappers the reads use, so the two can't drift.
 * `supabase/seed.sql` is this function's output for the default dataset, kept in sync by
 * seed.test.ts (regenerate with `npx vitest run seed -u`).
 */

type Value = string | number | boolean | null | string[] | object;

const text = (s: string) => `'${s.replaceAll("'", "''")}'`;

function literal(value: Value): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return text(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.length === 0 ? `'{}'::text[]` : `array[${value.map(text).join(', ')}]`;
  }
  return `${text(JSON.stringify(value))}::jsonb`;
}

function insert(table: string, rows: object[]): string {
  if (rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const values = rows
    .map((row) => {
      const record = row as Record<string, Value>;
      return `  (${columns.map((c) => literal(record[c])).join(', ')})`;
    })
    .join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values};\n`;
}

export function seedSql(data: FixtureDataset): string {
  return [
    '-- Generated from the fixtures by lib/repositories/supabase/seed.ts. Do not edit by hand.\n',
    insert('profile', [fromProfile(data.profile)]),
    insert('settings', [fromSettings(data.settings)]),
    insert('experience', data.experience.map(fromExperience)),
    insert('project', data.projects.map(fromProject)),
    insert('article', data.articles.map(fromArticleRecord)),
    insert('skill_group', data.skillGroups.map(fromSkillGroup)),
    insert('quote', data.quotes.map(fromQuote)),
    insert('social_link', data.socialLinks.map(fromSocialLink)),
  ]
    .filter(Boolean)
    .join('\n');
}
