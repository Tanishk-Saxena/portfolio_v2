# Admin design spec

How the admin (`/admin`) looks and behaves, as shipped. **§14 (owner revisions) wins**, then
this file. The admin uses the site's tokens and rules (`docs/DESIGN-SPEC.md`); anything about
the site itself follows the site spec. `[ASSUMED]` decisions are in §13 by id (Q-A1–Q-A26);
code comments cite them. Never improvise admin UI beyond this file.

## 1. Origin

Built from the Claude Design admin mockup (removed 2026-10-18; in git history under
`docs/design/`). Where the mockup described the site (palette, sample copy, Settings
options), the shipped site won.

## 2. Tokens

The site's tokens, plus:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--field` | `#FBF8F2` | `#1F1C18` | Input wells, search, tag box, Markdown box, drop zone |
| `--line` | ink @14% | ink @13% | Hairlines: row rules, outline buttons, sidebar edge |
| `--line-input` | `rgba(35,32,28,.5)` | `rgba(237,231,219,.4)` | Form-control boundaries (3.16 / 3.31:1 on `--field`, WCAG 1.4.11) |
| `--paper-fade-strong` | paper at .88 | paper at .88 | Sticky bars (Q-A2) |

- The accent follows `settings.accent`, as on the site (`--accent-base` + `--accent-dark-mix`).
- Accent washes (state pill, live pill, tag chips) are the accent at 8%; the error summary 12%
  (A-1 in `docs/PERFORMANCE.md`).
- No grain. **Scrollbars visible**: thin, ink at ~20%, accent on hover.
- Confirm overlay `rgba(20,18,15,.42)` + `blur(3px)`; dialog shadow `0 24px 60px` .22; toast
  shadow `0 10px 30px` .18.

## 3. Typography

Plex Sans 15px base. Wordmark: the script face (Settings), 25px (sign-in 40px). Group headings
10.5px caps accent; nav rows 14.5px (current 500); sheet rows Newsreader 22px. List title
Newsreader `clamp(28px,3.4vw,36px)`; row title Newsreader 19px, 2-line clamp; row meta 13px
tabular. Editor title Newsreader `clamp(26px,3.2vw,34px)`. Field label 13px/500 (required `*`
in accent); **inputs 16px everywhere** (search 14px wide, 16px on phones, Q-A21); hints and
errors 12.5px (errors 500, accent). Confirm title Newsreader 23px.

## 4. Layout

One breakpoint at 760px on the admin's own `admin` container (Q-A3).

### 4.1 Wide (≥ 760px)

- **Sidebar** 244px, sticky full height, own scroll: wordmark + "Content admin" + theme toggle;
  nav groups; foot **View site ↗**, **Sign out**.
- **List page** `min(980px, 100%)`: title + count; **View on site ↗** (outline) and
  **+ New {singular}** (the one filled button); search (42px pill) and filter pills
  (`role="tablist"`); rows with a drag handle, ↑/↓, title, sub, meta, status pill, delete, chevron.
- **Editor bar** sticky 64px: back, crumb, title, state pill; `⌘S`/`Ctrl+S` hint,
  **Discard**, **Save**.
- **Editor body** max 1160: main column (max 720: title, error summary, fields) and a sticky
  side panel (max 360: its fields, then **View on site ↗**, **Duplicate**, **Delete**, "Last
  saved …" / "Not saved yet").

### 4.2 Narrow (< 760px)

- **One top bar on every page** (`PhoneBar`; owner, 2026-10-19): sticky, 60px, the page's
  side padding; at the left a round back (inside an entry only), the section's name and, in an
  editor, its state pill ("Unsaved"); at the right the theme toggle and a round **≡** opening
  a full-screen **sheet** (`role="dialog"`; groups, rows 56px; View site, Sign out). The
  wordmark lives in the sheet; the wide editor bar is not shown. A fixed **bottom bar**: a round Discard + a full-width Save (50px),
  above the safe area.
- Rows: meta under the title, no chevron. The side panel stacks under the fields. Toasts lift
  76px above the bottom bar.

### 4.3 Sign-in

A centred column `min(380px, 100%)`: wordmark + "CONTENT ADMIN", Email and Password (16px,
`autocomplete` username / current-password), the error line, **Sign in** (48px filled),
"← Back to the site".

## 5. Components

| Component | Spec |
|---|---|
| **Field** | One component per schema field: label (+ `*`) and an aside (`n / max`, tag count, `words · min`, range value), the control, a hint, an error (`role="alert"`) |
| Text / URL / email / date | 44px, radius 6, `--line-input` border, `--field` fill. Focus: accent border + 3px accent halo (Q-A4). `aria-invalid` in error |
| Textarea | the same well, `resize: vertical` |
| Markdown | a well with **Write / Preview** tabs and "Markdown supported"; min 420px tall (the `simple` variant 168px, "Simple Markdown"); Preview uses the site's renderer |
| Select | pills, `role="radiogroup"` / `radio`; active = ink fill |
| Toggle | `role="switch"`, 40×24 track (accent on), cream knob, `.2s`; text = the on/off label |
| Tags | chips (accent wash) with ×, an inline input: Enter, comma or blur adds; Backspace removes the last; duplicates ignored; chips drag to reorder |
| File | Empty: a dashed drop zone (§14 "Drop zone"): drop or paste, and **Open files** + accepted types. Filled: thumbnail or extension tile, name, **Replace**, ×. A pasted image uploads like a dropped one |
| Media list | a project's modal media: rows (drag handle, 48px thumbnail, name, kind, ×) above the drop zone (several at once; JPG, PNG, WebP, GIF, MP4, WebM, ≤ 10 MB each); `n / 6`; the zone goes at six |
| Links | Contact's list of label + URL rows (§14 "Contact links") |
| Range | native, `accent-color` |
| Theme toggle | the site's dial; its label names the mode it switches to |
| Toast | bottom-centre of the window (a long toast stays centred), **stacked** (newest lowest, three at most), an **accent pill with cream text** (`accent-fill` / `on-accent`, the primary button's pair, so it stands out in both modes; owner, 2026-10-19), Undo outlined in cream; optional **Undo**; `role="status"`; 3s (6s with Undo); a repeated plain message replaces the one showing |
| Confirm dialog | `role="alertdialog"`, `min(420px, 100%)`: title, body, optional "Changed" list, Cancel + the filled action (focused on open); Escape and the overlay cancel |
| Buttons | filled = `--accent-fill`, cream text; outline = `--line`, accent on hover; one filled button per screen |

Press feedback and the focus ring are the site's (Q-A4).

## 6. Structure and routes

| Group | Sections | Kind |
|---|---|---|
| Page | Hero, About, Contact | single record: opens its form |
| Content | Experience, Projects, Writing, Skills, Quotes | collection: list → editor; count beside the name |
| Site | Settings | single record |

```
/admin/sign-in
/admin                        → /admin/writing
/admin/{hero|about|contact|settings}
/admin/{experience|projects|writing|skills|quotes}
/admin/{collection}/new
/admin/{collection}/{id}
```
(Q-A5)

## 7. Behaviour

### 7.1 Lists

- Count line: "`n` {singular|plural} · shown on the site in this order" (Writing: "· newest
  first"). Search filters as you type ("Search {section}"); filters: Projects All / Published /
  Hidden, Writing All / Published / Draft. Writing sorts by date; the rest by position.
- **Reorder**: ↑/↓ and a drag handle on ordered collections, hidden while searching or
  filtering ("Clear the search and filter to reorder."). Arrows apply at once and send the
  order **700ms after the last move**; a drag sends it once, on the drop (nothing if dropped
  where it began). The handle is pointer-only; keyboards use the arrows. "Order saved" / on
  failure a rollback and "Could not save the new order."
- **Quick toggle**: the status pill is a button (Published ↔ Draft, Published ↔ Hidden, Shown ↔
  Skipped), optimistic, toast with **Undo**, sent **300ms after the last press** with the final
  state only (presses that cancel out send nothing). An article with nothing to show can't be
  published: "Add a body before publishing".
- **Delete** from a row: the editor's confirm, toast and Undo.
- **Skills**: at most 4 groups. At 4, New is disabled (45%, Q-A22) with "The skills grid holds
  4 columns. Delete one to add another."; no Duplicate; `/new` returns to the list; the server
  answers 409 on a fifth (create, duplicate, restore).
- Empty: "No {section} yet" / "Create the first {singular} to show this section on the site."
  — or "Nothing matches" / "Try a different search or filter."

### 7.2 Editor

- State pill: **New**, **Unsaved changes** ("Unsaved" on phones), **Saving…**, **Saved**.
- Dirty = a deep comparison with the stored record (a new entry with a blank one). **Save and
  Discard are disabled while clean**; Discard reverts (a new entry returns to the list).
- Leaving a dirty entry asks "Discard unsaved changes?" / "Your edits to this entry have not
  been saved and will be lost." / **Keep editing** · **Discard**, listing the changed fields.
  Closing the tab uses `beforeunload`.
- **Focus**: a new entry focuses its first field (fine pointers only); sign-in focuses Email;
  a dialog its filled button.
- **One request per action**: pills and arrows debounced (above); Save, Delete, Undo, uploads,
  sign-in and sign-out locked while in flight.
- **Validation**: a field shows its error as soon as it is edited, and so does a filled field
  whose rule depends on it (the highlighted word, the end year, External URL and Status);
  untouched fields stay quiet until Save. Save validates first: the fields show their messages,
  a summary says "One field needs attention before this can be saved." / "`n` fields need …",
  nothing is sent.
- Save label: **Create** (new), **Publish** (an article just set to Published), else **Save**;
  **Saving…** in flight.
- The article slug follows the title (≤ 64 chars) until edited by hand.
- **Duplicate** opens an unsaved copy: "(copy)", `-copy` slug, set to Draft / Hidden.
- **Delete** confirms "Delete this {singular}?" / "“{title}” will be removed from the site. You
  can undo straight after.", then "Deleted, removed from the site" with **Undo**.
- `⌘S` / `Ctrl+S` saves; Escape closes the dialog, then the sheet. A field tied to another
  hides rather than disabling (End year while Current role is on).
- **Settings** has **Reset to defaults** (the look only, not the title, description or GitHub
  username), disabled when already default.

### 7.3 Saving and the live site

- **"Saved" means live**: the toast appears once the database confirms the write; nothing
  reloads. Copy: "Saved, live on the site", "Live at /articles/{slug}", "Saved as draft, not on
  the site", "Saved, hidden from the site", "Saved, out of rotation".
- Failure: the draft stays, the pill returns to Unsaved, "Could not save. Your edits are still
  here; try again."; optimistic list changes roll back ("Could not reach the server. Nothing
  changed.").
- Deletes are soft; **Undo** (~6s) restores ("Restored" / "Could not undo.").
- **Concurrency**: every save sends the `updatedAt` it started from; a mismatch is a 409, "This
  entry changed on another device — reload", and the draft stays (Q-A6).

### 7.4 Theme

The dial sits in the sidebar header, the phone header, the editor bar and the sheet; stored per
device, separately from the site's (`admin-theme`, Q-A7).

## 8. Content model

Fields per section, mapped to the domain (`lib/domain/types.ts`; brief §5). Validation in §11.

### 8.1 Hero → `profile`

Eyebrow; Headline *; Highlighted word (must appear in the headline; empty → none); Intro
(`standfirst`); side: Name * (signature, footer, metadata, JSON-LD), Location (JSON-LD),
Résumé (PDF), Secondary button label (`ctaLabel`; empty hides the button, Q-A19) (Q-A8).

### 8.2 About → `profile`

Lead line *; Body (`aboutParagraphs[]`, split on blank lines); side: Portrait (alt "Portrait of
{name}", dimensions read at upload, Q-A9).

### 8.3 Contact → `profile` + `social_link`

Heading * (`contactStatement`); Email *; Links (§14 "Contact links"); Footer note (Q-A8).

### 8.4 Experience → `experience` (ordered)

Title *; Company *; Description (simple Markdown, §14); side: Start year *, Current role
(toggle: "Shows “now”" / "Has an end year"), End year (hidden when current; required otherwise).
Years are stored `YYYY-MM` (a changed year as January, Q-A23).

### 8.5 Projects → `project` (ordered)

Name *; Type (Open source / Side project / Client work); Description (≤ 320); Stack (tags, "Up
to four read best."); Live URL; Repository URL; Modal media (≤ 6, §14); side: Visibility
(Published / Hidden from the site), Year, Cover image (4:3, ≥ 1200px wide, decorative alt).

### 8.6 Writing → `article` (newest first)

Title *; Body (Markdown, word count and estimate); side: Status (draft / published), Slug *
(unique; "Lives at /articles/[slug]."), Publish date (blank = today), Read time (blank = the
estimate, `max(1, round(words / 220))`, Q-A11), Listen (toggle), External URL (**a body or an
External URL, never both**; publishing needs one, Q-A12). The excerpt is not edited (it falls
back to the first paragraph). A draft's URL is a 404.

### 8.7 Skills → `skill_group` (ordered, ≤ 4)

Column heading *; Items (tags, **4–6**: the box takes no seventh, "6 at most: remove one to add
another", `n / 6`).

### 8.8 Quotes → `quote` (ordered)

Quote * (≤ 140); Attribution *; side: In rotation (Shown / Skipped).

### 8.9 Settings → `settings`

| Field | Options (default first) | Effect |
|---|---|---|
| Site title * (≤ 70) · Site description (≤ 200) | the shipped ones | Root metadata and Open Graph; not reset by Reset to defaults |
| GitHub username (≤ 39) | empty | The heat map under Skills; empty hides it; letters, digits, single hyphens; not reset |
| Accent | Terracotta · Slate blue | `--accent-base`, `--accent-dark-mix` |
| Grain | 6% (0–7, step 0.5; capped for AA, DESIGN-SPEC §1.4) | `--grain-opacity` |
| Menu layout | Arc · Centre wheel | the wheel: R 150px, dock slides to the visible centre (measured on opening against `visualViewport`, DESIGN-SPEC §10; no slide under reduced motion, Q-A26) |
| Script face | Allura · Caveat | `data-script`: signature, hero word, admin wordmark |
| Project media | Stays until swiped · Moves on by itself | modal media rotation |
| Signature intro | On · Off | `data-intro-setting` |

The root layout sets these on `<html>`, so the site, admin and 404 all follow them; the Name
also suffixes every page title ("Article — Name"). Every combination keeps reduced motion, the
menu's focus handling, 44px targets and AA.

### 8.10 Every record

`id`, `created_at`, `updated_at`, `deleted_at`; `position` on ordered collections.

## 9. Data flow and API

- **The database is the only source of truth**; the site and the admin read the same records.
- Writes go through `/api/admin/*` route handlers: check the session → validate with the shared
  schema → write → `revalidatePath('/', 'layout')` → respond (Q-A14, Q-A15). Public pages stay
  prerendered and regenerate on the next visit; new slugs render on first visit.

| Method | Path | Use |
|---|---|---|
| PUT | `/api/admin/{hero,about,contact,settings}` | save a single record |
| POST | `/api/admin/{collection}` | create |
| PUT | `/api/admin/{collection}/:id` | save an edit (409 on a stale `updatedAt`) |
| PATCH | `/api/admin/{collection}/:id` | quick toggle |
| DELETE | `/api/admin/{collection}/:id` | soft delete |
| PATCH | `/api/admin/{collection}/order` | reorder `{ ids }` (409 if the ids no longer match) |
| POST | `/api/admin/restore` | undo a delete `{ collection, id }` (Q-A16, Q-A24) |
| POST | `/api/admin/upload` | a signed upload URL for one file (§10) |

## 10. Uploads

`POST /api/admin/upload { kind, type, bytes }` checks the admin and the limits, then returns a
signed upload URL for a new name (`media/images/…`, `media/files/…`, `media/media/…`) and its
public URL. The browser uploads straight to Storage (RLS: admin only); the record stores the
URL on save. Images send their natural width and height (CLS). Limits: images JPG, PNG, WebP ≤
5 MB; résumé PDF ≤ 10 MB; modal media also GIF, MP4, WebM, ≤ 10 MB (Q-A17). `next/image`
allows only this project's bucket. Removed files: §14 "Storage cleanup".

## 11. Validation (one module, client and server)

| Rule | Message |
|---|---|
| Required | "{Label} is required." |
| Max length | "Too long: `n` of `max` characters." |
| URL | "Enter a full address starting with https://" |
| Email | "Enter a valid email address." |
| Highlighted word | "“{word}” does not appear in the headline." |
| Duplicate slug · slug format | "Another article already uses this slug." · "Use lowercase letters, numbers and single hyphens." |
| End year | "Add an end year or mark this as the current role." · "Enter a four-digit year." · "The end year can’t be before the start year." |
| Read time | "Enter whole minutes, or leave it blank." |
| Skill items | "Add 4 to 6 items: there are `n`." |
| Skill groups | 409; "The skills grid holds 4 columns. Delete one to add another." |
| Modal media | "6 items at most." · "The same file is listed twice." · "Upload the file again." |
| Body and External URL | "An article has a body or an External URL, not both. Clear one." |
| Publishing with nothing to show | "Add a body before publishing" |
| Uploads | "Images must be JPG, PNG or WebP, up to 5 MB." · "The résumé must be a PDF, up to 10 MB." · "Could not upload. Try again." |
| Grain | "Choose a value from 0 to 7." |
| Article body: an image with no description · a link with no words | "Describe every image: ![what it shows](address)." · "Every link needs words: [what it is](address)." |

## 12. Auth and accessibility

**Auth:** one owner; Supabase Auth, email + password, sign-ups off, an allowlist (no roles; CI's
test admin exists only in its local Supabase). `proxy.ts` redirects `/admin/*` to sign-in and answers
401 on `/api/admin/*`; every handler re-checks; **RLS is the real boundary**. Wrong
credentials or a non-allowlisted account: "That email and password don't match."; Auth down:
"Could not sign in right now. Try again in a moment." (Q-A18, Q-A20). `/admin` is `noindex`.

**Accessibility:** 44px targets; `role="switch"` + `aria-checked`; `role="radiogroup"` pill
pickers; `aria-invalid` + a visible message; `aria-current` on the active section;
`role="status"` toasts; `role="alertdialog"` confirms; focus trapped in the dialog and sheet and
returned on close; arrow and pill names include the row title (Q-A24); 16px inputs. Reduced
motion: the dial, knob and toasts fade only. Control boundaries use `--line-input` (3:1+).

## 13. Assumed decisions

| # | Decision |
|---|---|
| Q-A1 | Sign-in required; deletes confirmed, then Undo; comfortable density |
| Q-A2 | `--paper-fade-strong` .88 for sticky bars |
| Q-A3 | Own `admin` container, same 760px switch |
| Q-A4 | The site's press feedback and focus ring; inputs keep border + halo |
| Q-A5 | Real routes; `/admin` → Writing |
| Q-A6 | On 409, keep the draft and offer a reload |
| Q-A7 | Admin theme stored apart from the site's |
| Q-A8 | Name and Location on Hero, Footer note on Contact |
| Q-A9 | Portrait alt "Portrait of {name}" |
| Q-A10 | Social links stay a table; the site hides a link with an empty URL (the admin no longer saves one, §14) |
| Q-A11 | Read time is a nullable override of the estimate |
| Q-A12 | Articles keep External URL; body or URL, never both; excerpt not edited |
| Q-A13 | Superseded (Settings, §8.9) |
| Q-A14 | Route handlers per §9 |
| Q-A15 | `revalidatePath('/', 'layout')` after each write; no reloads |
| Q-A16 | Restore by id, never by a client snapshot |
| Q-A17 | Upload limits per §10 |
| Q-A18 | One wrong-credentials message (reveals nothing about accounts) |
| Q-A19 | An empty secondary-button label hides the button |
| Q-A20 | Sign-in states and copy per §12 |
| Q-A21 | Search 16px on phones, 14px wide |
| Q-A22 | New group disabled at 45% when full |
| Q-A23 | Year copy and storage per §8.4, §11 |
| Q-A24 | A toggle's Undo toggles back; stale reorders refused; a pending reorder is sent on leaving (`keepalive`); control names include the row title |
| Q-A25 | Writing and upload copy per §11; the preview uses the site's renderer |
| Q-A26 | The wheel centres on the visible screen (`dvh`); grain range copy |

## 14. Owner revisions (final)

| Area | Revision |
|---|---|
| Settings | The style settings stay so the owner can demo and choose (§8.9); the site builds every variant. No tilt setting |
| Contrast | An unshipped value may be adjusted slightly to pass AA; a shipped one changes only with the owner (done: slate's 32% dark mix, `--line-input`, the 8% accent wash) |
| Saved = live | The toast confirms the database write; nothing reloads |
| Accent in images | Share cards and icons follow the saved accent from the next deploy |
| Experience description | The Markdown field's `simple` form (§5), previewed with the site's limited renderer; the article preview shows underline too |
| Contact links | One **Links** field: each link one card (grip, label \| URL, ↑ ↓, ×; on phones the label sits above the URL); drag or arrows reorder; × removes. New links come from a composer row under the list (label, URL, **Add link**; Enter adds), which takes only a complete link, so the list never holds an empty one (owner, 2026-10-18); up to eight, then the composer goes. Every link needs a label (≤ 40) and a full address. Saving replaces the stored list (new rows inserted, removed ones soft-deleted, order renumbered) |
| Simple Markdown tooltip | In the experience description's well, "Simple Markdown" is dotted-underlined, on every width; hovering, focusing or tapping it shows the set (paragraphs, lists, bold, italic, underline) and that headings, links and images stay as typed: the set is this site's own, not a convention (owner, 2026-10-18; a tooltip, not the hint, 2026-10-19). The field's hint is "Shown when the row is expanded." |
| Settings trimmed | **Navigation button** and **Press feedback** are gone (owner, 2026-10-18): the button is always bottom right, every press is the ripple. Migration `20261018000000_settings_drop_nav_position_press_feedback` drops the columns |
| Phone top bar | **One bar on every page** (owner, 2026-10-19): the same height (60px), padding and layout on lists, single records and entries: back (entries only), the section's name, the state pill (editors), then the theme toggle and a round **≡**. The Sections sheet's header uses the same row (`PHONE_BAR_ROW`), so the toggle and ≡ / × stay in place as it opens. It replaces the lists' wordmark header and the editors' wrapping 64px bar on phones (2026-10-18: ≡ had been at the left in editors; the lists had a labelled "Sections" pill) |
| Drop zone | The file and media fields' add zone: pressing it only focuses it, ready for a paste (Ctrl+V / ⌘V; a long press → Paste on phones, with no keyboard: an editable box with `inputMode="none"` that refuses typing); a drop lands anywhere on it; only the **Open files** button opens the picker (owner, 2026-10-18) |
| Storage cleanup | Saving Hero, About or a project removes from the `media` bucket every upload it **no longer points at**, only when **no record** points at it and only the app's own uploads (`folder/uuid.ext` in this project's bucket); it never fails the save. Everything else is a **daily database job**, `public.clean_media()` (pg_cron, 21:30 UTC): uploads a day old or more that no record points at (deleted projects' files, never-saved uploads). Needs two Vault secrets per project (`docs/SUPABASE.md`) |
| GitHub username | A Settings field under the description; empty hides the heat map; not reset |
| Signature intro | A Settings toggle after Script face, on by default; reset by Reset to defaults |
| Script face | Settings pills Allura · Caveat after Menu layout; the admin wordmark follows; reset by Reset to defaults |
| Phase 9 | Caps on the server (4 groups, 4–6 items); body or External URL; early validation; Save off when clean; stacked themed toasts; autofocus; Reset to defaults; no double requests; Delete from the list; the leave dialog lists changes; drag to reorder with arrows kept; paste images; modal media; the card line removed; site title and description |
