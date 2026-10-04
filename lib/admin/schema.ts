import {
  type Draft,
  type DraftValue,
  type FieldDef,
  type FieldErrors,
  FIELDS,
  type FormSlug,
  type ImageValue,
  type MediaValue,
} from './fields';

/*
 * The editor's rules (ADMIN-DESIGN-SPEC §11). One module for the client and the server: the
 * editor validates with it before sending, and every route handler parses and validates the
 * same draft again, so the server repeats every client rule.
 */

export * from './fields';

export const isFormSlug = (slug: string): slug is FormSlug => Object.hasOwn(FIELDS, slug);

/** Whether a field is showing: fields tied to a toggle hide while it is on. */
export const isShown = (field: FieldDef, draft: Draft) => !(field.hideIf && draft[field.hideIf]);

const isImage = (v: unknown): v is ImageValue =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as ImageValue).src === 'string' &&
  [(v as ImageValue).width, (v as ImageValue).height].every((n) => Number.isInteger(n) && n > 0);

const isMedia = (v: unknown): v is MediaValue =>
  typeof v === 'object' &&
  v !== null &&
  ['image', 'video'].includes((v as MediaValue).kind) &&
  typeof (v as MediaValue).src === 'string';

function parseValue(field: FieldDef, value: unknown): DraftValue | undefined {
  switch (field.type) {
    case 'toggle':
      return typeof value === 'boolean' ? value : undefined;
    case 'tags':
      return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : undefined;
    case 'image':
      return value === null || isImage(value) ? value : undefined;
    case 'media':
      return Array.isArray(value) && value.every(isMedia)
        ? value.map(({ kind, src }) => ({ kind, src }))
        : undefined;
    case 'select':
      return field.options?.some((o) => o.value === value) ? (value as string) : undefined;
    default:
      return typeof value === 'string' ? value : undefined;
  }
}

/**
 * A draft from untrusted input: only this section's fields, each of its own type. Null when
 * the input has the wrong shape (the server answers 400).
 */
export function parseDraft(slug: FormSlug, input: unknown): Draft | null {
  if (typeof input !== 'object' || input === null) return null;
  const source = input as Record<string, unknown>;
  const draft: Draft = {};
  for (const field of FIELDS[slug]) {
    const value = parseValue(field, source[field.key]);
    if (value === undefined) return null;
    draft[field.key] = value;
  }
  return draft;
}

const URL_RE = /^https?:\/\/\S+\.\S+/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const YEAR_RE = /^\d{4}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** What validation needs beyond the draft: other articles' slugs (uniqueness). */
export interface ValidationContext {
  takenSlugs?: string[];
}

function fieldError(field: FieldDef, value: DraftValue): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (field.req && typeof value === 'string' && text === '') return `${field.label} is required.`;
  if (field.max && typeof value === 'string' && value.length > field.max) {
    return `Too long: ${value.length} of ${field.max} characters.`;
  }
  if (field.type === 'tags' && Array.isArray(value)) {
    const [min, max] = [field.minItems ?? 0, field.maxItems ?? Infinity];
    if (value.length < min || value.length > max) {
      return `Add ${min} to ${max} items: there ${value.length === 1 ? 'is' : 'are'} ${value.length}.`;
    }
  }
  if (field.type === 'media' && Array.isArray(value)) {
    const items = value as MediaValue[];
    if (items.length > (field.maxItems ?? Infinity)) return `${field.maxItems} items at most.`;
    if (new Set(items.map((m) => m.src)).size !== items.length) {
      return 'The same file is listed twice.';
    }
    return items.every((m) => URL_RE.test(m.src) || m.src.startsWith('/'))
      ? undefined
      : 'Upload the file again.';
  }
  if (!text && field.type !== 'image') return undefined;
  switch (field.type) {
    case 'url':
      return URL_RE.test(text) ? undefined : 'Enter a full address starting with https://';
    case 'email':
      return EMAIL_RE.test(text) ? undefined : 'Enter a valid email address.';
    case 'year':
      return YEAR_RE.test(text) ? undefined : 'Enter a four-digit year.'; // [ASSUMED] Q-A23
    case 'date':
      return DATE_RE.test(text) && !Number.isNaN(Date.parse(text)) ? undefined : 'Enter a date.';
    case 'minutes': // [ASSUMED] Q-A25
      return /^[1-9]\d*$/.test(text) ? undefined : 'Enter whole minutes, or leave it blank.';
    case 'image':
      return value === null || URL_RE.test((value as ImageValue).src)
        ? undefined
        : 'Upload the image again.';
    case 'pdf':
      // A full address, or a file the site itself serves (the shipped placeholder).
      return URL_RE.test(text) || text.startsWith('/') ? undefined : 'Upload the PDF again.';
    case 'range': {
      const [min, max, step] = [field.min ?? 0, field.max ?? 100, field.step ?? 1];
      const n = Number(text);
      const onStep =
        Number.isFinite(n) && Math.abs((n - min) / step - Math.round((n - min) / step)) < 1e-9;
      return onStep && n >= min && n <= max ? undefined : `Choose a value from ${min} to ${max}.`;
    }
  }
  return undefined;
}

/**
 * Fields whose rule also reads another field: editing the key can change the error on the
 * listed ones, so the editor rechecks them at once (§11, early validation).
 */
export const RECHECKS: Partial<Record<FormSlug, Record<string, string[]>>> = {
  hero: { headline: ['headlineHighlight'] },
  experience: { startYear: ['endYear'], current: ['endYear'] },
  writing: { body: ['externalUrl', 'status'], externalUrl: ['status'] },
};

/** Every rule from §11, keyed by field. Empty when the draft can be saved. */
export function validate(
  slug: FormSlug,
  draft: Draft,
  context: ValidationContext = {},
): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELDS[slug]) {
    if (!isShown(field, draft)) continue;
    const error = fieldError(field, draft[field.key]);
    if (error) errors[field.key] = error;
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
  if (slug === 'writing') {
    const slugText = String(draft.slug).trim();
    if (slugText && !errors.slug) {
      if (!SLUG_RE.test(slugText)) {
        errors.slug = 'Use lowercase letters, numbers and single hyphens.'; // [ASSUMED] Q-A25
      } else if (context.takenSlugs?.includes(slugText)) {
        errors.slug = 'Another article already uses this slug.';
      }
    }
    // §11: publishing needs something to show (a body, or an external URL, Q-A12).
    const [body, external] = [String(draft.body).trim(), String(draft.externalUrl).trim()];
    if (draft.status === 'published' && !body && !external) {
      errors.status = 'Add a body before publishing';
    }
    // One or the other, never both (owner, §14): the site could only show one.
    if (body && external && !errors.externalUrl) {
      errors.externalUrl = 'An article has a body or an External URL, not both. Clear one.';
    }
  }
  return errors;
}
