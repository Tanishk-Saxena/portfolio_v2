import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import type { Stamped } from '@/lib/domain/types';
import { toSummary } from '../article-record';
import {
  type ArticleRow,
  fromExperience,
  fromProfile,
  fromProject,
  fromQuote,
  fromSkillGroup,
  type ProfileRow,
  type SocialLinkRow,
  toArticleRecord,
  toExperience,
  toProfile,
  toProject,
  toQuote,
  toSkillGroup,
  toSocialLink,
} from './rows';
import { COLUMNS, rows } from './supabase-repositories';

/*
 * The admin over Supabase. `db` must carry the admin's session (`lib/auth/server.ts`): RLS
 * then lets the hidden rows through and allows the writes. With any other key, reads
 * quietly return only public rows and writes fail. Every write repeats the soft-delete
 * filter, so a deleted entry can't be edited back to life.
 */

type WithStamp<R> = R & { updated_at: string | null };
const stamped = <T>(value: T, row: { updated_at: string | null }): Stamped<T> => ({
  ...value,
  updatedAt: row.updated_at,
});

/** A failed write is an error the handler reports, never a silent no-op. */
function written<T>(result: { data: unknown; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase write failed: ${result.error.message}`);
  return result.data as T;
}

export function createSupabaseAdminRepositories(db: SupabaseClient): AdminRepositories {
  function collection<T extends { id: string; sortOrder: number }, R extends object>(
    table: string,
    columns: string,
    toDomain: (row: R) => T,
    fromDomain: (value: T) => R,
  ): AdminCollection<T> {
    const select = `${columns}, updated_at`;
    const live = () => db.from(table).select(select).is('deleted_at', null);
    // The writable columns: the id is the database's to give, the position is reorder's.
    const values = (value: Omit<T, 'id' | 'sortOrder'>): Record<string, unknown> => {
      const {
        id: _id,
        sort_order: _sortOrder,
        ...row
      } = fromDomain({
        ...value,
        id: '',
        sortOrder: 0,
      } as T) as Record<string, unknown>;
      return row;
    };
    const toStamped = (row: WithStamp<R>) => stamped(toDomain(row), row);

    return {
      list: async () => rows<WithStamp<R>[]>(await live().order('sort_order')).map(toStamped),
      create: async (value) => {
        const last = rows<{ sort_order: number } | null>(
          await db
            .from(table)
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1)
            .maybeSingle(),
        );
        const row = written<WithStamp<R>>(
          await db
            .from(table)
            .insert({ ...values(value), sort_order: (last?.sort_order ?? 0) + 1 })
            .select(select)
            .single(),
        );
        return toStamped(row);
      },
      update: async (id, value) => {
        const row = written<WithStamp<R> | null>(
          await db
            .from(table)
            .update(values(value))
            .eq('id', id)
            .is('deleted_at', null)
            .select(select)
            .maybeSingle(),
        );
        return row && toStamped(row);
      },
    };
  }

  const profileSelect = `${COLUMNS.profile}, updated_at`;

  return {
    profile: {
      get: async () => {
        const row = rows<WithStamp<ProfileRow>>(
          await db.from('profile').select(profileSelect).single(),
        );
        return stamped(toProfile(row), row);
      },
      update: async (profile) => {
        const row = written<WithStamp<ProfileRow>>(
          await db
            .from('profile')
            .update(fromProfile(profile))
            .eq('id', true)
            .select(profileSelect)
            .single(),
        );
        return stamped(toProfile(row), row);
      },
    },
    socialLinks: {
      list: async () =>
        rows<SocialLinkRow[]>(
          await db
            .from('social_link')
            .select(COLUMNS.socialLink)
            .is('deleted_at', null)
            .order('sort_order'),
        ).map(toSocialLink),
      setUrls: async (urls) => {
        const results = await Promise.all(
          Object.entries(urls).map(([id, url]) =>
            db.from('social_link').update({ url }).eq('id', id).is('deleted_at', null),
          ),
        );
        for (const result of results) written(result);
      },
    },
    experience: collection('experience', COLUMNS.experience, toExperience, fromExperience),
    projects: collection('project', COLUMNS.project, toProject, fromProject),
    articles: {
      list: async () =>
        rows<(ArticleRow & { id: string })[]>(
          await db
            .from('article')
            .select(`id, ${COLUMNS.article}`)
            .is('deleted_at', null)
            .order('published_at', { ascending: false }),
        ).map((row) => ({ id: row.id, ...toSummary(toArticleRecord(row)) })),
    },
    skills: collection('skill_group', COLUMNS.skillGroup, toSkillGroup, fromSkillGroup),
    quotes: collection('quote', COLUMNS.quote, toQuote, fromQuote),
  };
}
