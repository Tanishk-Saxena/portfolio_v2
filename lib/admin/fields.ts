import type { SectionSlug } from './sections';

/*
 * The editor's fields per section ([S] `SCHEMAS`, ADMIN-DESIGN-SPEC §8). Copy (labels, hints,
 * placeholders) is the mockup's; fields the mockup lacks are tagged with their decision.
 * Plain data only: it crosses to the client.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'year'
  | 'date'
  | 'minutes'
  | 'toggle'
  | 'tags'
  | 'select'
  | 'markdown'
  | 'image'
  | 'pdf'
  | 'media'
  | 'range';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  req?: boolean;
  max?: number;
  rows?: number;
  hint?: string;
  placeholder?: string;
  /** In the side panel (wide) / under the main fields (phones). */
  side?: boolean;
  /** Toggle labels for on and off. */
  on?: string;
  off?: string;
  /** Pills for `select`. */
  options?: { value: string; label: string }[];
  /** `tags` and `media`: how many the list holds, a hard limit (owner, ADMIN-DESIGN-SPEC §14). */
  minItems?: number;
  maxItems?: number;
  /** `range`: bounds, step and the unit shown beside the value. */
  min?: number;
  step?: number;
  unit?: string;
  /** Hidden (not disabled) while this toggle is on (§7.2). */
  hideIf?: string;
}

/** An uploaded image as the form holds it: the domain `Image` minus what the server adds. */
export interface ImageValue {
  src: string;
  width: number;
  height: number;
}

/** One item of a project's modal media, as the form holds it. */
export interface MediaValue {
  kind: 'image' | 'video';
  src: string;
}

export type DraftValue = string | boolean | string[] | ImageValue | MediaValue[] | null;
export type Draft = Record<string, DraftValue>;
export type FieldErrors = Record<string, string>;

/** Every section has a form. */
export type FormSlug = SectionSlug;

export const FIELDS: Record<FormSlug, FieldDef[]> = {
  hero: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', hint: 'Small capitals above the headline.' },
    { key: 'headline', label: 'Headline', type: 'text', req: true },
    {
      key: 'headlineHighlight',
      label: 'Highlighted word',
      type: 'text',
      hint: 'Set in the handwriting face. Must appear in the headline.',
    },
    { key: 'standfirst', label: 'Intro', type: 'textarea', rows: 3 },
    {
      key: 'resumeUrl',
      label: 'Résumé',
      type: 'pdf',
      side: true,
      hint: 'Served by the “Download résumé” button.',
    },
    { key: 'ctaLabel', label: 'Secondary button', type: 'text', side: true },
    // [ASSUMED] Q-A8: the domain needs these and the mockup has no home for them.
    { key: 'name', label: 'Name', type: 'text', req: true, side: true },
    { key: 'location', label: 'Location', type: 'text', side: true },
  ],
  about: [
    { key: 'aboutLead', label: 'Lead line', type: 'textarea', rows: 2, req: true },
    {
      key: 'aboutBody',
      label: 'Body',
      type: 'textarea',
      rows: 9,
      hint: 'Leave a blank line between paragraphs.',
    },
    {
      key: 'portrait',
      label: 'Portrait',
      type: 'image',
      side: true,
      hint: '4:5, at least 900 px wide.',
    },
  ],
  contact: [
    { key: 'contactStatement', label: 'Heading', type: 'text', req: true },
    { key: 'email', label: 'Email', type: 'email', req: true },
    { key: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/…' },
    { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/…' },
    { key: 'read-cv', label: 'Read.cv', type: 'url', placeholder: 'https://read.cv/…' },
    {
      key: 'x',
      label: 'X',
      type: 'url',
      placeholder: 'https://x.com/…',
      hint: 'Links left empty are hidden on the site.',
    },
    { key: 'footerNote', label: 'Footer note', type: 'text' }, // [ASSUMED] Q-A8
  ],
  experience: [
    { key: 'role', label: 'Title', type: 'text', req: true },
    { key: 'org', label: 'Company', type: 'text', req: true },
    {
      key: 'summary',
      label: 'Description',
      type: 'textarea',
      rows: 5,
      hint: 'Shown when the row is expanded.',
    },
    {
      key: 'startYear',
      label: 'Start year',
      type: 'year',
      req: true,
      side: true,
      placeholder: '2023',
    },
    {
      key: 'current',
      label: 'Current role',
      type: 'toggle',
      side: true,
      on: 'Shows “now”',
      off: 'Has an end year',
    },
    {
      key: 'endYear',
      label: 'End year',
      type: 'year',
      side: true,
      placeholder: '2025',
      hideIf: 'current',
    },
  ],
  projects: [
    { key: 'title', label: 'Name', type: 'text', req: true },
    {
      key: 'kind',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'open-source', label: 'Open source' },
        { value: 'side-project', label: 'Side project' },
        { value: 'client-work', label: 'Client work' },
      ],
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 5,
      max: 320,
      hint: 'Shown in the project modal, which does not scroll. Keep it under 320 characters.',
    },
    {
      key: 'tags',
      label: 'Stack',
      type: 'tags',
      placeholder: 'Add and press Enter',
      hint: 'Up to four read best.',
    },
    { key: 'liveUrl', label: 'Live URL', type: 'url', placeholder: 'https://' },
    { key: 'repoUrl', label: 'Repository URL', type: 'url', placeholder: 'https://github.com/…' },
    {
      key: 'published',
      label: 'Visibility',
      type: 'toggle',
      side: true,
      on: 'Published',
      off: 'Hidden from the site',
    },
    { key: 'year', label: 'Year', type: 'year', req: true, side: true },
    {
      key: 'image',
      label: 'Cover image',
      type: 'image',
      side: true,
      hint: '4:3, at least 1200 px wide.',
    },
    {
      key: 'media',
      label: 'Modal media',
      type: 'media',
      maxItems: 6,
      hint: 'Optional. Shown in the modal in this order, in place of the cover: images, GIFs or short videos. The card keeps the cover.',
    },
  ],
  writing: [
    { key: 'title', label: 'Title', type: 'text', req: true },
    { key: 'body', label: 'Body', type: 'markdown', placeholder: 'Start writing…' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      side: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
      ],
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      req: true,
      side: true,
      hint: 'Lives at /articles/[slug]. Filled from the title until you edit it.',
    },
    { key: 'publishedAt', label: 'Publish date', type: 'date', side: true },
    { key: 'readMinutes', label: 'Read time', type: 'minutes', side: true, placeholder: 'Auto' },
    {
      key: 'listen',
      label: 'Listen button',
      type: 'toggle',
      side: true,
      on: 'Text-to-speech shown',
      off: 'Hidden',
    },
    {
      // [ASSUMED] Q-A12: the site already links out for articles without a body.
      key: 'externalUrl',
      label: 'External URL',
      type: 'url',
      side: true,
      placeholder: 'https://',
      hint: 'Instead of a body: where the article lives, like Medium. One or the other.',
    },
  ],
  skills: [
    { key: 'title', label: 'Column heading', type: 'text', req: true },
    {
      key: 'items',
      label: 'Items',
      type: 'tags',
      minItems: 4,
      maxItems: 6,
      placeholder: 'Add and press Enter',
      hint: 'Shown in this order. Four to six per column.',
    },
  ],
  quotes: [
    {
      key: 'text',
      label: 'Quote',
      type: 'textarea',
      rows: 3,
      req: true,
      max: 140,
      hint: 'The quote box has a fixed height. 140 characters fits on every screen.',
    },
    { key: 'author', label: 'Attribution', type: 'text', req: true },
    {
      key: 'active',
      label: 'In rotation',
      type: 'toggle',
      side: true,
      on: 'Shown',
      off: 'Skipped',
    },
  ],
  // §8.9 (owner, §14): style settings to demo and choose between. Defaults = the shipped look.
  settings: [
    {
      key: 'siteTitle',
      label: 'Site title',
      type: 'text',
      req: true,
      max: 70,
      hint: 'The home page’s tab title, and its title when shared or found in a search.',
    },
    {
      key: 'siteDescription',
      label: 'Site description',
      type: 'textarea',
      rows: 3,
      max: 200,
      hint: 'One or two sentences, shown under the title in search results and share previews.',
    },
    {
      key: 'accent',
      label: 'Accent',
      type: 'select',
      options: [
        { value: 'terracotta', label: 'Terracotta' },
        { value: 'slate', label: 'Slate blue' },
      ],
      hint: 'The dark-mode accent is derived from this.',
    },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 24, step: 0.5, unit: '%' },
    {
      key: 'navPosition',
      label: 'Navigation button',
      type: 'select',
      options: [
        { value: 'right', label: 'Bottom right' },
        { value: 'centre', label: 'Bottom centre' },
      ],
    },
    {
      key: 'menuLayout',
      label: 'Menu layout',
      type: 'select',
      options: [
        { value: 'arc', label: 'Arc' },
        { value: 'wheel', label: 'Centre wheel' },
      ],
    },
    {
      key: 'pressFeedback',
      label: 'Press feedback',
      type: 'select',
      options: [
        { value: 'ripple', label: 'Ripple' },
        { value: 'ring', label: 'Ring' },
        { value: 'press', label: 'Press-in' },
      ],
      hint: 'What a press looks like, on the site and here.',
    },
    {
      key: 'mediaAutoRotate',
      label: 'Project media',
      type: 'toggle',
      on: 'Moves on by itself: 5 seconds an image, a video when it ends',
      off: 'Stays until swiped or clicked',
    },
  ],
};
