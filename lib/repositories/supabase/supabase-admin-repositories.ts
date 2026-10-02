import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminCollection, AdminRepositories } from '@/lib/domain/repositories';
import type { ArticleValues, Stamped } from '@/lib/domain/types';
import { toSummary } from '../article-record';
import {
  type ArticleRow,
  fromExperience,
  fromProfile,
  fromSettings,
  fromProject,
  fromQuote,
  fromSkillGroup,
  type ProfileRow,
  type SettingsRow,
  type SocialLinkRow,
  toArticleRecord,
  toExperience,
  toProfile,
  toSettings,
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

/** What the admin edits on an article, as columns (the excerpt is left alone, Q-A12). */
const ARTICLE_EDIT =
  'id, slug, title, body, external_url, status, published_at, read_minutes, listen, updated_at';
type ArticleEditRow = WithStamp<{
  id: string;
  slug: string;
  title: string;
  body: string | null;
  external_url: string | null;
  status: ArticleValues['status'];
  published_at: string;
  read_minutes: number | null;
  listen: boolean;
}>;
const toArticleValues = (r: ArticleEditRow) =>
  stamped(
    {
      id: r.id,
      slug: r.slug,
      title: r.title,
      body: r.body,
      externalUrl: r.external_url,
      status: r.status,
      publishedAt: r.published_at,
      readMinutes: r.read_minutes,
      listen: r.listen,
    },
    r,
  );
const fromArticleValues = (v: ArticleValues) => ({
  slug: v.slug,
  title: v.title,
  body: v.body,
  external_url: v.externalUrl,
  status: v.status,
  published_at: v.publishedAt,
  read_minutes: v.readMinutes,
  listen: v.listen,
});
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
    const values = (value: Partial<Omit<T, 'id' | 'sortOrder'>>): Record<string, unknown> => {
      const {
        id: _id,
        sort_order: _sortOrder,
        ...row
      } = fromDomain({
        ...value,
        id: '',
        sortOrder: 0,
      } as T) as Record<string, unknown>;
      // A patch maps only the fields it was given.
      return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
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
      update: (id, value) => change(id, value),
      patch: (id, value) => change(id, value),
      remove: (id) => setDeleted(table, id, true),
      restore: (id) => setDeleted(table, id, false),
      reorder: async (ids) => {
        const results = await Promise.all(
          ids.map((id, i) =>
            db
              .from(table)
              .update({ sort_order: i + 1 })
              .eq('id', id),
          ),
        );
        for (const result of results) written(result);
      },
    };

    async function change(id: string, value: Partial<Omit<T, 'id' | 'sortOrder'>>) {
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
    }
  }

  /** Soft delete or restore; false when no entry was in the other state. */
  async function setDeleted(table: string, id: string, deleted: boolean) {
    const query = db
      .from(table)
      .update({ deleted_at: deleted ? new Date().toISOString() : null })
      .eq('id', id);
    const found = written<{ id: string }[]>(
      await (deleted ? query.is('deleted_at', null) : query.not('deleted_at', 'is', null)).select(
        'id',
      ),
    );
    return found.length === 1;
  }

  const profileSelect = `${COLUMNS.profile}, updated_at`;
  const settingsSelect = `${COLUMNS.settings}, updated_at`;

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
    settings: {
      get: async () => {
        const row = rows<WithStamp<SettingsRow>>(
          await db.from('settings').select(settingsSelect).single(),
        );
        return stamped(toSettings(row), row);
      },
      update: async (settings) => {
        const row = written<WithStamp<SettingsRow>>(
          await db
            .from('settings')
            .update(fromSettings(settings))
            .eq('id', true)
            .select(settingsSelect)
            .single(),
        );
        return stamped(toSettings(row), row);
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
        rows<WithStamp<ArticleRow & { id: string }>[]>(
          await db
            .from('article')
            .select(`id, ${COLUMNS.article}, updated_at`)
            .is('deleted_at', null)
            .order('published_at', { ascending: false }),
        ).map((row) => stamped({ id: row.id, ...toSummary(toArticleRecord(row)) }, row)),
      get: async (id) => {
        const row = rows<ArticleEditRow | null>(
          await db
            .from('article')
            .select(ARTICLE_EDIT)
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle(),
        );
        return row && toArticleValues(row);
      },
      create: async (values) =>
        toArticleValues(
          written<ArticleEditRow>(
            await db
              .from('article')
              .insert({ ...fromArticleValues(values), excerpt: '' })
              .select(ARTICLE_EDIT)
              .single(),
          ),
        ),
      update: async (id, values) => {
        const row = written<ArticleEditRow | null>(
          await db
            .from('article')
            .update(fromArticleValues(values))
            .eq('id', id)
            .is('deleted_at', null)
            .select(ARTICLE_EDIT)
            .maybeSingle(),
        );
        return row && toArticleValues(row);
      },
      setStatus: async (id, status) => {
        const found = written<{ id: string }[]>(
          await db
            .from('article')
            .update({ status })
            .eq('id', id)
            .is('deleted_at', null)
            .select('id'),
        );
        return found.length === 1;
      },
      remove: (id) => setDeleted('article', id, true),
      restore: (id) => setDeleted('article', id, false),
    },
    skills: collection('skill_group', COLUMNS.skillGroup, toSkillGroup, fromSkillGroup),
    quotes: collection('quote', COLUMNS.quote, toQuote, fromQuote),
  };
}
