# Tanishk Saxena — content admin: design summary

A record of the brief, the decisions and the reasoning for the admin portal, written so
another designer can audit it without reading the code. The companion to `DESIGN.md`.

Files: `Admin.dc.html` (the admin), `Field.dc.html` (shared form field),
`admin-data.js` (content model), `ADMIN-Dev notes.dc.html` (behaviour spec),
`ADMIN-HANDOFF.md` (build instructions). `Mobile preview.dc.html` shows it at 390×844
under **Screen → Admin**.

---

## 1. Brief

- Edit everything the portfolio shows, with full create, read, update and delete.
- Functional first, but visually part of the same product as the site.
- Mobile-first: the common case is a quick change from a phone.
- Once a change is saved it must be live on the website.
- Don't reinvent the wheel; borrow proven CMS patterns.

## 2. References and what was taken

| From | Pattern |
| --- | --- |
| Ghost | Editor as a page with a settings side panel; status and slug beside the writing, not above it |
| Sanity / Strapi | Sidebar of content types split into single records and collections; forms generated from a schema |
| Notion / Linear | Undo toast instead of heavy confirmation where the action is reversible |
| iOS / Material | Fixed bottom action bar, full-screen navigation sheet, 44px targets |

Nothing was taken that needs a second user, roles, or workflows. There is one editor.

## 3. Structure

The sidebar groups sections by what they are, not by page order:

- **Page:** Hero, About, Contact. Single records that open straight into their form.
- **Content:** Experience, Projects, Writing, Skills, Quotes. Collections: list → editor.
- **Site:** Settings (accent, grain, nav button, menu style, intro, signature tilt).

Group headings are small accent capitals with a trailing hairline, so they read as
labels rather than as tappable rows. An earlier muted-grey version was too close to the
items.

The editor has a main column for content and a side panel for everything *about* the
content: status, dates, slug, visibility, media, and View / Duplicate / Delete. On mobile
the panel stacks below.

## 4. Visual system

It shares the site's tokens: paper, paper2, ink, muted and the accent, which follows the
saved Settings accent. Two admin-only tokens were added: `field` for input wells and
`line` for hairlines.

Type follows the site's split. Plex Sans carries the UI. Newsreader is used for page
titles, list-row titles and the article preview, so content looks like content. Caveat
appears only in the name mark. There is no grain, because the admin is a tool and
texture there would be noise.

Density is quieter than a typical CMS. Hairline rows replace cards and tables, with
pill buttons, one filled accent button per screen (Save or New), and everything else
outlined.

## 5. Key decisions

1. **One save model everywhere.** Edits are a draft until Save. The state pill (New,
   Unsaved changes, Saving…, Saved) is always visible. Autosave was rejected because a
   live site should not change while you are mid-sentence.
2. **"Saved" means live.** The toast appears only after the server confirms and the
   public page is revalidated. Its copy says where the change landed ("Live at
   /articles/…", "Saved as draft, not on the site").
3. **Quick toggles from the list.** A row's status pill publishes or hides the entry
   without opening it. This is the main mobile shortcut, and it has Undo.
4. **Reversible beats confirmed.** Reorder and toggles apply at once with Undo. Delete
   confirms and then offers Undo too. Only "discard unsaved changes" and "reset content"
   block.
5. **Pills over dropdowns** for option fields. Every choice is visible and needs one tap.
6. **The limits come from the site's layout.** The project description stops at 320
   characters because the modal never scrolls. Quotes stop at 140 because the box has a
   fixed height. Skills stop at four groups because the grid has four columns. The
   highlighted word must appear in the headline.
7. **One field component.** Every input is `Field.dc.html`, driven by the schema, so
   adding a field is a data change.

## 6. Mobile

Below 760px:

- The sidebar becomes a Sections button that opens a full-screen sheet with 56px rows.
- The theme toggle sits in the header, the editor bar and the sheet, so it is reachable on
  every screen.
- Save fills a fixed bottom bar with a round Discard icon beside it. A 1:2 text-button
  split was tried and looked lopsided; an underlined Discard link read as dated.
- List rows put the date under the title and clamp titles to two lines.
- Inputs are 16px so iOS does not zoom.

## 7. Theme toggle

This is the half-filled dial from the site, so the control means the same thing in both
places. It was moved from the sidebar footer to the sidebar header on desktop, and into
every top bar on mobile. It is labelled with the mode it switches to.

## 8. Tweakable options (not yet decided)

`requireSignIn` (show or skip the sign-in screen in the demo), `confirmDeletes`
(confirm dialog or Undo only), `density` (comfortable or compact rows). Each should
collapse to one value in production.

## 9. Open questions for review

- Is Undo alone enough for delete, dropping the confirm dialog?
- Should drafts be previewable on the real site (a signed preview URL) rather than only
  in the editor's Preview tab?
- Is revision history worth adding later, given there is one editor?
- Drag-to-reorder on desktop in addition to the arrows?
