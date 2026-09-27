# Handoff — Admin portal (milestone 2)

The content admin for the portfolio. One signed-in user edits every piece of copy,
media and ordering on the public site. Nothing on the site is hard-coded after this
milestone.

## What is here

| File | What it is |
| --- | --- |
| `Admin.dc.html` | The admin, fully interactive, desktop and mobile |
| `Field.dc.html` | The shared form field used for every input in the admin |
| `admin-data.js` | Content model: `SCHEMAS` (fields, types, validation, list rows) and `SEED` (current site copy) |
| `ADMIN-Dev notes.dc.html` | Behaviour spec for the admin — read before writing code |
| `ADMIN-DESIGN.md` | Why the admin is designed the way it is |
| `Mobile preview.dc.html` | Switch **Screen → Admin** to see it in a 390×844 frame |

As with milestone 1, the mockups are a specification of behaviour and detail, not a
codebase to port. `admin-data.js` is the exception: treat `SCHEMAS` as the source for
the database schema and server-side validation.

## Data flow (the one rule)

The database is the only source of truth. The public site and the admin read and write
the same records. The mockup keeps a local copy only so it can be demoed without a
server; every write already goes through one `api(method, path, body)` method in the
logic class. Replace its body with the commented `fetch`.

A write is done when the server has saved it **and** revalidated the affected public
page, so the change is live when the admin says "Saved". Use on-demand revalidation
(`/` for sections, `/articles/[slug]` for articles, both on slug change) rather than
time-based caching. Show the success toast only after the response succeeds; on
failure keep the draft in the editor and show the error toast (already wired).

## Content model

Single records: `profile` (hero), `about`, `contact`, `settings`.
Collections: `experience`, `projects`, `articles`, `skills`, `quotes`.

Ordered collections (`experience`, `projects`, `skills`, `quotes`) need a `position`
column; the site renders them in that order. `articles` sort by `date` descending.
Every record gets `id`, `createdAt`, `updatedAt`, `deletedAt` (soft delete).

Public queries show only `projects.published = true`, `articles.status = 'Published'`
and `quotes.active = true`, and ignore soft-deleted rows.

## Endpoints the mockup calls

| Method | Path | Used for |
| --- | --- | --- |
| PUT | `/api/admin/{profile,about,contact,settings}` | Save a single record |
| POST | `/api/admin/{collection}` | Create |
| PUT | `/api/admin/{collection}/:id` | Save an edit |
| PATCH | `/api/admin/{collection}/:id` | Quick toggle from a list row |
| DELETE | `/api/admin/{collection}/:id` | Soft delete |
| PATCH | `/api/admin/{collection}/order` | Reorder, body `{ ids: [...] }` |
| POST | `/api/admin/restore` | Undo a delete or quick toggle |

Server validation must repeat every client rule: required fields, max lengths (card line
110, project description 320, quote 140), URL and email format, unique article slug,
highlighted word contained in the headline, end year unless the role is current,
maximum four skill groups, no publishing an article with an empty body.

## Layout targets

- **Desktop (≥ 760px):** fixed 244px sidebar (grouped sections, theme toggle beside the
  name, View site / Reset / Sign out at the foot), list pages up to 980px, editor as a
  main column (≤ 720px) plus a 260–360px side panel for status and metadata that sticks
  below the editor bar. Save and Discard live in the sticky editor bar.
- **Mobile (< 760px):** sticky 60px header with theme toggle and a Sections button that
  opens a full-screen sheet. The header is replaced by the editor bar while editing.
  Save fills a fixed bottom bar with a round Discard icon button beside it, padded
  for the safe area. The side panel stacks under the main fields. List rows put the date
  under the title and keep the status pill tappable on the right.

## Design tokens

Same as the site (see `HANDOFF.md`), plus two admin-only values:
`field` #FBF8F2 light / #1F1C18 dark for input wells, and `line` rgba(35,32,28,.14) light
/ rgba(237,231,219,.13) dark for hairlines. The admin accent follows the saved
`settings.accent`. No grain in the admin.

Type: IBM Plex Sans for UI, Newsreader for page titles, list-row titles and the article
preview, Caveat only for the name in the sidebar and sign-in.

## Implementation checklist

- [ ] Auth: one admin user, session cookie, every `/api/admin/*` route and the admin
      pages protected. The sign-in screen in the mockup accepts anything.
- [ ] Schema and migrations from `SCHEMAS`; seed from `SEED`.
- [ ] Replace `api()` with real requests; revalidate public pages on every write.
- [ ] Uploads (portrait, project covers, résumé) go straight to object storage via a
      signed URL; store the URL on the record. The mockup stores only the file name.
- [ ] Unsaved-changes guard on in-app navigation and on tab close.
- [ ] ⌘S / Ctrl+S saves; Escape closes the confirm dialog and the mobile sheet.
- [ ] Undo for delete, reorder and quick toggles, available for about six seconds.
- [ ] Optimistic list toggles and reorders, rolled back on failure.
- [ ] Concurrency: send `updatedAt` with every PUT; reject with 409 if the record changed
      elsewhere (two devices), and show "This entry changed on another device — reload".
      Not in the mockup.
- [ ] Remove "Reset sample content"; it is demo-only.

## Accessibility

44px minimum hit targets on mobile, `role="switch"` + `aria-checked` on toggles,
`role="radiogroup"` on option pickers, `aria-invalid` and a visible message on invalid
fields, `aria-current` on the active section, `role="status"` on the toast,
`role="alertdialog"` on confirms. Inputs are 16px on mobile so iOS does not zoom. Focus
trapping in the confirm dialog and the mobile sheet is not implemented in the mockup —
please add, returning focus to the trigger on close.

## Not in scope for this milestone

Revision history, scheduled publishing, multiple users or roles, analytics, and a
live preview of unsaved drafts on the site. The editor's Preview tab covers article
bodies only.
