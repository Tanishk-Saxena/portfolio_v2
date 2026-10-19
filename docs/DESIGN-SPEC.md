# Site design spec

How the public site looks and behaves, as shipped. **§10 (owner revisions) wins** over every
other section. Values live in code: `styles/tokens.css` (tokens, both modes, motion, reduced
motion) and `app/globals.css` (`@theme`, the Tailwind mapping); this file gives the rules and
the reasons. `[ASSUMED]` decisions are listed in §9 by id (Q1–Q32); code comments cite them.
The admin: `docs/ADMIN-DESIGN-SPEC.md`.

The design came from Claude Design mockups (removed 2026-10-18; in git history under
`docs/design/`). Where the mockup failed a hard rule (AA, focus, 390px first, reduced motion),
the shipped value differs and §9 says why.

---

## 1. Colour

### 1.1 Palette (per mode)

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F5F0E7` | `#191714` | Page ground, modal card, nav item fill |
| `surface` (`paper2`) | `#EDE6DA` | `#221F1A` | Wells: placeholders, portrait, row hover |
| `paper-fade` | `paper` at .8 | `paper` at .8 | Fixed header, behind `blur(10px)` |
| `ink` | `#23201C` | `#EDE7DB` | Headings, titles; FAB fill |
| `muted` | `#6D655C` | `#938A7D` | Secondary copy, meta, labels |
| `accent` | `--accent-base` | `color-mix(in oklab, var(--accent-base), white var(--accent-dark-mix))` | Headings, dates, rules, links |
| `accent-fill` | `--accent-base` | `--accent-base` | Every filled surface carrying `#FDF8F0` text: bands, primary button, hero word, active nav item, `::selection` |
| on-accent | `#FDF8F0` | `#FDF8F0` | Text and icons on fills |

### 1.1a Accents

Two, chosen in Settings (§10 "Style settings"): **Terracotta** `#A9491F` (default; dark mix
24% → `#C17558`) and **Slate blue** `#2F5D72` (dark mix 32% → `#708E9D`). The dark accent is
always a formula, never a hand-picked value. Rule: an unshipped shade may be adjusted slightly
to pass AA; a shipped value never changes without the owner (Q1, Q2).

### 1.2 Accent bands

About and Contact are full-bleed `accent-fill` bands that redefine tokens for their contents:
`--ink` and `--accent` → `#FDF8F0`, `--muted` → `#FDF8F0` at .89, `--paper2` → `#FDF8F0` at
.09. The focus ring therefore turns cream inside a band.

### 1.3 Derived colours

All relative to tokens (`X @ n%` = X mixed with transparent to n% strength):
`border-header` accent @38% · `border-section` accent @48% · `border-row` accent @32% ·
`border-control` accent @45% · `border-article` accent @40% · `border-listen` accent @42% ·
`border-card` ink @14% · `border-divider` ink @12% · `border-close` ink @18% ·
`border-quiet` ink @22% · `border-navdot` ink @28% · `press-row` accent @12% ·
`press-writing` accent @14%. Scrims: nav paper @55% + `blur(14px)`; modal (light
`rgba(232,224,210,.62)`, dark `rgba(18,16,14,.62)`) + `blur(16px)`.

- **Card veil** `linear-gradient(to top, rgba(12,10,8,.82) 0%, rgba(12,10,8,.62) 50%,
  rgba(12,10,8,.06) 100%)`; card kind text `#FDF8F0` at .9; card icons `#23201C` on
  `#FDF8F0` at .92 in both modes (Q15).
- **Focus ring** `2px solid var(--accent)`, offset 2px, on `:focus-visible`, following the
  element's radius; inset (−2px) on full-width rows (Q3).

### 1.4 Grain

A fixed full-viewport SVG noise layer (`feTurbulence fractalNoise .9`, 3 octaves, 190px
tile), `pointer-events: none`, `multiply` (light) / `screen` (dark). Opacity from Settings
(default 6%, `--grain-opacity`), **at most 7%** (`GRAIN_MAX`): the grain sits over the text,
and past ~8% muted copy drops under 4.5:1 in dark mode, which axe can't see. The admin refuses
more and the site clamps a stored value. Not in the admin (Q5).

### 1.5 Contrast (ship values, WCAG 2.x)

| Pair | Ratio |
|---|---|
| muted on paper / paper2 (light) | 5.05 / 4.62 |
| accent on paper / paper2 (light) | 5.06 / 4.63 |
| `#FDF8F0` on `accent-fill` (both modes) | 5.43 (slate 6.78) |
| band muted on `accent-fill` | 4.65 |
| dark accent on dark paper / paper2 | 5.07 / 4.65 (slate 5.15 / 4.73) |
| dark muted on dark paper | 5.26 |
| focus ring: on paper (L / D), cream on a band | 5.06 / 5.07 / 5.43 |
| card name over the veil at 50%, over white | 5.33 |

Rules and card borders are decorative (below 3:1 by design); outline buttons are identified by
their label, so nothing relies on a border alone.

---

## 2. Typography

### 2.1 Families

| Role | Family | Weights | Notes |
|---|---|---|---|
| `font-serif` | Newsreader, variable with `opsz` (optical sizing `auto`) | variable; 300 and 400 in use; italic 300 (articles only) | Display and long-form. `opsz` kept: it is the display type's look (Phase 10 measured dropping it: not worth it) |
| `font-sans` | IBM Plex Sans | 400, 500 | UI and body |
| `font-script` | **Allura 400** (default) or **Caveat 600**, from Settings (`data-script`) | — | The signature and the hero's highlighted word only; per-face size, leading and offsets in `tokens.css`. Only the default face is preloaded |
| `font-mono` | IBM Plex Mono 400 | — | Article `code` / `pre` only, loaded on that route (Q19) |

All via `next/font/google`: self-hosted, `latin` subset, `display: swap`, automatic
size-adjusted fallbacks (Q20, Q21). Body text is antialiased.

### 2.2 Type scale

Sizes are the tokens `--text-*` in `app/globals.css`; fluid sizes are `clamp()` in vw (Q25).
Key roles:

| Role | Face | Size | Line-height |
|---|---|---|---|
| Hero H1 (display) | serif 300, −.02em, max 16ch | `clamp(40px, 7.4vw, 92px)` | 1.05 |
| Hero word | script on an `accent-fill` block, radius 3px | per face (`--script-word-size`) | per face |
| Signature (navbar / intro) | script, −4° tilt | 31px / `clamp(54px, 12.5vw, 104px)` | .95 |
| Article H1 | serif 300, accent, max 20ch | `clamp(34px, 6vw, 58px)` | 1.1 |
| Contact statement | serif 300, max 18ch | `clamp(32px, 5.4vw, 64px)` | 1.1 |
| About lead | serif 300 | `clamp(23px, 3vw, 34px)` | 1.35 |
| Article lead | serif 300 | `clamp(20px, 2.6vw, 25px)` | 1.55 |
| Quote | serif 300, centred | `clamp(22px, 3.2vw, 34px)` | 1.45 |
| Section H2 | serif 400, accent | `clamp(21px, 2.5vw, 28px)` | 1 |
| Row titles (role, article) | serif 400 | `clamp(21px, 2.4vw, 27px)` / `clamp(20px, 2.3vw, 26px)` | 1.2 / 1.25 |
| Modal title / card name | serif 400 | 28px (narrow) 36px (wide) / 23px | 1.12 / 1.15 |
| Hero standfirst | sans 400, muted, max 52ch | `clamp(16px, 1.5vw, 18px)` | 1.75 |
| Body (about / article / experience) | sans 400, muted | 16 / 17 / 15px | 1.8 / 1.85 / 1.75 |
| Buttons | sans 500 primary, 400 outline | 15px (modal 14px) | — |
| Small / meta | sans 400 | 13–14px; years and dates tabular | — |
| Eyebrows and labels | sans, caps, .13–.18em | 9–12px | — |
| Mono | Plex Mono, `.88em`, `surface`, 3px radius; `pre` padded 16px, scrolls | — | 1.6 |

Inputs are never under 16px (no iOS zoom).

---

## 3. Spacing, radii, shadows, borders

### 3.1 Spacing

Tailwind's 4px base (`--spacing: 0.25rem`); every fixed value is a multiple of 0.25 steps.
Fluid values are named tokens (`--spacing-section`, `--spacing-grid-*`, `--spacing-more`,
`--spacing-float`, `--spacing-stage`, `--spacing-article-*`, `--spacing-portrait*`). No
literal in markup (Q24).

### 3.2 Radii

2px quote bar · 3px portrait, hero word, `code` · 6px rows · 10px project card · 14px modal ·
999px pills, tags · 50% circular controls.

### 3.3 Shadows (light / dark)

`card-hover` `0 20px 44px` (.2 / .5) · `modal` `0 40px 90px` (.28 / .6) · `fab` `0 12px 30px`
(.26 / .5) · `float` `0 8px 22px` (.16 / .42) · `float-top` the same (.16 / .4). Light shadows
are warm `rgb(40 32 22)`, dark ones black.

### 3.4 Borders

1px solid, coloured by the §1.3 tokens. Exceptions: the theme dial 1.5px; the article
pull-quote's 2px left rule; the signature underline is an SVG stroke (2.6 navbar).

### 3.5 Layers

grain 1 · header 50 · nav curtain 55 · floating dock 60 · intro overlay 70–71. The project
modal is a native `<dialog>` in the top layer (Q16).

---

## 4. Layout

### 4.1 Measures

`measure-page` `min(1140px, 100% − clamp(28px, 5.2vw, 44px))` (a 14px gutter at 390px);
`measure-article` the same at 760px. Header 76px.

### 4.2 Section rhythm

Sections sit in `measure-page` with a top `border-section` rule and `--spacing-section`
(`clamp(56px, 8vh, 96px)`) above and below, the bands included. The hero is `min-height:
100svh`, a centred column. Heading to content: 42px.

### 4.3 Breakpoint

One: **760px**, as a container query on the `page` container (`@wide:`), mobile first. The
modal stage and the dock use the same threshold. Fluid type stays in vw/vh (Q25).

### 4.4 Per section: phone vs wide

| Section | Phone (< 760px) | Wide |
|---|---|---|
| Header | Hides while reading down; returns on scroll up, a tap, focus inside, or near the top (§10) | Always visible |
| Hero | H1 from 40px; CTAs wrap | H1 up to 92px |
| About | Portrait 224px, centred, above the text | 360px portrait column beside the text, vertically centred |
| Experience | Role and company stacked; dates + caret one group on the first line | Role and company inline |
| Projects | One card per row; overlay always visible | Three per row; a partial last row centred; overlay on hover |
| Writing | Read time under the title; date at the right, level with the title's first line | Same |
| Skills | Label over its chips, groups 26px apart (§10 "Phase 9 picks") | Ruled rows: 180px label column beside the chips |
| Contributions | The map scrolls sideways, latest weeks first (§10 "Contributions") | The full year |
| Quotes | `max-width: 44ch`, fixed-height box | Same |
| Contact | Socials wrap | Statement up to 64px |
| Footer | Two spans, wrapping; tall enough to clear the floating controls | `space-between` |
| Project modal | 420 × 680, image on top, capped at 70svh | 880 × 460, image pane beside, capped at 60svh (§10 "Project modal") |
| Nav arc radius | 250px | 334px (wheel: 150px everywhere) |

The project-card overlay shows when the page is narrow, on `(hover: none)`, on hover, or on
`:focus-within` (Q15).

---

## 5. Motion

### 5.1 Easing

`ease-out-soft` `cubic-bezier(.2,.85,.25,1)` (most entrances and hovers) · `ease-flip`
`(.62,.02,.2,1)` (the signature's flight) · `ease-dial` `(.6,0,.2,1)` · `ease-expand`
`(.32,.72,.3,1)` (experience rows) · `ease-spiral-out` `(.16,.9,.24,1)` (the wheel's dock slide) ·
`ease-cue` `(.4,0,.3,1)` (scroll cue).

### 5.2 Keyframes

In `styles/tokens.css`: `fade-up` (opacity + 14px rise), `rise` (14px, no opacity: the H1),
`wheel` (scroll cue), `sign-ink` / `sign-line` (the signature), `quote-out` / `quote-in`,
`vt-out` / `vt-in` (page turns).

### 5.3 Interactions

**Reduced motion (Q12):** every transform becomes instant (`--motion: 0`); opacity and colour
keep their durations; loops and auto-advance stop; `scroll-behavior: auto`; the intro and the
signature writing are skipped. Only `transform`, `opacity` and colour animate, plus the
contained exceptions in Q11.

| Interaction | Motion |
|---|---|
| Theme change | colours `.45s ease`; the dial turns 180° `.5s ease-dial` |
| Signature | the intro when the home page loads at the top with the setting on; otherwise at rest (§10) |
| Hero entrance | eyebrow, H1, standfirst, CTAs `.8–.85s ease-out-soft`, delays `--enter` + .05 / .14 / .24 / .34s; the H1 only rises (never hidden, for LCP) (Q9) |
| Section entrances | each section fades up 14px the first time it scrolls in, 90ms stagger (§10) |
| Scroll cue | `wheel 1.9s` three times on phones (endless on wide), then fades; hidden on the first scroll past 40px |
| Primary button hover | lift 2px + opacity .92, `.25s` |
| Press feedback | the ripple on every control (§10) |
| Experience row | height `grid-template-rows 0fr → 1fr .5s ease-expand` + opacity `.38s`; caret 180° `.34s` (Q11) |
| Writing row hover | content `translateX(16px) .3s`; background to `surface` |
| Project card hover | lift 3px, shadow layer fades in, image scale 1.04 and blur 3px (hover devices only), veil and caption fade (Q11) |
| Project modal | grows from the clicked card (`translate + scale → none .46s ease-out-soft`, opacity `.3s`); backdrop fades `.34s`; close reverses |
| Show more / less | the sequence in §10 |
| Nav open | each item spirals out `.96s cubic-bezier(.55,0,.3,1)`, `.062s` apart, mirroring the close (§10) |
| Wheel layout | the dock slides to the screen's centre `.72s` |
| Back to top | fade + scale in `.35–.4s` (the FAB is always shown, §10) |
| Quotes | every 7s, the strip travels left (§10); paused while hidden, hovered or focused |
| Page ↔ article | the page turns as one sheet (§10) |

---

## 6. Components and accessibility

Every control: a visible focus ring (§1.3), a hover state (outline controls: border → accent;
filled: opacity .92), and press feedback (§10). 44×44 hit areas everywhere, extended invisibly
where the visual is smaller (Q4). Nothing can be disabled on the site.

| Component | Structure and a11y |
|---|---|
| Header | `<header>`, fixed 76px, `paper-fade` + `blur(10px)`, bottom `border-header`; signature left, theme toggle right; behaviour §10 "Header" |
| Signature (navbar) | Link, `aria-label` "{Name} — back to top" / "— back to portfolio" (Q23) |
| Theme toggle | 46×46, `aria-label` "Dark mode" + `aria-pressed`; choice stored per device, set before paint (Q6, Q7) |
| Experience row | `<button aria-expanded aria-controls>`; the closed body is `hidden` |
| Project card | `<article>` with a stretched `<button class="card-trigger" aria-haspopup="dialog">`; the Live / Source icon links are siblings, not nested; name clamped to 2 lines; no Live link when `live_url` is null (Q15, Q17) |
| Project modal | native `<dialog>` + `showModal()`: focus trap, Escape, inert page; `aria-labelledby` the title; focus starts on Live site (or Source); the name is not focusable (no close button, §10); focus returns to the card; backdrop click closes (Q16) |
| Writing row | `<a>` holding an `<h3>` |
| Quotes | `figure > blockquote + figcaption`; pauses on hover and focus; static under reduced motion (§10) |
| Floating nav | FAB `aria-label="Jump to section"`, `aria-expanded`, `aria-controls`; the menu is `inert` when closed; opening focuses the active item; Tab cycles inside; Escape, the curtain or a choice closes and returns focus; the active item has `aria-current`; the FAB is last in DOM order (Q26) |
| Back to top | a plain `#hero` link, shown once the hero is passed (Q14; the FAB itself is always shown, §10) |
| Listen (articles) | `aria-pressed`; hidden without `speechSynthesis`; per-article switch (Q18) |
| Article body | `<article>`; h1 → h2 → h3; the first paragraph is the lead; blocks 26px apart; pull-quote with a 2px accent left rule, serif italic 300. Whatever is typed stays accessible: `#` and `##` render as h2, deeper as h3 (the page title is the only h1); an empty link reads as its address; only http(s), mailto and site links are links; images need a description to be saved (ADMIN-DESIGN-SPEC §11) |
| Footer | `<footer>`: the footer note and "© {year} {Name}", `space-between`, wrapping, 13px muted |
| Contact | `mailto:` email; social links `min-height: 44px` |
| 404 | §10 |

Scrollbars are hidden on the site, as designed (Q22). Focus order follows the page: signature,
theme toggle, hero CTAs, rows, cards (trigger, live, source), Show more, email, socials, then
the dock.

---

## 7. Page structure

One page: **Hero → About (band) → Experience → Projects → Writing → Skills (+ Contributions) →
Quotes → Contact (band) → Footer**, anchors `#hero #about #experience #projects #writing
#skills #quotes #contact`. The nav menu lists About, Experience, Projects, Writing, Skills,
Contact. Articles live at `/articles/[slug]`. Projects and Writing page by three (Show more).
Dates: one ISO `published_at`, shown `MMM yyyy` in the list and `d MMMM yyyy` on the article,
`en-GB` (Q27). The content model is brief §5; missing optional media shows the designed
placeholder ("No preview to show") (Q28, Q32).

## 8. Tailwind mapping

Implemented: `app/globals.css` (`@theme`) maps every token to utilities; `@wide:` is the
`page` container query.

---

## 9. Assumed decisions

| # | Decision |
|---|---|
| Q1 | Light muted `#6D655C` and accent `#A9491F`: the smallest lightness-only shifts that pass AA |
| Q2 | Dark accent derived (24% white; slate 32%); `accent-fill` = the base accent in both modes; band muted .89, band paper2 .09 |
| Q3 | Focus: `2px solid accent`, offset 2px; inset on rows; the card's ring via `:has()` |
| Q4 | Visual sizes as designed; hit areas extended invisibly to 44×44; text links `min-height: 44px` |
| Q5 | Grain 6% by default, both routes; a Setting, capped at 7% for AA (2026-10-18) |
| Q6 | Theme toggle 46×46 on every route |
| Q7 | Colour mode: system preference, then the stored choice, set before paint |
| Q8 | Defaults: terracotta, bottom-right, arc (the other options are Settings, §10) |
| Q9 | Only the H1 (the LCP element) rises without fading, painted from the first frame |
| Q10 | The intro never blocks: no pointer capture, any input ends it, skipped under reduced motion |
| Q11 | Contained exceptions to transform/opacity: the experience row's height, the card image's blur on hover devices; everything else re-expressed as transform/opacity with the same look |
| Q12 | Reduced motion as in §5.3 |
| Q13 | Superseded by §10 "Quotes" |
| Q14 | Back-to-top appears once the hero is passed (the FAB, which it once arrived with, is now always shown: §10) |
| Q15 | The card structure and veil in §1.3 and §6 |
| Q16 | Native `<dialog>` for the modal |
| Q17 | Content model reconciled to the design (brief §5) |
| Q18 | `/articles/[slug]` with an on-site body, or a link out; Listen on, hidden without speech synthesis |
| Q19 | Plex Mono for article code, article route only |
| Q20 | Only the weights in use are loaded |
| Q21 | `next/font` size-adjusted fallbacks, `swap`, `latin` |
| Q22 | Scrollbars hidden on the site |
| Q23 | The signature's label starts with the visible name (WCAG 2.5.3) |
| Q24 | Spacing on the 4px base; fluid values as named tokens |
| Q25 | Fluid type in vw/vh; container queries switch layout |
| Q26 | The floating-nav focus model in §6 |
| Q27 | Date formats in §7 |
| Q28 | One ≥ 1600×1200 4:3 image per project, `object-fit: cover`, optional focal point |
| Q29 | Section jumps land per §10 "Header"; row deep links via `scrollIntoView` |
| Q30 | A script face for the signature and hero word (now a Setting, §10) |
| Q31 | Experience stays an accordion, not a modal |
| Q32 | The placeholder treatment is the designed empty state |

---

## 10. Owner revisions (final)

Settled by the owner after building and testing on real devices. They win over everything.

| Area | Revision |
|---|---|
| Signature intro | A Setting, on by default. When the home page loads at the top, a fresh visit **or a reload** (not a `#section` URL, back/forward, a visit from another page of the site such as an article, a page turn, or reduced motion; owner, 2026-10-18), the **navbar mark itself** is centred 46% down, enlarged to `clamp(54px, 12.5vw, 104px)`, **written by hand, stroke by stroke** (see "Signature writing") and underlined over a paper overlay (header glass, rule and theme toggle hidden). .9s after the writing ends (about 2.6s in) it flies home (`transform .95s ease-flip`) as the overlay fades (`.75s` from `.3s`); it lands exactly in place. Any key, click, wheel or touch ends it. The hero's animations (entrance, scroll cue) are **held until it ends**, so they start once the name is home, never behind the overlay (owner, 2026-10-18). Run by an inline `<head>` script (`lib/signature.ts`, `data-intro`). **Off, or skipped: no animation**, the name is at rest (owner, 2026-10-18; the write-in-place on every load is gone) |
| Page ↔ article | The page moves as one sheet: going in, the list lifts away (170ms) and the article rises 28px; coming back, the article settles out and home drops in from 16px above; never overlapping; the header stays fixed. Phones returning home skip the view transition (too slow to snapshot): the article slides out, home settles in at the restored position. Cross-fade under reduced motion. No title morph |
| Back and reload | **Back** returns to the exact previous scroll position before first paint; opened directly, it goes to `/#writing`; **More writing** always goes to `/#writing`. Expanded lists stay expanded for the session. On home the URL's `#section` follows the section being read (never `#hero`), and a reload opens at that section before first paint. Articles keep native restoration |
| Section entrances | Every section after the hero fades up (14px, 90ms stagger) the first time it scrolls into view; ones on screen at load stay static; none without JS or under reduced motion |
| Header | Phones: hides while reading down; back on scroll up, a tap, focus inside, or within 120px of the top; transform only. Jumps land sections flush at the top, 1px past their rule, header tucked away. Wide: always visible. On home the signature is a `#hero` link |
| Press feedback | Every `[data-ripple]` control, site and admin (buttons, icon buttons, tabs, rows; not inline text links): the **ripple**, a wash of the control's own text colour at 20% growing from the touch point (300ms). It starts on pointer-down and **nothing waits for it**. A press that becomes a scroll clears in 120ms. Reduced motion: the wash fades in place. Ring and Press-in were compared and dropped, with their setting (owner, 2026-10-18) |
| Show more / less | On the tap: the button glides down to its final place (FLIP, 650ms, ease-out cubic) as the section grows and the page scrolls just enough to keep it near the bottom; the new items fade up 14px one by one (from 520ms, 140ms apart); focus moves to the first new item. Fully expanded, it becomes **Show less**: the extras fade out last-first (240ms, 60ms apart), then the exact reverse; the heading or button stays in view; focus stays on the button. Opacity only under reduced motion |
| About and Contact | The section rhythm top and bottom, like every section. Portrait per §4.4 |
| Writing rows | Read time under the title; date at the right, level with the title's first line |
| Experience rows | Dates and caret one group, baseline-aligned with the role's first line |
| Back to top | A plain `#hero` link |
| 404 | Any unknown URL, a taken-down article included: the header, a `404 · Not found` eyebrow (the 404 larger, serif, accent), "This page has wandered off." in the article heading style, one line, and a filled **Back to writing** (`/#writing`) |
| Gradients | Light and shade in the same palette (owner, 2026-10-19: the flat fills read as generated). The hero word and the résumé button carry a 120° **sheen**: `--accent-light` (8% white; cream text 4.6:1 on terracotta, 5.6:1 on slate) → accent at 45% → `--accent-deep` (30% black); class `sheen`, the border clear so the sheen runs under it. Behind the hero, full bleed, an accent glow top right (16% light, 20% dark) and a fainter one bottom left. All mixed from `--accent-fill`, so both accents follow (`styles/tokens.css`). The About and Contact bands stay flat for now: a version that faded their edges into the paper read as dizzying (owner); still being explored |
| Style settings | Admin Settings (ADMIN-DESIGN-SPEC §8.9): accent (terracotta / slate blue), grain, menu (arc / centre wheel), script face, project media rotation, signature intro. Defaults are what shipped. The tilt is fixed at −4° (no setting) |
| Quotes | No dots or pause control; every 7s; pauses on hover and focus; static under reduced motion. The change **travels** left, one quote at a time, **never two on screen** (owner, 2026-10-18): the old quote moves 40px left and fades out (`quote-out .42s`, ease-in); once it is gone (+60ms) the next comes in from 40px right (`quote-in .6s`, ease-out, from `.48s`) |
| Nav close | The opening in reverse on gentler curves: last item out first, `.062s` apart, each `.96s cubic-bezier(.32,.5,.3,1)`, fading over its last `.34s`; the curtain lifts over the last `.5s`; in the wheel the dock's slide reverses too. **The opening mirrors it** (owner, 2026-10-18): each item eases out of the button so its spiral reads, `.96s cubic-bezier(.55,0,.3,1)`, `.062s` apart, fading in over its first `.34s` |
| Floating nav button | Always bottom right (the centre position, and its setting, are gone: it cut into content); shown from the first screen, the hero included, under the signature intro's overlay while that plays. On the hero no section is current: it shows a three-line menu glyph and no menu item is marked. While the menu is open the page can't scroll (the root's overflow is held, its scrollbar's room kept). The wheel centres on the **visible** screen: the dock's slide is measured when it opens (`wheelShift`), so it holds when the button is parked above the footer and on phones whatever the browser bars do (owner, 2026-10-19). Back to top still waits until the hero is passed (owner, 2026-10-18) |
| App icon | The handwritten initials **TS** in Caveat on the accent chip (favicon, `/favicon.ico`, Apple icon), in place of the lone T (owner, 2026-10-18) |
| Project modal | The year under the name; then the Live site / Source links; then the Description (none when empty); then the tags (owner, 2026-10-18: links above the copy). **No close button** (owner, 2026-10-18): the backdrop, Escape and the platform's dismiss gesture close it. **Focus** (owner, 2026-10-19): only Live site and Source take it, opening on the first (with neither, the dialog itself holds it, with no ring); the name is read first and is never a tab stop. The gallery's strip, arrows and dots stay keyboard-reachable. One fixed size: 880×460 wide, never taller than 60svh; 420×680 narrow, never taller than **70svh** (owner, 2026-10-18); copy that doesn't fit scrolls the body with a thin accent bar. No image: "No preview to show", on the card and in the modal |
| Modal media | Up to six images, GIFs or videos in the image pane (the card keeps the cover), in a scroll-snap strip with **no scrollbar**: swipe on phones; ‹ › when wide, shown on hover or focus (owner, 2026-10-19); ← → with focus; dots when more than one, each **pressable** to jump to its item (owner, 2026-10-18), with a solid 2px paper ring, the current one filled paper (owner, 2026-10-19). Videos muted and inline; only the one in view plays. Nothing moves unless Settings turns **Project media** on; then **nothing repeats**, each item gets one play: a still image 5s, a GIF one run of its frames from the first (its length read from the file, `lib/utils/gif-duration.ts`), a video to its end; a 4px **time-left bar** runs along the top of the media (paper on a dark track) and is the timer itself: a CSS run of the item's turn for an image or GIF, the playback for a video (owner, 2026-10-19). A mouse over the media (or keyboard focus inside) pauses the **rotation only**, never the GIF or video playing; it resumes where it stopped, and a video that ended meanwhile moves on once let go. **Phones don't pause** (a held finger is the long press; owner, 2026-10-19). Off: manual; videos and GIFs loop. Reduced motion: no rotation or autoplay; videos show controls. Each item is named from the project ("Ledger, video 2 of 3"), and videos stay muted even with controls (never audio without captions) |
| Experience descriptions | Simple Markdown: paragraphs, `- ` and numbered lists, bold, italic, and underline as a bare matched `<u>…</u>` (articles accept it too; every other raw tag is dropped). Nothing else is markup in a summary. Rendered on the server (`renderSimpleMarkdown`). Bold in ink 500; lists indent 20px; blocks 12px apart |
| Contributions | A GitHub heat map closes Skills (no section or nav entry): a caps "Contributions" label, the year's total at the right, then 53 week columns (Sunday first, 3px gaps, square 2px-radius cells, month names above). **In the accent, never GitHub's green**: empty ink 7%, levels accent at 26 / 50 / 74 / 100%. Phones: it scrolls sideways (11px columns), opening on the latest weeks (laid out right to left, no script). The whole map is one link to the profile, named by the total; cells hidden from assistive tech, with tooltips. Server-side GraphQL with `GITHUB_TOKEN`, refetched at most daily. No token, username or data: not rendered |
| Phase 9 picks | **Skills layout:** items are outlined chips (pill, `border-control`, 14px Plex); wide = ruled rows with a 180px label column, centred on the chips; phones = label 12px over its chips, groups 26px apart, no rules. **Hero word:** the accent block, unchanged. **Script face:** Allura (default) or Caveat, for the signature and hero word (`data-script`); share cards and the app icon keep Caveat. **Signature writing:** in the intro the name is written as a hand would write it (owner, 2026-10-19, replacing a left-to-right wipe): letter after letter, each stroke inked along its own path, nothing ahead of the pen visible. The server draws the name from the face's font file (`lib/signature-pen.ts`, home page only, when the intro is on); each letter's outline is traced by a pen twice its thickest stroke, clipped to the letter. 1.05s of ink shared by length from .2s, a 25ms lift between letters and 110ms between words (about 1.7s for the shipped name; owner, 2026-10-19: quicker than the first cut); then the underline draws (.5s); the text returns when the intro ends; off under reduced motion. (It also ran in place on every full load until 2026-10-18; the owner dropped that: see "Signature intro") |
