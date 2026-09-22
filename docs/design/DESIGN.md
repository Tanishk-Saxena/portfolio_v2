# Tanishk Saxena — portfolio: design summary

A record of the brief, the directions considered, what was chosen and why, and how
the thing behaves. Written so another designer (or design agent) can audit the
decisions and propose alternatives without re-reading the code.

Files: `Portfolio.dc.html` (main page), `Article.dc.html` (article route),
`Mobile preview.dc.html` (390x844 frame + option controls), `Dev notes.dc.html`
(behaviour spec for engineering), `HANDOFF.md` (build instructions).

---

## 1. Brief

A personal portfolio for a software engineer in Delhi. Mobile-first, also needs to
hold up on desktop. The stated wants, in the client's words:

- A paper tone — cosy, warm, "wholesome".
- A loading animation of his signature that resolves into the navbar mark.
- A light/dark toggle that matches the page's aesthetic.
- Uncluttered, calm, breathing room; an invitation to stay.
- Single-page scroll; separate routes only for articles.
- A floating button that expands to reveal section navigation.
- Sections: Hero, About, Experience, Projects, Skills, Contact (+ Writing).
- Style carried by typography, not by a wide palette. One fixed palette for both modes.
- A résumé download, and nothing else bolted on.

## 2. Directions explored

Round one offered five restrained directions (Ledger, Blueprint, Broadsheet, Tape,
Specimen). These were rejected as too safe once the conversation turned to what
actually makes a developer portfolio memorable.

Round two narrowed to three and picked **Signal** — flat colour fields, poster-scale
display type, a tap-to-trace interaction. Two reference sites then pulled the work
quieter, and the direction became **Quiet plus one confident move**: warm paper, ink,
a single signal colour, hairline rows rather than cards.

Round three built that idea three ways, all sharing the same content and layout:

| Variant | Accent strategy |
| --- | --- |
| A — Woven | Accent threaded through small details: numerals, dates, bullets, email |
| B — Band | About and Contact become full-bleed accent grounds |
| C — Ruled | Accent hairlines everywhere, oversized accent numerals, marker-highlighted hero word |

**C was chosen**, then merged with B: the ruled hairlines, the highlighted hero word
and the accent nav button from C; the full-bleed About and Contact bands from B. The
oversized section numerals were dropped — section headings are now just the word, in
accent, one step up in size.

## 3. Visual system

**Type.** Newsreader (light/regular) for display and long-form; IBM Plex Sans for UI
and body; Caveat (600) for the signature and the one highlighted word in the hero, so
the handwriting appears exactly twice and always means the same thing.

**Palette.** One accent, two modes.

| Token | Light | Dark |
| --- | --- | --- |
| paper | #F5F0E7 | #191714 |
| paper2 (wells) | #EDE6DA | #221F1A |
| ink | #23201C | #EDE7DB |
| muted | #7A7268 | #938A7D |
| accent | #B4532A (terracotta) | derived: accent mixed with 16% white |

Slate blue (#2F5D72) is kept as the one alternative accent. The dark accent is
derived, never hand-picked, so swapping the accent keeps both modes consistent.

**Texture.** A fixed fractal-noise layer over the whole page, multiplying in light
mode and screening in dark, at 6% by default (0–24% adjustable). It is what makes the
flat colour read as paper rather than as a swatch.

**Rhythm.** Hairline rules between sections, generous vertical padding
(`clamp(72px, 11vh, 132px)`), a 1140px measure, and two accent bands (About, Contact)
as the only heavy colour. Everything else is paper and ink.

## 4. Structure

Hero → About (band) → Experience → Projects → Writing → Skills → Quotes → Contact
(band) → footer. One page, anchors only; articles are the single separate route.

- **Hero** — eyebrow, one sentence at poster scale with "web" marker-highlighted in
  the handwriting face, a short paragraph, résumé download, contact link, scroll cue.
- **About** — full-bleed accent band, portrait placeholder beside a lead line and two
  paragraphs.
- **Experience** — hairline rows; title, company and dates always visible, the
  description expands on click. No modal: a job has no artefacts to show, and reusing
  the project gesture would flatten the hierarchy.
- **Projects** — 4:3 cards in a centred wrap. At rest just the image; on hover the
  image blurs and lifts, a gradient rises, the name appears bottom-left and the
  live/source icons top-right. Clicking opens a fixed-size modal that scales out of
  the clicked card.
- **Writing** — hairline rows (title, read time, date) linking to the article route.
- **Skills** — four labelled columns, serif list items, no bars or percentages.
- **Quotes** — one rotating quote from the software industry in a fixed-height box;
  quotation mark and attribution in accent, quote in ink.
- **Contact** — accent band, a single sentence, the address at display size, social
  links.

Projects and Writing page in threes behind a "Show more" button.

## 5. Signature moments

1. **The intro.** The name writes itself letter by letter (fade and rise, ~55ms
   apart — deliberately not a clip mask, which sliced the script glyphs), the accent
   underline draws, then the whole mark flies to the navbar and hands off in a single
   frame. Plays on a real page load of either route; skipped when arriving from an
   internal link.
2. **The floating navigation.** A circular button showing the current section's icon.
   Tapping it blurs the page and fans six destinations onto a true arc centred on the
   button, each travelling out on a rotating arm so the motion spirals. A centre-wheel
   variant slides the button to the middle and lays the items in a full circle.
3. **The project modal.** Scales out of the card you clicked, fixed size, no internal
   scrolling, background frozen exactly where it was.

## 6. Tweakable options (not yet decided)

`accent` (terracotta / slate blue), `grain` (0–24%), `fabPosition` (bottom right /
bottom centre), `menuStyle` (arc / centre wheel), `signatureTilt` (−10° to +4°),
`introEnabled`. On the article page: `textToSpeech`, `id`, `accent`, `grain`.

These exist so the client can compare combinations before the build. Each should
collapse to one chosen value in production.

## 7. Open questions for review

- Is the handwriting used twice (signature, hero word) or should the hero word return
  to the serif italic?
- Bottom-right or bottom-centre for the floating button, and arc or centre wheel?
- Should Experience gain the card/modal treatment for consistency, at the cost of
  making the project modal less special?
- Does the quote section earn its place, or is it the one piece of decoration?
- Article text-to-speech: keep, or drop as unnecessary?
- Portrait, project screenshots, résumé and all real copy are still placeholders.
