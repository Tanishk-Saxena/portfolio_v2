# Admin Design Spec — extracted from the admin mockup

The admin counterpart of `docs/DESIGN-SPEC.md`: exact values from the admin mockup, its
behaviour, and how it maps onto the site that already ships. Decisions the mockup did not
settle, or that the shipped site has since superseded, are tagged **`[ASSUMED]`** and
listed in [§13](#13-assumed-decisions). Build from this file.

**Precedence.** The same rules as the site (brief §0.1), in this order:

1. Owner revisions: `docs/DESIGN-SPEC.md` §10 for the site, and §14 below for the admin.
2. **What the site ships wins over anything site-related in the admin mockup.** The admin
   mockup was drawn against the original `Portfolio.dc.html`, so its palette, sample copy,
   site links and some Settings options are out of date (§1). The admin edits the site's content
   and a few settings; it never redesigns the site.
3. The admin mockup wins on everything that is the admin's own: layout, components,
   copy, behaviour.
4. This spec fills the gaps (`[ASSUMED]`).

Sources (abbreviated in citations):

| Tag | File |
|---|---|
| **[AD]** | `docs/design/artifacts/Admin.dc.html`: the admin, markup + logic |
| **[F]** | `docs/design/artifacts/Field.dc.html`: the shared form field |
| **[S]** | `docs/design/artifacts/admin-data.js`: `SCHEMAS`, `NAV`, `SEED` |
| **[AN]** | `docs/design/artifacts/ADMIN-Dev notes.dc.html`: behaviour spec |
| **[AH]** | `docs/design/ADMIN-HANDOFF.md`: data flow, endpoints, checklist |
| **[ADS]** | `docs/design/ADMIN-DESIGN.md`: rationale |
| **[MP]** | `docs/design/artifacts/Mobile preview.dc.html`: **Screen → Admin** at 390×844 |

As with the site, [AN] says its numbers are the mockup's values, not requirements: keep the
relationships and tune the constants.

---

## 1. What in the admin mockup is out of date

These parts of the mockup describe the site as it was first mocked, not as it ships. Use the
shipped value.

| In the admin mockup | Ship | Why |
|---|---|---|
| Palette `#B4532A` accent, `#7A7268` muted, dark accent `white 16%` | The site's tokens (`styles/tokens.css`): `--accent-base #A9491F`, `--muted #6D655C`, dark `--accent` = base + 24% white, `--accent-fill` for filled surfaces | DESIGN-SPEC §1.1a (AA). The admin reads the same tokens |
| `SEED` sample copy | The shipped fixtures (`lib/repositories/fixtures/data/`) seed the database | Fixtures are the current content; `SEED` is a copy of the old mockup |
| `view: 'Portfolio.dc.html#…'`, `Article.dc.html?id=…` | `/#hero`, `/#about`, … and `/articles/[slug]` | Real routes |
| Settings → Accent: Slate blue | Offered, with an AA-safe dark shade (§2, §8.9) | The mockup's derived dark slate fails AA (DESIGN-SPEC Q8); fixed by a per-accent mix (owner, §14) |
| Settings → Navigation button, Menu layout | Offered; the site builds bottom-centre and the centre wheel (§8.9) | Owner, §14: styles to demo and choose between |
| Settings → Signature intro | Not offered (§8.9) | Shelved (DESIGN-SPEC §10) |
| Settings → Signature tilt | Dropped | Owner, §14 |
| "Reset sample content" | Removed | Demo only ([AH]) |
| `sessionStorage` sign-in that accepts anything; `localStorage` data | Supabase Auth + the database | Demo only ([AH]) |
| Tweakables `requireSignIn`, `confirmDeletes`, `density` | `true`, `true`, `Comfortable` (Q-A1) | [ADS] §8: each collapses to one value |

---

## 2. Tokens

The admin uses the site's tokens unchanged, plus two admin-only tokens [AH]:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--field` | `#FBF8F2` | `#1F1C18` | Input wells, search, tag box, markdown box, drop zone |
| `--line` | `rgba(35,32,28,.14)` | `rgba(237,231,219,.13)` | Hairlines: row rules, outline buttons, sidebar edge, dividers |
| `--line-input` (owner, §14) | `rgba(35,32,28,.5)` | `rgba(237,231,219,.4)` | Boundaries of form controls: inputs, textareas, search, the tag box, the markdown box, the drop zone (dashed), the off-state toggle track. 3.16:1 on `--field` light, 3.31:1 dark (WCAG 1.4.11) |

- **Accent** follows the saved `settings.accent` [AD `palette()`], in the admin and on the
  site. Two accents, each a base plus the mix that derives its dark-mode text colour:

  | Accent | `--accent-base` (light text + fills, both modes) | Dark `--accent` | Checks |
  |---|---|---|---|
  | Terracotta (shipped) | `#A9491F` | base + **24%** white → `#C17558` | unchanged (DESIGN-SPEC §1.1a) |
  | Slate blue (new) | `#2F5D72` (the mockup's, unchanged) | base + **32%** white → `#708E9D` | 6.32 / 5.78 on paper / paper2; cream on base 6.78; dark 5.15 / 4.73 on dark paper / paper2 |

  So the mix becomes a token, `--accent-dark-mix` (24% / 32%), and dark `--accent` stays a
  formula: `color-mix(in oklab, var(--accent-base), white var(--accent-dark-mix))`. Terracotta
  renders exactly as shipped.
- **Paper fade** for the sticky bars: the mockup uses `.88` alpha (the site's is `.8`).
  **[ASSUMED]** add `--paper-fade-strong` at `.88` for the admin bars (Q-A2).
- **No grain** in the admin [ADS] §4.
- **Scrollbars: visible**, unlike the site (DESIGN-SPEC Q22). Thin, ink at 78–80% transparent,
  thumb turns accent at 30% transparent on hover, 10px track with a 3px transparent border
  [AD] lines 21–26.
- Fills that carry `#FDF8F0` text (primary buttons, the selection) use `--accent-fill`, as on
  the site. Accent-tinted washes (state pill, live status pill, tag chips, error summary) mix
  `--accent` with transparent: 92%, 92%, 92% and 88% respectively ([AD] had 86% for the first three; 92% passes AA, A-1, owner §14).
- Overlay behind the confirm dialog: `rgba(20,18,15,.42)` + `blur(3px)`. Dialog shadow
  `0 24px 60px rgba(0,0,0,.22)`. Toast shadow `0 10px 30px rgba(0,0,0,.18)` [AD].

## 3. Typography

| Role | Face | Size / line-height | Notes |
|---|---|---|---|
| UI base | IBM Plex Sans 400 | 15px | [AD] root |
| Name mark (sidebar, mobile header) | Caveat 600 | 25px / 1 | Sign-in: 40px |
| "Content admin" label | Plex 400 | 11px (sign-in 12px), `.16em`, caps, muted | |
| Nav group heading | Plex 500 | 10.5px, `.18em`, caps, **accent**, trailing 1px `--line` rule | Not clickable |
| Nav row | Plex 400 (current 500) | 14.5px | Count 12px muted, tabular |
| Sheet row (mobile) | Newsreader 400 | 22px | Count 13px Plex muted |
| List page title | Newsreader 400 | `clamp(28px,3.4vw,36px)` / 1.1 | |
| List count line | Plex | 13px muted | |
| Row title | Newsreader 400 | 19px / 1.3, 2-line clamp, `text-wrap: pretty` | |
| Row sub | Plex | 13px muted, one line, ellipsis | |
| Row meta | Plex | 13px (side) / 12.5px (inline, mobile), tabular | |
| Editor title | Newsreader 400 | `clamp(26px,3.2vw,34px)` / 1.15 | |
| Breadcrumb | Plex | 14px; current item 500 | |
| Field label | Plex 500 | 13px, `.01em` | Required mark `*` in accent |
| Input text | Plex | **16px** everywhere (no iOS zoom) | Search is 14px when wide, 16px on phones **[ASSUMED]** (Q-A21) |
| Hint / error | Plex | 12.5px / 1.5; error 500 in accent | |
| Markdown preview | Newsreader h3 24/1.25; quote 20/1.5 with 2px accent rule; Plex p 16/1.8 muted | | Approximates the article page |
| Confirm title | Newsreader 400 | 23px / 1.25 | Body 14.5/1.6 muted |
| Empty state | Newsreader 22px + Plex 14px muted | | |

Fonts come from the existing `next/font` setup (DESIGN-SPEC Q20). No new weights.

## 4. Layout

One breakpoint at **760px**, as on the site [AN]. The admin is not inside the site's `page`
container, so **[ASSUMED]** it gets its own `admin` container with the same `@wide:` switch
(Q-A3).

### 4.1 Wide (≥ 760px)

| Part | Values [AD] |
|---|---|
| Sidebar | 244px, `position: sticky; top: 0; height: 100vh`, scrolls on its own, right border `--line`, padding `26px 14px 18px`, gap 26px |
| Sidebar header | Name + "Content admin" on the left, theme toggle (40×40 circle, outline) on the right |
| Nav | Groups 20px apart; rows 38px, radius 6, `padding 0 10px`; current row `--paper2` fill, ink, 500; others muted; hover ink at 94% transparent |
| Sidebar foot | Top rule, then 40px rows: **View site ↗** (new tab), **Sign out** (muted) |
| List page | `width: min(980px,100%)`, padding `clamp(24px,5vh,48px) clamp(16px,4vw,48px) 96px`, gap 22 |
| List header | Title + count on the left; **View on site ↗** (44px outline pill) and **+ New {singular}** (44px filled pill, the one filled button) on the right; wraps |
| Search + filters | Search: 42px pill, `--field`, 15px icon at 13px; flex `1 1 240px`. Filters: a segmented pill group (`role="tablist"`), 3px padding, 32px pills, active = ink fill |
| Rows | Top border on the list, bottom border per row. Row button padding 18px (compact 10px) × 10px (8px with arrows), gap 20; meta + chevron on the right; hover ink 96%, press accent 88% |
| Reorder arrows | Column of two 32×28 buttons (compact 22 high), muted, turn accent on hover, first/last disabled at 30% opacity |
| Status pill | Min 36×44, 12.5px/500, radius 999. Live: accent text on accent 92% wash (A-1), no border. Off: muted text, `--line` border |
| Editor bar | Sticky, `min-height: 64px`, padding `10px clamp(16px,4vw,48px)`, `--paper-fade-strong` + `blur(10px)`, bottom rule. Left: back circle (44) + parent crumb + `/` + title + state pill. Right: shortcut hint (12px muted, `⌘S` / `Ctrl+S`), **Discard** (40px outline, 45% opacity when clean), **Save** (40px filled) |
| Editor body | Padding `clamp(24px,5vh,44px) clamp(16px,4vw,48px) 120px`, max-width 1160, gap `clamp(24px,4vw,48px)`, wraps |
| Main column | `flex: 1 1 440px`, max 720px, gap 26: title, error summary, fields |
| Side panel | `flex: 1 1 260px`, max 360px, `position: sticky; top: 88px`. Field box: `--paper2`, radius 8, padding 20, gap 20. Under it, 40px text actions: **View on site ↗**, **Duplicate**, **Delete {singular}** (accent, 500), then "Last saved 14 Sep, 16:05" (12px muted) or "Not saved yet" |

### 4.2 Narrow (< 760px)

| Part | Values [AD] |
|---|---|
| Header (lists only) | Sticky 60px, `padding 0 8px 0 16px`, paper fade + blur, bottom rule. Name on the left; theme toggle (44) and a **Sections** pill (44px, label = current section + ≡ icon) on the right |
| Sections sheet | Full screen, `role="dialog"`, paper. Sticky 60px top: "SECTIONS" label, theme toggle, close (44). Groups as on the sidebar, rows 56px Newsreader 22. Foot: **View site ↗**, **Sign out** (52px), padded for `env(safe-area-inset-bottom)` |
| Editor bar | Replaces the header. Single records: ≡ button (opens the sheet). Collections: back button + crumb. Theme toggle on the right. State pill reads "Unsaved" (not "Unsaved changes") |
| Bottom bar | Fixed, `padding 10px 16px calc(10px + env(safe-area-inset-bottom))`, fade + blur, top rule. A 50×50 round **Discard** icon (undo arrow, 40% opacity when clean) + **Save** filling the rest (50px, 15px/500) |
| Lists | Meta moves under the title; no chevron; status pill stays at the right; row gap 12. Arrows 40×30 |
| Side panel | Stacks under the main fields (the flex wrap does this) |
| Toast | Lifts 76px above the bottom bar while editing |

### 4.3 Sign-in

Centred column `min(380px,100%)`, gap 18, page padding 24: name mark (Caveat 40) + "CONTENT
ADMIN", Email and Password (46px inputs, 15px, `autocomplete` username / current-password),
error line, **Sign in** (48px filled pill), "← Back to the site" (13px muted, centred) [AD].

## 5. Components

| Component | Spec |
|---|---|
| **Field** [F] | One component for every input, driven by the schema. Header row: label (+ `*`) left, aside right (live count `n / max`, tag count, `words · min`, range value). Then the control, then hint, then error (`role="alert"`). |
| Text / URL / email / date | 44px, radius 6, `1px --line-input`, `--field`, padding 0 12px, 16px. Focus: border accent + `0 0 0 3px` accent at 82% transparent. `aria-invalid` when in error |
| Textarea | Same well, padding 11px 12px, 16/1.6, `resize: vertical`, `rows` from the schema |
| Markdown | Bordered well with a tab strip: **Write** / **Preview** (32px, active `--paper2` + 500) and a hint "Markdown supported" (owner, §14; the mockup's `## heading · > quote · blank line = paragraph` read as the whole syntax). Write: borderless textarea, min-height 420, 16/1.75. Preview: min-height 420, max 680px, `clamp(18px,3vw,32px)` padding; "Nothing to preview yet." when empty |
| Select → **pills** | `role="radiogroup"`, pills `role="radio"` 38px, padding 0 16px, 13.5px; active = ink fill, paper text |
| Toggle | `role="switch"` button, min 44px high: 40×24 track (accent when on, `--line-input` when off), 18px cream knob, `translateX(16px)`, `.2s cubic-bezier(.3,.8,.3,1)`; text = the schema's on/off label |
| Tags | Wrapping box, min 44px, padding 6: chips 30px (accent 92% wash, 13.5px) with a 24px remove ×; inline input (16px, min 120px). Enter, comma or blur adds; Backspace on empty removes the last; duplicates ignored. Chips **drag** to a new place by their text (owner, §14): the held chip lifts and follows the pointer, the others glide; saved with the form |
| File | Empty: drop zone, min 96px, dashed `--line-input`, "Drop, paste or **browse**" (the mockup: "Drop a file or browse") + accepted types (`JPG, PNG or WebP` / `PDF`). Filled: row with a 56px thumbnail (image) or extension tile (PDF), name (ellipsis), **Replace** (36px outline pill) and remove × (36px). **Paste** (owner, §14): an image on the clipboard goes up like a dropped file while the focus is inside the field |
| Media list (owner, §14) | A project's modal media: rows with a drag handle, a 48px thumbnail (image or video frame), the file name, its kind and a remove ×; under them the same drop zone (several files at once; "Drop, paste or **browse**", "JPG, PNG, WebP, GIF, MP4 or WebM, up to 10 MB each"). Rows drag to reorder. Aside `n / 6`; at six the zone goes |
| Range | Native, 32px high, `accent-color` |
| Readonly | 44px, ink 95% transparent fill, muted 14.5px |
| Theme toggle | The site's half-filled dial; turns 180° over `.45s cubic-bezier(.3,.8,.3,1)`; label names the mode it switches to ("Switch to dark mode") |
| Toast | Fixed, centred, bottom 24px; **stacked** (owner, §14): newest lowest, 8px apart, three at most. Each a pill in the theme's surface (`--paper2`) with ink text 14px and an accent-tinted border (the mockup's ink pill turned white in dark mode), min 46px, `padding 6px 8px 6px 18px`; optional **Undo** (32px outline pill, accent text); `role="status"` `aria-live="polite"`; in: opacity + rise 24px over .3s `cubic-bezier(.2,.8,.3,1)`. 3s, or 6s with Undo. The same plain message again replaces the one showing; toasts with Undo each stay |
| Confirm dialog | `role="alertdialog"`, `min(420px,100%)`, radius 10, padding 26, gap 12: title, body, an optional "Changed" list, buttons right-aligned (42px outline cancel, 42px filled OK). Overlay click and Escape cancel. Opens with the focus on the filled button (owner, §14) |
| Buttons | Filled: `--accent-fill`, `#FDF8F0`, 500, radius 999, hover opacity .9. Outline: `--line` border, hover border accent. One filled button per screen |

**[ASSUMED]** Press feedback uses the site's (Ripple by default; Settings can switch it, §8.9) (`components/site/ripple-host.tsx`, DESIGN-SPEC
§10) in place of the mockup's `:active` colour swap, so presses feel the same across the
product. Focus uses the site's ring (Q3) on everything except inputs, which keep the
mockup's border + halo (Q-A4).

## 6. Structure and navigation

`NAV` [S]:

| Group | Sections | Kind |
|---|---|---|
| **Page** | Hero, About, Contact | Single record: opens straight into its form |
| **Content** | Experience, Projects, Writing, Skills, Quotes | Collection: list → editor. Count shown beside the name |
| **Site** | Settings | Single record |

**[ASSUMED] Routes** (the mockup is one stateful screen; real URLs give Back, reload and deep
links) (Q-A5):

```
/admin/sign-in
/admin                       → redirects to /admin/writing (the mockup opens on Writing)
/admin/{hero|about|contact|settings}
/admin/{experience|projects|writing|skills|quotes}
/admin/{collection}/new
/admin/{collection}/{id}
```

## 7. Behaviour

From [AN], with the mockup's exact copy.

### 7.1 Lists

- Count line: "`n` {singular|plural} · shown on the site in this order" (ordered) or
  "· newest first" (Writing).
- Search filters on the row text as you type (placeholder "Search {section}"). Filters:
  Projects **All / Published / Hidden**; Writing **All / Published / Draft**.
- Writing sorts by date, newest first. Every other collection is in `position` order.
- **Reorder**: ↑/↓ per row on ordered collections. Hidden while a search or filter is active,
  with the note "Clear the search and filter to reorder." Moves apply at once; the order is
  sent **700ms after the last move** (one request for five taps); toast "Order saved"; on
  failure it rolls back with "Could not save the new order."
  **Drag** (owner, §14): a six-dot handle starts every row beside the arrows. Holding it
  (mouse or finger) lifts the row (surface fill, shadow) and it follows the pointer up and
  down; passing another row's middle trades places and the others glide over (180ms); on
  release it settles into its place. The drag goes on until the pointer is let go, whatever
  it passes over (it listens on the window, not the handle). **Nothing is sent while a row
  is held**: the order is
  saved once, on the drop, and a row dropped back where it began sends nothing. The handle is
  pointer-only (hidden from assistive tech): keyboards and screen readers use the arrows.
- **Quick toggle**: the status pill is a button. Articles Published ↔ Draft, projects
  Published ↔ Hidden, quotes Shown ↔ Skipped. Labels: "Publish" / "Unpublish", "Publish" /
  "Hide from site", "Put in rotation" / "Take out of rotation". Optimistic, toast with **Undo**.
  The request goes **300ms after the last press** on a pill (presses closer than that count
  as one) and carries only the final state;
  presses that cancel out send nothing (owner, §14).
- **Delete** (owner, §14): a bin button ends every row, in every collection. Same confirm,
  toast and Undo as the editor's Delete (§7.2).
  An article with nothing to show can't be published this way: toast "Add a body before
  publishing".
- **Skills** hold at most 4 groups. At 4, **New group** is disabled with "The skills grid holds
  4 columns. Delete one to add another."; the editor has no **Duplicate**, and
  `/admin/skills/new` returns to the list. The server refuses a fifth with 409 on create
  (Duplicate included) and on restore; the toast (Undo's too) says the same sentence (§14).
- Empty states: "No {section} yet" / "Create the first {singular} to show this section on the
  site." vs "Nothing matches" / "Try a different search or filter."

### 7.2 Editor

- State pill: **New**, **Unsaved changes** (phones: "Unsaved"), **Saving…**, **Saved**. New
  and dirty states take the accent wash.
- Dirty = a deep comparison of the draft with the stored record. **Discard** reverts; on a new
  entry it returns to the list.
- Leaving a dirty entry (another section or entry, Back, Sign out) asks **"Discard unsaved
  changes?"** / "Your edits to this entry have not been saved and will be lost." /
  **Keep editing** · **Discard**. Under the body, "Changed" lists the labels of the edited
  fields (owner, §14). Closing the tab uses the browser's prompt (`beforeunload`).
- **Save is disabled while there is nothing to save** (owner, §14), like Discard; `⌘S` then
  does nothing. A new entry is compared with a blank one, so a Duplicate's copy can be
  created at once.
- **Focus** (owner, §14): a new entry opens with its first field focused (fine pointers
  only, so a phone's keyboard doesn't open by itself); sign-in focuses Email; a dialog its
  filled button.
- **One request per action** (owner, §14). Debounced, final state only: status pills
  (300ms after the last press) and the reorder arrows (700ms). A drag sends its order once,
  on the drop. Locked while in flight: Save, Delete and its Undo (per entry),
  uploads, sign-in, sign-out. Search and filters send nothing; Duplicate only navigates.
- **Settings** has **Reset to defaults** in the side panel: it puts the shipped look
  (`DEFAULT_SETTINGS`) in the form, Save applies it; disabled when the form already holds it.
- **Early validation** (owner, §14): a field shows its error as soon as it is edited, in
  every section, and so does a filled field whose rule reads the one just edited (the
  highlighted word after the headline, the end year after the start year, the External URL
  and Status after the body). An untouched field stays quiet until Save. Saving or
  discarding clears them.
- Save validates first. Invalid fields show their message; a summary at the top says "One
  field needs attention before this can be saved." / "`n` fields need …"; the toast says "One
  field needs attention" / "`n` fields need attention". Nothing is sent.
- Save label: **Create** (new), **Publish** (an article just switched to Published), else
  **Save**; **Saving…** while in flight (the button is disabled).
- Article slug follows the title (slugified, ≤ 64 chars) until edited by hand, then stays.
- **Duplicate** opens an unsaved copy: "(copy)" on the name/title/role, `-copy` on the slug,
  set to Draft / Hidden. Guarded if dirty.
- **Delete** confirms: "Delete this {singular}?" / "“{title}” will be removed from the site.
  You can undo straight after." / **Cancel** · **Delete**. Then toast "Deleted, removed from
  the site" with **Undo**.
- `⌘S` / `Ctrl+S` saves from anywhere in the editor. Escape closes the confirm dialog, then
  the sheet.
- Fields tied to another value **hide** instead of disabling: End year while Current role
  is on.

### 7.3 Saving and the live site

- "Saved" means live: the toast appears once the database confirms the write (§9, owner §14).
  Copy: "Saved, live on the site", "Live at /articles/{slug}", "Saved as draft, not
  on the site", "Saved, hidden from the site", "Saved, out of rotation".
- Failure: the draft stays, the pill returns to Unsaved, toast "Could not save. Your edits are
  still here; try again." Optimistic list changes roll back ("Could not reach the server.
  Nothing changed.").
- Deletes are soft. **Undo** (about 6s) restores through `/restore` → "Restored" / "Could not
  undo.".
- **Concurrency** (in [AH], not in the mockup): every PUT sends the `updatedAt` it started
  from; a mismatch returns 409 and the toast says "This entry changed on another device —
  reload". **[ASSUMED]** The draft stays in the editor so nothing typed is lost (Q-A6).

### 7.4 Theme

The dial toggle sits in the sidebar header (wide), the mobile header, the editor bar and the
sheet. The choice is stored per device **separately from the site's** (Q-A7).

## 8. Content model

The admin's `SCHEMAS` [S] are the source for the database and server validation [AH], but
the site's domain types (`lib/domain/types.ts`) already exist and the site renders from
them. Reconciled field by field; **bold** = new to the domain.

### 8.1 Hero → `profile`

| Admin field | Domain | Rule |
|---|---|---|
| Eyebrow | `eyebrow` | |
| Headline * | `headline` | required |
| Highlighted word | `headlineHighlight` | must appear in the headline; empty → `null` |
| Intro | `standfirst` | |
| Résumé (side, PDF) | `resumeUrl` | upload §10 |
| Secondary button (side) | **`ctaLabel`** | seeded "Get in touch"; empty hides the button (Q-A19) |
| — | `name` | **[ASSUMED]** added to Hero's side panel as "Name" (required): it drives the signature, footer, metadata and JSON-LD (Q-A8) |
| — | `location` | **[ASSUMED]** added to Hero's side panel as "Location" (JSON-LD) (Q-A8) |

### 8.2 About → `profile`

| Admin | Domain | Rule |
|---|---|---|
| Lead line * | `aboutLead` | required |
| Body | `aboutParagraphs[]` | split on blank lines; joined back with a blank line for editing |
| Portrait (side, image) | `portrait: Image` | `alt` = "Portrait of {name}" **[ASSUMED]** (the mockup has no alt field, Q-A9); `width`/`height` read at upload |

### 8.3 Contact → `profile` + `social_links`

| Admin | Domain | Rule |
|---|---|---|
| Heading * | `contactStatement` | required |
| Email * | `email` | valid email |
| Links (a list of label + URL rows) | `social_links` rows, in the list's order | §14 "Contact links": add, remove, reorder (drag or arrows); a label on every row (40 characters at most); URL format; eight at most; **an empty URL → hidden on the site** |
| — | `footerNote` | **[ASSUMED]** added to Contact as "Footer note" (the footer sits under Contact) (Q-A8) |

`social_links` stays a table (the domain and site already read it). The mockup's four fixed
fields (GitHub, LinkedIn, Read.cv, X) became an editable list at the owner's call (§14); an
empty URL still means the site hides that link (Q-A10).

### 8.4 Experience → `experience` (ordered)

| Admin | Domain | Rule |
|---|---|---|
| Title * | `role` | required |
| Company * | `org` | required |
| Description | `summary` | simple Markdown (§14 "Experience description"): the Markdown well with Write / Preview, 168px tall, labelled "Simple Markdown"; no word count |
| Start year * (side) | `startDate` | 4-digit year, stored `YYYY-01` as the fixtures do |
| Current role (toggle, side) | `endDate === null` | "Shows “now”" / "Has an end year" |
| End year (side, hidden when current) | `endDate` | required unless current: "Add an end year or mark this as the current role." |

**Ordering changes**: the site currently sorts experience by current-first then start date
(repository contract). The admin makes it user-ordered ("shown on the site in this order"),
so experience sorts by `sortOrder` like the others. The seeded order is identical.

### 8.5 Projects → `project` (ordered)

The mockup's **Card line** (`summary`, max 110) is gone (owner, §14): nothing on the site
showed it but the modal, as a fallback. The migration copies it into an empty Description.

| Admin | Domain | Rule |
|---|---|---|
| Name * | `title` | required |
| Type | `kind` | pills: Open source / Side project / Client work ↔ `open-source` / `side-project` / `client-work` |
| Description | `description` | max **320** (the modal never scrolls) |
| Stack | `tags[]` | hint "Up to four read best." |
| Live URL / Repository URL | `liveUrl` / `repoUrl` | URL format; empty → `null` |
| Visibility (toggle, side) | **`published`** | "Published" / "Hidden from the site". Site shows only published |
| Year (side) | `year` | 4-digit year |
| Cover image (side) | `image` | 4:3, ≥ 1200px wide; `alt` stays `""` (the card image is decorative today) |
| Modal media | **`media[]`** `{ kind: image \| video, src }` | optional, up to **6**; shown in the modal in this order in place of the cover (owner, §14; DESIGN-SPEC §10). Hint: "Optional. Shown in the modal in this order, in place of the cover: images, GIFs or short videos. The card keeps the cover." |

### 8.6 Writing → `article` (by date, newest first)

| Admin | Domain | Rule |
|---|---|---|
| Title * | `title` | required |
| Body (Markdown) | `body` | Write / Preview; word count and estimate |
| Status (side) | **`status`** `draft \| published` | site shows only published |
| Slug * (side) | `slug` | required, unique, follows the title until edited; "Lives at /articles/[slug]." |
| Publish date (side) | `publishedAt` | ISO date |
| Read time (side) | `readMinutes` | blank = auto, `max(1, round(words / 220))`. **[ASSUMED]** stored as a nullable override; the repository returns the estimate when it's null (Q-A11) |
| Listen button (toggle, side) | **`listen`** | "Text-to-speech shown" / "Hidden". Per-article switch for the Listen button |
| — | `externalUrl` | **[ASSUMED]** added as an optional side field "External URL" (the site already links out for articles without a body). Publish needs a body **or** an external URL (Q-A12). **Never both** (owner, §14): rejected in the editor, on the server, and by the database check `article_body_or_external` |
| — | `excerpt` | not edited; the site falls back to the body's first paragraph (Q-A12) |

A draft's `/articles/[slug]` is a 404, like any unknown URL. Previewing drafts on the site is
out of scope [AH].

### 8.7 Skills → `skill_group` (ordered, max 4)

Column heading * → `title`; Items (tags) → `items[]`, "Shown in this order. Four to six per
column." At most 4 groups, enforced on the server too. Four to six items is a hard limit
(owner, §14), client and server: the tag box takes no seventh ("6 at most: remove one to add
another") and shows "`n` / 6".

### 8.8 Quotes → `quote` (ordered)

Quote * → `text`, max **140** (the box has a fixed height); Attribution * → `author`;
In rotation (toggle, side) → **`active`**, "Shown" / "Skipped". The site shows only active
quotes.

### 8.9 Settings → **`settings`** (new single record)

Style settings the owner uses to demo and choose between looks (owner, §14). Every option
must work on the site, so Phase 8.5 builds the variants the site lacks. Defaults = what ships
today, so the site looks unchanged until a setting moves.

| Admin field | Options (default first) | Site effect |
|---|---|---|
| Site title * (max 70) · Site description (max 200) | the shipped title and description | the root metadata: the home page's `<title>`, `description`, and the Open Graph title and description (owner, §14; Phase 9 item 24). Not part of **Reset to defaults**, which puts back the look only |
| GitHub username (max 39) | empty | whose contributions the heat map under Skills shows; empty hides it (owner, §14; DESIGN-SPEC §10 "Contributions"; Phase 9 item 29e). Letters, digits and single hyphens: "Enter the username only: letters, numbers and hyphens." Like the title and description, it is content: **Reset to defaults** leaves it alone |
| Accent | Terracotta · Slate blue | sets `--accent-base` and `--accent-dark-mix` (§2). Hint: "The dark-mode accent is derived from this." |
| Grain (0–24%, step 0.5) | 6% | sets `--grain-opacity` (today fixed at `.06`, Q5) |
| Navigation button | Bottom right · Bottom centre | FAB position; the arc spans `−177°…−93°` (right) or `−158°…−22°` (centre) (DESIGN-SPEC §5.3) |
| Menu layout | Arc · Centre wheel | Wheel: θ = `−90° + 360° × i / 6`, R = 150px at every width, the dock slides to the viewport centre (`.72s ease-spiral-out`) (DESIGN-SPEC §5.3) |
| Press feedback | Ripple · Ring · Press-in | sets `data-press` on `<html>`: what a press looks like on the site and in the admin (owner, §14; DESIGN-SPEC §10). Hint: "What a press looks like, on the site and here." |
| Project media (toggle) | Stays until swiped or clicked · Moves on by itself: 5 seconds an image, a video when it ends | whether a project's modal media rotates (owner, §14; DESIGN-SPEC §10) |
| Signature intro | not offered | shelved (DESIGN-SPEC §10); returns as a setting only if it is revived |
| Signature tilt | dropped | owner, §14 |

Every combination keeps the site's rules: reduced motion, focus handling in the menu (Q26),
44px targets, and AA in both modes.

As built (8.5): the root layout reads the settings and sets `data-accent`, `data-press`
and `--grain-opacity` on `<html>`, so the site, the admin and the 404 all follow them; the
accent is `--accent-base` + `--accent-dark-mix` per accent (`styles/tokens.css`). The home
page passes the nav button position and menu layout to the floating nav. A save marks the
site stale like any other (Q-A15). See Q-A26 for what the mockup left open.

As built (9.2): the root layout's `generateMetadata` reads the settings and the profile. The
profile's **Name** (Hero) is the author, the Open Graph site name, the suffix of every other
page's title ("Article — Name"), the share cards' alt text, and the admin's wordmark (sidebar,
phone header, sign-in). The share cards are route handlers (`/og`, `/articles/[slug]/og`)
named in the pages' metadata, because the `opengraph-image` file convention only takes a
constant alt text.

### 8.10 Every record

`id`, `created_at`, `updated_at`, `deleted_at` (soft delete); `position` on ordered
collections (the domain's `sortOrder`) [AH]. Public reads skip deleted rows and anything not
published / active.

## 9. Data flow and API

- **The database is the only source of truth.** The site and the admin read and write the
  same records [AH].
- **Writes** go through route handlers under `/api/admin/*`, as [AH] lists them **[ASSUMED]**
  (Q-A14), each one: check the session → validate with the shared schema → write → revalidate
  → respond.

| Method | Path | Use |
|---|---|---|
| PUT | `/api/admin/{hero,about,contact,settings}` | Save a single record (named as the admin's routes, §6) |
| POST | `/api/admin/{collection}` | Create |
| PUT | `/api/admin/{collection}/:id` | Save an edit (with `updatedAt`, 409 on mismatch) |
| PATCH | `/api/admin/{collection}/:id` | Quick toggle |
| DELETE | `/api/admin/{collection}/:id` | Soft delete |
| PATCH | `/api/admin/{collection}/order` | Reorder, `{ ids: [...] }` |
| POST | `/api/admin/restore` | Undo a delete (a toggle is undone by toggling back, Q-A24) |
| POST | `/api/admin/upload` | A signed upload URL for one file (§10) |

- **"Live" = the database confirmed the write** (owner, §14). The success toast appears when
  the write succeeds; nothing reloads, in the admin or on the site. The owner reloads the site
  when they want to look.
- **Cache marker** **[ASSUMED]** (Q-A15): the site's pages are prerendered, so without a
  marker a reload would keep showing the old page. After each successful write the route
  handler calls `revalidatePath('/', 'layout')`. This is one server-side call inside the
  same request. It rebuilds nothing on its own; Next 16 regenerates a page only when someone
  next opens it. It covers the home page, every article, slug changes, the sitemap and the share
  cards at once. Verify in Phase 6 that the metadata routes are covered.
- **Public pages stay static.** The home page and articles remain prerendered. New article
  slugs render on first visit (`dynamicParams`), and unpublished ones 404.
- **Restore** takes `{ collection, id }` for a delete (clears `deleted_at`), or
  `{ collection, id, patch }` to reverse a toggle **[ASSUMED]** (the mockup posts its whole
  local snapshot, which a server can't trust) (Q-A16).

## 10. Uploads

Portrait, project covers and the résumé go to Supabase Storage through a **signed upload
URL** requested from the server; the record stores the public URL [AH]. Images: the client
reads `naturalWidth` / `naturalHeight` before upload and sends them with the URL, so the
domain `Image` is complete (needed for CLS). Accept: images `JPG, PNG or WebP`; résumé `PDF`;
a project's modal media `JPG, PNG, WebP, GIF, MP4 or WebM`, 10 MB each (owner, §14; kind
`media`, folder `media/media/…`; the bucket's allowed types were widened to match).
**[ASSUMED]** Limits 5 MB image / 10 MB PDF (Q-A17). A file a save no longer points at is
removed from the bucket (§14 "Storage cleanup").

As built (8.4): `POST /api/admin/upload` `{ kind, type, bytes }` checks the admin and the
limits, then returns a signed upload URL for a new name (`media/images/…`, `media/files/…`)
and its public URL. The browser uploads straight to Storage (Storage RLS: admin only), and the
record stores the public URL when the form is saved. The site's `next/image` allows only that
bucket of the environment's own project (`next.config.ts`).

## 11. Validation (one module, client and server)

Rules from [S], [AD] `errors()` and [AH]. The same schema module runs in the editor and in
every route handler (the server repeats every client rule).

| Rule | Message |
|---|---|
| Required | "{Label} is required." |
| Max length (description 320, quote 140) | "Too long: `n` of `max` characters." |
| URL | "Enter a full address starting with https://" |
| Email | "Enter a valid email address." |
| Highlighted word not in the headline | "“{word}” does not appear in the headline." |
| Duplicate article slug | "Another article already uses this slug." |
| End year missing on a past role | "Add an end year or mark this as the current role." |
| More than 4 skill groups | server: 409 (`{ full: true }`) on create and restore; client: New group disabled, no Duplicate; toast "The skills grid holds 4 columns. Delete one to add another." |
| More than 6 modal media items · the same file twice · an address that isn't a file | "6 items at most." · "The same file is listed twice." · "Upload the file again." |
| Fewer than 4 or more than 6 items in a skill group | "Add 4 to 6 items: there are `n`." |
| An article with a body and an External URL | "An article has a body or an External URL, not both. Clear one." (on External URL) |
| Publishing an article with nothing to show | "Add a body before publishing" (quick toggle); on Save, the same rule on the Status field **[ASSUMED]** |

## 12. Auth and accessibility

**Auth.** One user. Supabase Auth, email + password, sign-ups disabled, the one account on an
allowlist. `proxy.ts` (Next 16's renamed middleware) does the fast redirect of `/admin/*` to
`/admin/sign-in` and returns 401 for `/api/admin/*`. Every route handler checks the session
again, and **RLS is the real boundary**. Sign-in error for a wrong email or password:
**[ASSUMED]** "That email and password don't match." (the mockup only shows "Enter your email
and password." for empty fields) (Q-A18). `/admin` is `noindex` and disallowed in robots
(already). Besides the owner, the dev project's allowlist holds one test admin for CI's
signed-in e2e tests (Phase 9.4; no roles: every allowlisted account is a full admin).

**Accessibility** [AH]: 44px minimum targets on phones (invisible extension where the visual is
smaller, as on the site), `role="switch"` + `aria-checked` on toggles, `role="radiogroup"` on
pill pickers, `aria-invalid` + visible message on invalid fields, `aria-current` on the active
section, `role="status"` on the toast, `role="alertdialog"` on confirms, 16px inputs. **Add**
what the mockup lacks: focus trapped in the confirm dialog and the sheet, and returned to the
trigger on close. Reduced motion: the dial, knob and toast don't move (fade only).

**Contrast fixes** (owner, §14): control boundaries use `--line-input` (§2), 3:1 or better
against `--field` in both modes (the mockup's 14% hairline gave 1.3:1). Slate blue gets its
own dark mix (§2). Hairlines that don't mark a control stay `--line`.

## 13. Assumed decisions

| # | Decision | Why |
|---|---|---|
| Q-A1 | Tweakables → sign-in required, deletes confirmed (then Undo), comfortable density | The mockup defaults; a confirm on the one irreversible-feeling action is the safer default for a live site |
| Q-A2 | `--paper-fade-strong` (.88) for admin sticky bars | The mockup's value; the site keeps `.8` |
| Q-A3 | Own `admin` container with the same 760px `@wide:` switch | The admin isn't inside the site's `page` container |
| Q-A4 | Site ripple and focus ring on admin buttons; inputs keep border + halo | One product; the site's press/focus rules are owner revisions |
| Q-A5 | Real routes per section and entry; `/admin` → Writing | Back, reload and deep links work; the mockup opens on Writing |
| Q-A6 | On 409, keep the draft and offer reload | [AH] copy, without losing typing |
| Q-A7 | Admin theme key separate from the site's (`admin-theme`) | [AN] "remembered per device, separately" |
| Q-A8 | Name + Location on Hero, Footer note on Contact | The domain needs them and the schema has no home for them; existing field types, no new UI |
| Q-A9 | Portrait alt = "Portrait of {name}" | The mockup has no alt field; a portrait's alt is predictable |
| Q-A10 | Socials stay a table; an empty URL = hidden. (Edited as four fixed fields until §14 "Contact links" made them a list) | Site unchanged |
| Q-A11 | Read time stored as a nullable override | "Blank uses the estimate" [AN] |
| Q-A12 | Articles keep `externalUrl` (new side field); publish needs body or URL; `excerpt` not edited | The site already supports link-out articles; the excerpt already falls back |
| Q-A13 | _Superseded by §14 (Settings)_ | |
| Q-A14 | Route handlers matching [AH]'s endpoint table | The mockup's single `api()` seam maps 1:1; testable with plain requests |
| Q-A15 | A server-side cache marker (`revalidatePath('/', 'layout')`) after each write; no reloads | Prerendered pages would otherwise stay stale on reload; the marker costs one call and rebuilds only on the next visit |
| Q-A16 | Restore by id (+ reverse patch), not by client snapshot | The server can't trust a client snapshot |
| Q-A17 | 5 MB image / 10 MB PDF. (Storage cleanup arrived with §14 "Storage cleanup") | Ample for a portrait, cover or CV |
| Q-A18 | Wrong-credentials copy | Not in the mockup |
| Q-A19 | An empty secondary-button label hides the hero's second button | Same rule as social links (Q-A10): empty = hidden, never an empty pill |
| Q-A20 | Sign-in: "Signing in…" on the button while the request runs; "Could not sign in right now. Try again in a moment." when Auth fails or is rate-limited; a valid account that isn't on the allowlist gets the wrong-credentials copy (Q-A18); inputs at 16px (§3) rather than §4.3's 15px; `/admin` was a plain landing until 8.1, which made it redirect to Writing (Q-A5) | Not in the mockup. One message for both refusals reveals nothing about which accounts exist; 16px stops iOS zooming |
| Q-A21 | List search at 16px on phones, 14px when wide | §3's 14px search would make iOS zoom the page on focus, which §3 rules out for every other input |
| Q-A22 | Skills at 4 groups: **New group** is a disabled button at 45% opacity, like the editor's clean **Discard** | The mockup disables New with no visual change; the faded state reuses its own convention |
| Q-A23 | Year fields: "Enter a four-digit year." and "The end year can’t be before the start year."; an unchanged year keeps its stored month, a changed one is stored as January | The database requires `YYYY-MM` with end ≥ start, and the mockup has no copy for either; the site shows years only |
| Q-A24 | List actions: a toggle's Undo sends the toggle back (`/restore` only clears deletes, refining Q-A16); a reorder whose ids no longer match the live list is refused (409, rolled back); a reorder still pending when the list is left (in the app or a reload) is sent at once, `keepalive`; the arrows' and pills' names include the row title, and a pill's name starts with its visible status (WCAG 2.5.3) | The mockup's 700ms debounce otherwise drops a move made just before leaving; screen readers need to know which row an arrow moves |
| Q-A25 | Writing and media copy the mockup lacks: slug format "Use lowercase letters, numbers and single hyphens."; read time "Enter whole minutes, or leave it blank."; uploads "Images must be JPG, PNG or WebP, up to 5 MB." / "The résumé must be a PDF, up to 10 MB." / "Could not upload. Try again."; External URL hint "Where the article lives if it has no body here, like Medium."; a blank publish date saves as today; the Markdown preview uses the site's own renderer (so it shows exactly what the article page will) | The database requires the slug format and positive minutes; the limits are Q-A17's; the renderer avoids a second Markdown dialect |
| Q-A26 | Settings details: the wheel's dock slides to the centre of the *visible* screen (`dvh`, the mockup used `vh`), and under reduced motion it moves there without sliding; the grain range's error "Choose a value from 0 to 24." (steps of 0.5) | `vh` puts the wheel low on phones while the address bar shows; reduced motion keeps the site usable but static |

**Designer's open questions [ADS] §9, answered for v1:** keep the delete confirm (Q-A1); drafts
preview only in the editor (out of scope [AH]); no revision history; arrows only, no
drag-to-reorder (revisited after real use: drag added beside the arrows, §14, §7.1).

## 14. Owner revisions (final — override the admin mockup)

Record admin changes the owner settles here, as DESIGN-SPEC §10 does for the site.

| Area | Revision (final) | Replaces |
|---|---|---|
| Settings | Keep the mockup's style settings so the owner can demo and choose: accent (Terracotta / Slate blue), grain, navigation button (Bottom right / Bottom centre), menu layout (Arc / Centre wheel). The site builds the variants it lacks. **Signature tilt dropped.** The intro stays shelved | Q-A13 (Terracotta + grain only) |
| Contrast | Where a design value misses a threshold and isn't shipped yet, tweak the shade slightly until it passes, in the admin and on the site. **Never change what's already shipped.** Applied so far: slate's dark mix 32% (§2), `--line-input` for control boundaries (§2); and, a shipped value changed with the owner's OK (2026-10-04), the accent wash at 8% (A-1, §2) | Keeping mocked values and flagging them |
| Saved = live | The toast confirms the database write; nothing reloads, in the admin or on the site. The owner reloads when they want to look | Toast after "saved and revalidated" |
| Accent in images | Share cards and app icons (favicon included) follow the saved accent from the next deploy on; picking it up sooner is fine but not required | Images always terracotta |
| Experience description (2026-10-04, item 30) | The Description is a **Markdown field** in its `simple` form: the article body's well (Write / Preview) at a 168px minimum height, its corner label "Simple Markdown", previewed with the site's limited renderer (paragraphs, lists, bold, italic, `<u>underline</u>`; DESIGN-SPEC §10). The hint names the syntax. The article body's own preview shows underline too. | §8.4 Description as a textarea |
| Contact links (2026-10-04, item 31) | Contact's four fixed URL fields are one **Links** field: rows of a label and a URL, so any service can be listed. **Add a link** appends an empty row (gone at eight, **[ASSUMED]** the cap); × removes; a row drags by its grip, and the arrows beside it move it for keyboards. On phones the label sits above the URL. Rules, client and server: every row needs a label (40 characters at most); a URL is a full address or empty (empty = hidden on the site). The first failing row is named in the field's error. Saving replaces the stored list with the form's: new rows are inserted under an id made in the browser, removed ones soft-deleted, the order renumbered. | §8.3's four fixed fields; Q-A10's "four fixed fields" |
| Storage cleanup (2026-10-04, item 32) | Saving Hero, About or a project removes from the `media` bucket every uploaded file the save **no longer points at**: a replaced or cleared portrait, résumé or cover, and modal media taken off the list. A file is removed only when **no record** points at it any more (a duplicated project shares its original's files), and only if it is one of the app's own uploads (`folder/uuid.ext` inside this project's bucket; the site's own files and other hosts are never touched). Cleanup runs after the save and never fails it (a storage error is logged). Needs the admin's select policy on storage objects (`20261009000000_admin_reads_media.sql`): without it a remove deletes nothing. **Everything else is the database's daily job** (owner, 2026-10-04: a deleted project keeps its files for ten minutes and no other action removes them; a scheduled job at the database level does the cleaning): `public.clean_media()`, run by pg_cron at 21:30 UTC, removes through the Storage API every upload in the bucket for a day or more that no record points at. That covers the files of projects deleted more than ten minutes before the run, files uploaded into a form that was never saved, and files orphaned before cleanup existed. It needs two Vault secrets per project (`docs/SUPABASE.md`) and does nothing without them (`20261011000000_media_cleanup_job.sql`). | §10 and Q-A17 "files stay in storage" |
| GitHub username (2026-10-04, item 29e) | Settings gains a **GitHub username** text field, under the site description: the account whose contribution heat map the site shows under Skills. Empty (the default) hides the map. Hint: "Shows your contributions as a heat map under Skills. Leave it empty to hide the map." Not touched by Reset to defaults. Stored in `settings.github_username` (`20261010000000_settings_github_username.sql`). | §8.9's field list |
| Phase 9 decisions (2026-10-04) | From the owner's admin test; built in Phase 9 (ledger: the **Phase 9 roadmap**, item numbers in brackets). **Caps enforced on the server**: four skill groups, 4–6 items per group (4, 5). **External URL or body, never both** (6; Q-A12 settled: the field stays). **Name/Location on Hero, Footer note on Contact stay** (27; Q-A8 settled). Early validation everywhere (7). Save disabled when clean (8). A plain "Markdown supported" hint (9). Stacked, themed toasts (10). Autofocus in dialogs (11). Reset to defaults on Settings (12). Debounce or in-flight lock on every action (13). Delete from the list (14). The leave dialog lists what changed (15). **Drag to reorder** lists and skill pills, arrows kept (22; settles §13's "revisit drag-to-reorder"). Paste images; project **modal media** as a list, rotating only if Settings says so (23). **Card line removed**, and any other field nothing on the site reads (21). Settings gain site title and description (24) and the signature-intro switch (29c). Experience **Description in Markdown** (30). **Contact links as an editable list** (31). Replaced uploads deleted from storage (32). One dev test admin for CI's signed-in tests, a blocking admin journey and axe (1, 2, 2b); no roles. | §8.3–§8.9 fields as listed; §13 "arrows only" |
