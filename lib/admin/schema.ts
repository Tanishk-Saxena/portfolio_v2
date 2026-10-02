import type { SectionSlug } from './sections';

/*
 * The editor's fields and their rules ([S] `SCHEMAS`, ADMIN-DESIGN-SPEC §8, §11). One module
 * for the client and the server: the editor validates with it before sending, and every
 * route handler parses and validates the same draft again, so the server repeats every
 * client rule. Plain data only: it crosses to the client.
 */

export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'year' | 'toggle' | 'tags';

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
  /** Hidden (not disabled) while this toggle is on (§7.2). */
  hideIf?: string;
}

export type DraftValue = string | boolean | string[];
export type Draft = Record<string, DraftValue>;
export type FieldErrors = Record<string, string>;

/** Sections with a form in 8.2. Projects and Writing arrive in 8.4, Settings in 8.5. */
export type FormSlug = Extract<
  SectionSlug,
  'hero' | 'about' | 'contact' | 'experience' | 'skills' | 'quotes'
>;

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
    // [ASSUMED] Q-A8: the domain needs these and the mockup has no home for them.
    { key: 'name', label: 'Name', type: 'text', req: true, side: true },
    { key: 'location', label: 'Location', type: 'text', side: true },
    { key: 'ctaLabel', label: 'Secondary button', type: 'text', side: true },
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
  skills: [
    { key: 'title', label: 'Column heading', type: 'text', req: true },
    {
      key: 'items',
      label: 'Items',
      type: 'tags',
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
};

export const isFormSlug = (slug: string): slug is FormSlug => Object.hasOwn(FIELDS, slug);

/** Whether a field is showing: fields tied to a toggle hide while it is on. */
export const isShown = (field: FieldDef, draft: Draft) => !(field.hideIf && draft[field.hideIf]);

/**
 * A draft from untrusted input: only this section's fields, each of its own type. Null when
 * the input has the wrong shape (the server answers 400).
 */
export function parseDraft(slug: FormSlug, input: unknown): Draft | null {
  if (typeof input !== 'object' || input === null) return null;
  const source = input as Record<string, unknown>;
  const draft: Draft = {};
  for (const field of FIELDS[slug]) {
    const value = source[field.key];
    if (field.type === 'toggle') {
      if (typeof value !== 'boolean') return null;
    } else if (field.type === 'tags') {
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) return null;
    } else if (typeof value !== 'string') return null;
    draft[field.key] = value;
  }
  return draft;
}

const URL_RE = /^https?:\/\/\S+\.\S+/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const YEAR_RE = /^\d{4}$/;

/** Every rule from §11, keyed by field. Empty when the draft can be saved. */
export function validate(slug: FormSlug, draft: Draft): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELDS[slug]) {
    if (!isShown(field, draft)) continue;
    const value = draft[field.key];
    const text = typeof value === 'string' ? value.trim() : '';
    if (field.req && typeof value === 'string' && text === '') {
      errors[field.key] = `${field.label} is required.`;
    } else if (field.max && typeof value === 'string' && value.length > field.max) {
      errors[field.key] = `Too long: ${value.length} of ${field.max} characters.`;
    } else if (field.type === 'url' && text && !URL_RE.test(text)) {
      errors[field.key] = 'Enter a full address starting with https://';
    } else if (field.type === 'email' && text && !EMAIL_RE.test(text)) {
      errors[field.key] = 'Enter a valid email address.';
    } else if (field.type === 'year' && text && !YEAR_RE.test(text)) {
      errors[field.key] = 'Enter a four-digit year.'; // [ASSUMED] Q-A23
    }
  }

  if (slug === 'hero') {
    const word = String(draft.headlineHighlight).trim();
    if (word && !String(draft.headline).includes(word) && !errors.headline) {
      errors.headlineHighlight = `“${word}” does not appear in the headline.`;
    }
  }
  if (slug === 'experience' && !draft.current && !errors.endYear) {
    const [start, end] = [String(draft.startYear).trim(), String(draft.endYear).trim()];
    if (!end) errors.endYear = 'Add an end year or mark this as the current role.';
    else if (YEAR_RE.test(start) && end < start) {
      errors.endYear = 'The end year can’t be before the start year.'; // [ASSUMED] Q-A23
    }
  }
  return errors;
}
