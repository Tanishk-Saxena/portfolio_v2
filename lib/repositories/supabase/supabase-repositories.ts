import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repositories } from '@/lib/domain/repositories';
import { toArticle, toSummary } from '../article-record';
import {
  type ArticleRow,
  type ExperienceRow,
  type ProfileRow,
  type ProjectRow,
  type QuoteRow,
  type SettingsRow,
  type SkillGroupRow,
  type SocialLinkRow,
  toArticleRecord,
  toExperience,
  toProfile,
  toProject,
  toQuote,
  toSettings,
  toSkillGroup,
  toSocialLink,
} from './rows';

/*
 * The public repositories over Supabase, run with the publishable (anon) key. RLS already
 * limits anonymous reads to what the site shows; the same filters are repeated here so the
 * contract holds whichever key a caller uses (defence in depth, brief §6).
 */

export const COLUMNS = {
  profile:
    'name, eyebrow, headline, headline_highlight, standfirst, cta_label, about_lead, about_paragraphs, portrait, resume_url, email, contact_statement, location, footer_note',
  settings: 'accent, grain, nav_position, menu_layout, press_feedback',
  experience: 'id, role, org, start_date, end_date, summary, sort_order',
  project:
    'id, title, kind, year, description, tags, image, repo_url, live_url, published, sort_order',
  article: 'slug, title, excerpt, published_at, read_minutes, body, external_url, status, listen',
  skillGroup: 'id, title, items, sort_order',
  quote: 'id, text, author, active, sort_order',
  socialLink: 'id, label, url, sort_order',
} as const;

/** A failed read is a broken page, never an empty one: fail loudly. */
export function rows<T>({ data, error }: { data: unknown; error: { message: string } | null }): T {
  if (error) throw new Error(`Supabase read failed: ${error.message}`);
  return data as T;
}

export function createSupabaseRepositories(db: SupabaseClient): Repositories {
  const articles = () =>
    db.from('article').select(COLUMNS.article).is('deleted_at', null).eq('status', 'published');

  return {
    profile: {
      get: async () =>
        toProfile(rows<ProfileRow>(await db.from('profile').select(COLUMNS.profile).single())),
    },

    experience: {
      list: async () =>
        rows<ExperienceRow[]>(
          await db
            .from('experience')
            .select(COLUMNS.experience)
            .is('deleted_at', null)
            .order('sort_order'),
        ).map(toExperience),
    },

    projects: {
      list: async () =>
        rows<ProjectRow[]>(
          await db
            .from('project')
            .select(COLUMNS.project)
            .is('deleted_at', null)
            .eq('published', true)
            .order('sort_order'),
        ).map(toProject),
    },

    articles: {
      list: async () =>
        rows<ArticleRow[]>(await articles().order('published_at', { ascending: false }))
          .map(toArticleRecord)
          .map(toSummary),
      getBySlug: async (slug) => {
        const row = rows<ArticleRow | null>(await articles().eq('slug', slug).maybeSingle());
        return row ? toArticle(toArticleRecord(row)) : null;
      },
    },

    skills: {
      listGroups: async () =>
        rows<SkillGroupRow[]>(
          await db
            .from('skill_group')
            .select(COLUMNS.skillGroup)
            .is('deleted_at', null)
            .order('sort_order'),
        ).map(toSkillGroup),
    },

    quotes: {
      list: async () =>
        rows<QuoteRow[]>(
          await db
            .from('quote')
            .select(COLUMNS.quote)
            .is('deleted_at', null)
            .eq('active', true)
            .order('sort_order'),
        ).map(toQuote),
    },

    socialLinks: {
      list: async () =>
        rows<SocialLinkRow[]>(
          await db
            .from('social_link')
            .select(COLUMNS.socialLink)
            .is('deleted_at', null)
            .neq('url', '')
            .order('sort_order'),
        ).map(toSocialLink),
    },

    settings: {
      get: async () =>
        toSettings(rows<SettingsRow>(await db.from('settings').select(COLUMNS.settings).single())),
    },
  };
}
