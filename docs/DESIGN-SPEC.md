# Design Spec — extracted from the Claude Design mockup

**Phase 0 output.** Every value here is transcribed from the mockup source. Nothing is
rounded, tuned or invented. Anything the mockup did not settle, or that broke a hard
constraint (WCAG 2.1 AA, visible focus, mobile-first 390px, container queries, a
reduced-motion fallback for every motion), has been resolved and tagged **`[ASSUMED]`**
inline. Every assumption is also listed in [§9 Assumed Decisions](#9-assumed-decisions).
Where an assumption overrides a mockup value, the mockup value stays in place so the two
can be compared. **Build from the `[ASSUMED]` value.**

> **Revision 2:** the owner's direction (brief §0.1) is that the mockup wins every
> contradiction and perf rules apply by intent. §9 rows marked **R2** (Q4, Q9, Q11, Q18,
> Q22) override the inline text for those items.

Sources (abbreviated in citations):

| Tag | File |
|---|---|
| **[P]** | `docs/design/artifacts/Portfolio.dc.html` — main page; markup + `renderVals()` logic |
| **[A]** | `docs/design/artifacts/Article.dc.html` — article route |
| **[DN]** | `docs/design/artifacts/Dev notes.dc.html` — behaviour spec |
| **[MP]** | `docs/design/artifacts/Mobile preview.dc.html` — 390×844 frame + option controls |
| **[H]** | `docs/design/HANDOFF.md` |
| **[D]** | `docs/design/DESIGN.md` |

Notes on reading the source:
- `style-hover="…"` / `style-active="…"` attributes are compiled by `support.js` into
  `:hover` / `:active` pseudo-class rules. There are **no** `:focus` / `:focus-visible`
  rules anywhere in the mockup, and no disabled states.
- Many inline `var(--accent,#2F5D72)` fallbacks name slate blue. They never apply,
  because `--accent` is always set on the root by `theme`. Fallbacks are not tokens.
- `Dev notes.dc.html` and `Mobile preview.dc.html` use their own chrome colours
  (`#4A443C`, `#DED5C6`, `#26231F`, `#E8DFD2`, `#9A9188`, `#C0662F`, …). Those are
  documentation-page colours, not product tokens, and are excluded.
- [DN] line 28: *"Numbers given here are the values used in the mockup, not requirements —
  keep the relationships, tune the constants."* This spec records the numbers as-is.
  Tuning is a later decision.

---

## 1. Color tokens

Source: [P] `palette()` lines 510–515, `theme` 609–613, band overrides lines 81 / 201;
[A] `palette()` 139–144; [H] "Design tokens"; [D] §3.

### 1.1 Core palette (per mode)

| Semantic token | Mockup name | Light | Dark | Usage |
|---|---|---|---|---|
| `bg` | `--paper` | `#F5F0E7` | `#191714` | Page ground, modal card, nav item resting fill, back-to-top fill |
| `surface` | `--paper2` | `#EDE6DA` | `#221F1A` | Wells: project image placeholder, portrait, writing-row hover |
| `bg-translucent` | `--paperFade` | `rgba(245,240,231,.8)` | `rgba(25,23,20,.8)` | Fixed header behind `backdrop-filter: blur(10px)` |
| `text-primary` | `--ink` | `#23201C` | `#EDE7DB` | Body headings, row titles; FAB fill |
| `text-muted` | `--muted` | `#7A7268` | `#938A7D` | Secondary copy, meta, labels |
| `accent` | `--accent` | `#B4532A` | `color-mix(in oklab, #B4532A, white 16%)` | Section headings, dates, bands, primary button, rules |
| `on-accent` | literal | `#FDF8F0` | `#FDF8F0` | Text/icons on accent fills; `::selection` text |

- **Dark accent is a formula, not a value.** It is always derived from the light accent:
  `color-mix(in oklab, <accent>, white 16%)` ([P] 513, [DN] "Theming", [D] §3).
  The formula resolves to `#C26F4E` for terracotta and `#507587` for slate. These
  resolved hexes are **computed here for the contrast checks only**. Ship the formula.
- **Alternative accent:** slate blue `#2F5D72` ([P] data-props `accent.options`; [D] §3).
  **[ASSUMED] Terracotta.** It is the mockup default in every file, and slate's derived dark
  accent fails AA (Q8).

### 1.1a Shipping palette `[ASSUMED]` (Q1, Q2)

The mockup palette fails AA in several places (§1.5). These are the smallest changes
that pass. Each was found by lowering only OKLab lightness (hue and chroma kept), with
≥4.6:1 targeted for margin:

| Token | Mockup | **Ship** | Why |
|---|---|---|---|
| `text-muted` (light) | `#7A7268` | **`#6D655C`** [ASSUMED] | 5.05:1 on paper, 4.62:1 on paper2 (was 4.17 / 3.82) |
| `accent-base` (light text **and** fill) | `#B4532A` | **`#A9491F`** [ASSUMED] | 5.06:1 on paper, 4.63:1 on paper2; `#FDF8F0` on it 5.43:1 |
| `accent` (dark, **text/lines only**) | `color-mix(in oklab, accent, white 16%)` | **`color-mix(in oklab, var(--accent-base), white 24%)`** → `#C17558` [ASSUMED] | Still derived, as [DN] requires; 5.07:1 on dark paper, 4.65:1 on dark paper2 |
| `accent-fill` (new; both modes) | bands and fills used `--accent` | **`var(--accent-base)`** in light **and** dark [ASSUMED] | Filled surfaces carrying `#FDF8F0` text (About/Contact bands, primary button, hero highlight, active nav item, pressed states, `::selection`) keep the base accent in dark mode, so their text stays at 5.43:1 (the derived colour would give 3.49) |
| band `--muted` | `rgba(253,248,240,.88)` | **`rgba(253,248,240,.89)`** [ASSUMED] | 4.65:1 on `accent-fill` |
| band `--paper2` | `rgba(253,248,240,.13)` | **`rgba(253,248,240,.09)`** [ASSUMED] | Portrait-placeholder label (switched to band `--ink`) reaches 4.59:1 |
| dark `text-muted`, `ink`, `paper`, `paper2`; light `ink`, `paper`, `paper2`, `#FDF8F0` | — | unchanged | Already pass |

### 1.2 Accent-band scope overrides

The About and Contact sections paint `background: var(--accent)` and redefine these
tokens for their contents ([P] lines 81, 201):

| Token (inside band) | Value |
|---|---|
| `--ink` | `#FDF8F0` |
| `--muted` | `rgba(253,248,240,.88)` |
| `--paper2` | `rgba(253,248,240,.13)` |
| `--accent` | `#FDF8F0` |
| `color` | `#FDF8F0` |

In dark mode the bands take the *derived* accent as their background.

### 1.3 Derived / alpha colours

All are expressed relative to tokens. "`X` @ n%" below means
`color-mix(in oklab, X, transparent (100−n)%)`, written the way the source writes it.

| Semantic token | Source expression | Where |
|---|---|---|
| `border-header` | accent, `transparent 62%` | Header bottom border; portrait border; project tag border |
| `border-section` | accent, `transparent 52%` | Top rule between sections |
| `border-row` | accent, `transparent 68%` | Experience / writing row separators |
| `border-control` | accent, `transparent 55%` | Outline pill buttons, theme toggle, email underline, "Show more" |
| `border-article` | accent, `transparent 60%` | Article meta and footer rules [A] |
| `border-listen` | accent, `transparent 58%` | Listen button (idle) [A] |
| `border-card` | ink, `transparent 86%` | Project card, modal card, nav label (inactive) |
| `border-divider` | ink, `transparent 88%` | Modal image/text divider |
| `border-close` | ink, `transparent 82%` | Modal close button |
| `border-quiet` | ink, `transparent 78%` | Modal "Source" button, back-to-top |
| `border-navdot` | ink, `transparent 72%` | Nav item (inactive); quote dot inactive fill |
| `press-row` | accent, `transparent 88%` | Experience row `:active` background |
| `press-writing` | accent, `transparent 86%` | Writing row `:active` background |
| `veil` | `linear-gradient(to top, rgba(12,10,8,.78) 0%, rgba(12,10,8,.34) 44%, rgba(12,10,8,.06) 100%)` | Project card overlay |
| `card-icon-bg` | `rgba(253,248,240,.92)` + text `#23201C` (fixed, both modes) | Card live/source icon buttons |
| `card-kind` | `rgba(253,248,240,.78)` | Card "kind — year" caption |
| `scrim-nav` | light `rgba(245,240,231,.55)` / dark `rgba(25,23,20,.55)` + `blur(14px)` | Nav curtain |
| `scrim-modal` | light `rgba(232,224,210,.62)` / dark `rgba(18,16,14,.62)` + `blur(16px)` | Modal curtain |
| `selection` | bg accent, text `#FDF8F0` | `::selection` |
| `focus-ring` | **not defined in mockup** | **[ASSUMED] `outline: 2px solid var(--accent); outline-offset: 2px`** on `:focus-visible`. Inside bands `--accent` is `#FDF8F0`, so the ring turns cream automatically. Ratios: 5.06 (light paper), 5.07 (dark paper), 5.43 (cream on band). Circular controls follow their `border-radius` (Q3) |
| `veil` (ship) | — | **[ASSUMED] `linear-gradient(to top, rgba(12,10,8,.82) 0%, rgba(12,10,8,.62) 50%, rgba(12,10,8,.06) 100%)`**; card kind colour **`rgba(253,248,240,.9)`**. A 2-line card name then holds ≥5.33:1, and the kind ≥7.18:1, **even over a pure-white screenshot** (Q15) |

### 1.4 Grain texture

[P] `grainStyle` 577–583; [A] 159–165.

| Property | Value |
|---|---|
| Image | SVG `feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'`, full-size rect |
| `background-size` | `190px 190px` |
| Position | `position: fixed; inset: 0; z-index: 1; pointer-events: none` |
| Blend | `multiply` (light) / `screen` (dark) |
| Opacity | `grain / 100`. Mockup: 6 in [P] props (range 0–24, step 1) but 5.5 in [P] code fallback, [A] props (range 0–14, step .5) and [MP]. **[ASSUMED] `.06` on both routes, not user-adjustable.** [P] props, [D] and [H] all say 6% (Q5) |

### 1.5 WCAG contrast

Computed with WCAG 2.x relative luminance. Alpha colours are composited in sRGB over
their real background, and the dark accent is resolved via the OKLab mix. Thresholds:
4.5:1 for normal text; 3:1 for large text (≥24px regular or ≥18.66px bold) and for
non-text UI.

**Light mode**

| Pair (where used) | Ratio | Need | Result |
|---|---|---|---|
| ink `#23201C` on paper `#F5F0E7` | 14.29 | 4.5 | ✅ |
| ink on paper2 `#EDE6DA` | 13.08 | 4.5 | ✅ |
| **muted `#7A7268` on paper** — hero standfirst, about body, experience notes, article body 17px, meta, footer, eyebrow, skill labels | **4.17** | 4.5 | ❌ **FAIL** |
| **muted on paper2** — writing row hover, image placeholders | **3.82** | 4.5 | ❌ **FAIL** |
| **accent `#B4532A` on paper** — section H2 (21px at mobile), experience years 13px, quote attribution 12px, modal kind 11px, tags 12px, "More writing" 13px | **4.39** | 4.5 | ❌ **FAIL** for small text (passes 3:1 at ≥24px) |
| accent on paper — article H1 (34–58px, large) | 4.39 | 3 | ✅ |
| on-accent `#FDF8F0` on accent — primary button 15px/500, band headings, email, nav active label | 4.72 | 4.5 | ✅ |
| **band muted `rgba(253,248,240,.88)` on accent** — about body 16px, social links 15px | **4.03** | 4.5 | ❌ **FAIL** |
| **band muted on band paper2** — "Portrait" placeholder 11px | **3.23** | 4.5 | ❌ **FAIL** |
| paper on ink — FAB icon | 14.29 | 3 | ✅ |
| **accent text on paper** — primary button `:active` (inverted) | **4.39** | 4.5 | ❌ **FAIL** (transient state) |
| card name `#FDF8F0` over veil bottom (.78) | 10.63 | 3 | ✅ |
| card kind `rgba(…,.78)` over veil bottom | 7.20 | 4.5 | ✅ |
| **card name over veil at 44% stop (.34)** | **2.60** | 3 | ❌ only if a long name wraps upward. **[ASSUMED] Fixed by the ship veil in §1.3 plus a 2-line clamp on the name (Q15)** |
| card icon `#23201C` on `rgba(253,248,240,.92)` | 13.40 | 3 | ✅ |
| slate `#2F5D72` on paper / `#FDF8F0` on slate | 6.32 / 6.78 | 4.5 | ✅ |

**Dark mode**

| Pair (where used) | Ratio | Need | Result |
|---|---|---|---|
| ink `#EDE7DB` on paper `#191714` | 14.53 | 4.5 | ✅ |
| ink on paper2 `#221F1A` | 13.33 | 4.5 | ✅ |
| muted `#938A7D` on paper | 5.26 | 4.5 | ✅ |
| muted on paper2 | 4.83 | 4.5 | ✅ |
| accent `#C26F4E` (derived) on paper | 4.85 | 4.5 | ✅ |
| accent on paper2 | 4.45 | 4.5 | ❌ (no current usage places accent text on paper2) |
| **`#FDF8F0` on derived accent** — primary button 15px, band H2 at 21px, email at 22px, nav active label 9px | **3.49** | 4.5 | ❌ **FAIL** for normal text (passes 3:1 for large text and icons) |
| **band muted on derived accent** — about body, social links | **3.06** | 4.5 | ❌ **FAIL** |
| **band muted on band paper2** — portrait label | **2.55** | 4.5 | ❌ **FAIL** |
| card name / kind over veil | 18.14 / 11.12 | 3 / 4.5 | ✅ |
| **slate-derived `#507587` on paper** | **3.62** | 4.5 | ❌ **FAIL** if slate is chosen |
| `#FDF8F0` on slate-derived | 4.68 | 4.5 | ✅ |

**Non-text (UI) contrast against paper.** None of these borders reach 3:1:

| Border | Light | Dark |
|---|---|---|
| `border-section` (accent @48%) | 1.93 | 2.06 |
| `border-row` (accent @32%) | 1.53 | 1.57 |
| `border-control` (accent @45%) | 1.84 | 1.96 |
| `border-navdot` (ink @28%) | 1.78 | 2.27 |
| `border-card` (ink @14%) | 1.31 | 1.45 |

The rules and card borders are decorative, so 1.4.11 does not apply. The outline pill
buttons are identified by their text label, so their borders are not required to meet
3:1 either. They are recorded here so nobody later relies on the border alone. An
accent focus ring would pass 3:1 on paper in both modes (4.39 / 4.85). It would
**not** pass on the accent bands, which is why the ring colour is open (Q3).

**[ASSUMED] Every ❌ above is resolved by the shipping palette in §1.1a and the ship veil
in §1.3 (Q1, Q2, Q15).** Re-verified with the same method:

| Pair (ship values) | Ratio | Need |
|---|---|---|
| muted `#6D655C` on paper / paper2 | 5.05 / 4.62 | 4.5 ✅ |
| accent `#A9491F` on paper / paper2 | 5.06 / 4.63 | 4.5 ✅ |
| `#FDF8F0` on accent-fill `#A9491F` (both modes) | 5.43 | 4.5 ✅ |
| band muted `.89` on accent-fill | 4.65 | 4.5 ✅ |
| band ink `#FDF8F0` on band paper2 `.09` | 4.59 | 4.5 ✅ |
| dark accent `#C17558` on dark paper / paper2 | 5.07 / 4.65 | 4.5 ✅ |
| dark muted `#938A7D` on dark paper (unchanged) | 5.26 | 4.5 ✅ |
| focus ring: accent on paper (L / D), cream on band | 5.06 / 5.07 / 5.43 | 3 ✅ |
| card name over ship veil @50% (over white / paper2) | 5.33 / 6.13 | 4.5 ✅ |
| card kind `.9` over ship veil @20% (over white) | 7.18 | 4.5 ✅ |
| quote-dot inactive (ship: `text-muted`) on paper | 5.05 | 3 ✅ |

---

## 2. Typography

Source: [P] `<helmet>` line 13 and inline styles; [A] line 13 and inline styles;
[DN] line 12; [D] §3; [H] "Design tokens".

### 2.1 Families

| Role token | Family | Fallback stack (as written) | Weights used | Weights loaded in mockup |
|---|---|---|---|---|
| `font-serif` (display, long-form) | **Newsreader** (variable, `opsz` axis 6..72) | `Newsreader, Georgia, serif` | 300, 400; italic 300 (article pull-quote) | [P]: 300, 400, 500 + italic 300, 400. [A]: 300, 400 + italic 300 |
| `font-sans` (UI, body) | **IBM Plex Sans** | `'IBM Plex Sans', system-ui, sans-serif` | 400, 500 | 400, 500 |
| `font-script` (signature + hero word only) | **Caveat** | `'Caveat', cursive` | 600 | [P]: 500, 600. [A]: 600 |
| `font-mono` | IBM Plex Mono 400 — **only in the Dev notes doc page**, for `code` | `'IBM Plex Mono', monospace` | — | [DN] only |

- **Loading in the mockup:** the Google Fonts CSS API with `display=swap`, plus preconnect
  to `fonts.googleapis.com` / `fonts.gstatic.com`. The brief overrides this: self-host via
  `next/font`, variable, subset, with `size-adjust` fallback metrics.
  **[ASSUMED] `next/font/google` with its default `adjustFontFallback: true`.** It
  generates `size-adjust` / `ascent-override` / `descent-override` metrics for an
  automatic fallback face. The declared stacks above follow it. Use `display: 'swap'`
  (as in the mockup) and `subsets: ['latin']` (Q21).
- **Optical size:** the `opsz 6..72` axis is loaded, but no `font-variation-settings` or
  `font-optical-sizing` is set, so the browser default (`auto`) applies.
  **[ASSUMED] Keep `font-optical-sizing: auto` (Newsreader loaded with `axes: ['opsz']`).
  Ship only the weights in use: Newsreader 300, 400 + italic 300; Plex Sans 400, 500;
  Caveat 600. Drop the unused Newsreader 500, italic 400 and Caveat 500 (Q20).**
- **[ASSUMED] Mono role: IBM Plex Mono 400** for inline `code` and `pre` in article bodies.
  Style comes from [DN]: `font-size: .88em; background: var(--paper2); padding: 1px 5px;
  border-radius: 3px`. Load it only on the article route (Q19).
- Rendering: `-webkit-font-smoothing: antialiased` on `body`.

### 2.2 Type scale by role

Mobile/desktop extremes are the `clamp()` endpoints, exactly as written. Tracking in `em`.

| Role | Element (source) | Family / weight | Size | Line-height | Tracking | Other |
|---|---|---|---|---|---|---|
| **display** | Hero H1 [P] 63 | serif 300 | `clamp(40px, 7.4vw, 92px)` | 1.05 | −.02em | `max-width: 16ch; text-wrap: pretty` |
| display-highlight | Hero `<em>` "web" [P] `webStyle` | script 600, `font-style: normal` | `1.1em` | .84 | — | bg accent, text `#FDF8F0`, `padding: .04em .16em .1em .14em; margin: 0 -.04em; border-radius: 3px; vertical-align: -.03em; display: inline-block` |
| signature (intro) | [P] `bigTextStyle` | script 600 | `clamp(54px, 12.5vw, 104px)` | .95 | — | nowrap; rotated `signatureTilt` (default −4deg), origin `0% 80%` |
| signature (navbar) | [P] `slotTextStyle`, [A] `sigStyle` | script 600 | `31px` | .95 | — | nowrap; `translateY(6px) rotate(-4deg)` [P] / `rotate(-4deg)` [A] |
| **h1** (article) | Article title [A] 51 | serif 300 | `clamp(34px, 6vw, 58px)` | 1.1 | −.015em | colour accent; `max-width: 20ch; text-wrap: pretty` |
| h1-alt (contact statement) | Contact H2 #2 [P] 203 | serif 300 | `clamp(32px, 5.4vw, 64px)` | 1.1 | −.015em | `max-width: 18ch; text-wrap: pretty` |
| lead (about) | About lead [P] 88 | serif 300 | `clamp(23px, 3vw, 34px)` | 1.35 | — | `text-wrap: pretty`; mb 28px |
| lead (article) | First paragraph [A] 68 | serif 300 | `clamp(20px, 2.6vw, 25px)` | 1.55 | — | `text-wrap: pretty` |
| quote | Blockquote [P] 192 | serif 300 | `clamp(22px, 3.2vw, 34px)` | 1.45 | — | `text-wrap: pretty`; centred |
| quote-mark | `“` [P] 188 | serif (400 default) | `clamp(54px, 8vw, 86px)` | .6 | — | colour accent; `height: .42em` |
| **h2** (section heading) | "About", "Experience", … [P] 82 etc. | serif 400 | `clamp(21px, 2.5vw, 28px)` | 1 | — | colour accent; mb 42px |
| h2 (article) | [A] 72 | serif 400 | `clamp(24px, 3.4vw, 32px)` | 1.25 | — | margin-top `clamp(16px, 3vh, 26px)` |
| pull-quote (article) | [A] 77 | serif 300 italic | `clamp(20px, 2.6vw, 26px)` | 1.5 | — | see §6 Article body |
| **h3** (row title) | Experience role [P] 103 | serif 400 | `clamp(21px, 2.4vw, 27px)` | 1.2 | — | |
| h3 | Writing title [P] 157 | serif 400 | `clamp(20px, 2.3vw, 26px)` | 1.25 | — | `max-width: 34ch` |
| h3 | Modal title [P] `pTitleStyle` | serif 400 | 28px (narrow) / 36px | 1.12 | — | |
| h3 | Card name [P] `nameStyle` | serif 400 | 23px | 1.15 | — | colour `#FDF8F0` |
| email-display | Contact email [P] 204 | serif (400) | `clamp(22px, 3vw, 32px)` | inherit | — | border-bottom 1px `border-control`; pb 4px |
| list-serif | Skill item [P] 178 | serif 300 | 19px | 1.3 | — | |
| **h4** (label) | Skill group title [P] 175 | sans 500 | 12px | inherit | .14em | uppercase; muted; mb 18px |
| **body-lg** | Hero standfirst [P] 64 | sans 400 | `clamp(16px, 1.5vw, 18px)` | 1.75 | — | muted; `max-width: 52ch` |
| body-article | Article paragraphs [A] 70 | sans 400 | 17px | 1.85 | — | muted |
| **body** | About paragraphs [P] 89 | sans 400 | 16px | 1.8 | — | muted |
| body | Modal note [P] `pNoteStyle` | sans 400 | 15px (narrow) / 16px | 1.75 | — | muted |
| body-sm | Experience note [P] 113 | sans 400 | 15px | 1.75 | — | muted; `max-width: 62ch` |
| button | Primary / outline pill [P] 66, 69 | sans 500 / 400 | 15px | — | — | |
| body-ui | Social links [P] 205 | sans 400 | 15px | — | — | muted |
| button-sm | Modal Live / Source [P] | sans 400 | 14px | — | — | |
| meta | Company [P] 104 | sans 400 | 14px | — | — | muted |
| **small** | Experience years [P] 106 | sans 400 | 13px | — | .06em | accent; `tabular-nums`; nowrap |
| small | Writing read / date [P] 158–159; footer; article meta; Listen button | sans 400 | 13px | — | — | muted (date: `tabular-nums`) |
| eyebrow | Hero eyebrow [P] 62 | sans 400 | 12px | — | .16em | uppercase; muted; mb 28px |
| eyebrow | Quote attribution [P] 193 | sans 400 | 12px | — | .16em | uppercase; accent; mt 22px |
| label-button | "Show more" [P] `moreBtnStyle` | sans 400 | 12px | — | .13em | uppercase |
| label | Article back link [A] 45 | sans 400 | 12px | — | .14em | uppercase; muted |
| tag | Project tag [P] `pTags` | sans 400 | 12px | — | .02em | accent |
| micro | Modal year | sans 400 | 12px | — | — | muted; `tabular-nums` |
| micro-caps | Card kind; image placeholders; modal kind | sans 400 | 11px | — | .13em (card kind) / .14em (others) | uppercase |
| micro-caps | Scroll cue label [P] 76 | sans 400 | 10px | — | .18em | uppercase |
| micro-caps | Nav item label [P] `labelStyle` | sans 500 | 9px | — | .07em | uppercase |
| **mono** | Article inline `code` / `pre` [ASSUMED] | IBM Plex Mono 400 | `.88em` | inherit (`pre`: 1.6 [ASSUMED]) | — | bg `surface`, pad `1px 5px`, radius 3px (from [DN]). `pre`: pad 16px, `overflow-x: auto` [ASSUMED] (Q19) |

---

## 3. Spacing, radii, shadows, borders

Source: [P] and [A] inline styles and `renderVals()`.

### 3.1 Spacing actually used

The mockup has **no spacing scale**. These are the literal values in use, grouped by kind:

| Kind | Values |
|---|---|
| Fixed px (gaps, margins, paddings) | 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 44, 52 |
| Fluid gaps | `clamp(16px,2.4vw,26px)` (project grid), `clamp(30px,5vw,72px)` (about grid), `clamp(30px,5vw,40px)` × `clamp(22px,4vw,48px)` (skills row × col), `clamp(26px,4vw,38px)` ("Show more" top margin) |
| Section padding | `clamp(72px,11vh,132px) 0` (standard); About `clamp(76px,12vh,140px) 0`; Contact `clamp(76px,12vh,140px) 0 clamp(72px,10vh,110px)`; Hero `116px 0 78px` |
| Article | main `clamp(108px,15vh,150px) 0 clamp(70px,10vh,110px)`; back-link mb `clamp(30px,5vh,48px)`; meta mt `clamp(22px,3vh,30px)`, pb `clamp(26px,4vh,36px)`; body mt `clamp(30px,5vh,46px)`, block gap 26px; footer mt `clamp(52px,8vh,84px)`, pt `clamp(26px,4vh,36px)` |
| Floating-control offset `off` | `clamp(16px,3.4vw,34px)` |
| Modal stage padding | `clamp(14px,3vw,40px)` |

**[ASSUMED] Keep the literals exactly, and express them on Tailwind's default spacing base
`--spacing: 0.25rem` (4px).** Every fixed value above is an exact multiple of 0.25 steps
(3px = `0.75`, 7px = `1.75`, 42px = `10.5`, …), so no value moves and no magic numbers
appear in markup. The fluid clamps become named tokens (§8): `--spacing-section`,
`--spacing-band`, `--spacing-band-end`, `--spacing-grid-projects`, `--spacing-grid-about`,
`--spacing-grid-skills-row` / `-col`, `--spacing-more`, `--spacing-float-offset`,
`--spacing-stage`, and the `--spacing-article-*` set. Normalising into a coarser scale was
rejected because it would move mockup values (Q24).

### 3.2 Radii

| Token | Value | Where |
|---|---|---|
| `radius-xs` | 2px | Quote-dot bar (defined but not rendered in the mockup; **rendered [ASSUMED], Q13**) |
| `radius-sm` | 3px | Portrait, hero highlight, `code` [DN] |
| `radius-row` | 6px | Experience row button (pressed-state background) |
| `radius-card` | 10px | Project card |
| `radius-modal` | 14px | Project modal |
| `radius-pill` | 999px | All pill buttons, tags, nav labels |
| `radius-full` | 50% | Circular controls (toggle, dial, FAB, nav items, icon buttons, back-to-top) |

### 3.3 Shadows (each has a light and a dark value)

| Token | Light | Dark | Where |
|---|---|---|---|
| `shadow-card-hover` | `0 20px 44px rgba(40,32,22,.2)` | `0 20px 44px rgba(0,0,0,.5)` | Project card hover (rest: `0 0 0 rgba(0,0,0,0)`) |
| `shadow-modal` | `0 40px 90px rgba(40,32,22,.28)` | `0 40px 90px rgba(0,0,0,.6)` | Project modal |
| `shadow-fab` | `0 12px 30px rgba(40,32,22,.26)` | `0 12px 30px rgba(0,0,0,.5)` | Nav FAB |
| `shadow-float` | `0 8px 22px rgba(40,32,22,.16)` | `0 8px 22px rgba(0,0,0,.42)` | Nav items |
| `shadow-float-top` | `0 8px 22px rgba(40,32,22,.16)` | `0 8px 22px rgba(0,0,0,.4)` | Back-to-top (dark alpha differs: .4 vs .42) |

### 3.4 Borders

All borders are **1px solid**, coloured by the `border-*` tokens in §1.3. The exceptions:
- Theme dial: `1.5px solid` accent.
- Article pull-quote: `border-left: 2px solid` accent.
- Signature underline: SVG stroke (not a border), width 1.8 (intro) / 2.6 (navbar),
  `stroke-linecap: round`, path `M4,7 C70,2 214,1 292,6 C298,6.5 299,9 290,10` in a
  `viewBox="0 0 300 12"` stretched with `preserveAspectRatio="none"`, height 9px (intro) /
  5px (navbar).

### 3.5 Z-index layers

[P]: grain `1` · header `50` · nav curtain `55` · floating dock `60` · modal curtain `80` ·
modal stage `81` · intro overlay `100`.

**[ASSUMED] The project modal uses a native `<dialog>` opened with `showModal()` (Q16).** It
renders in the top layer, which sits above every z-index. Its `::backdrop` takes the
modal-curtain styling, so the 80/81 values become unnecessary but harmless.

---

## 4. Layout

Source: [P] section styles, `footerStyle`, `dockWrapStyle`, `pCardStyle`, `onResize`
(line 408–412); [A] `main`; [H] "Target"; [DN] "Lists and sections".

### 4.1 Containers and measures

| Token | Value |
|---|---|
| `measure-page` | `width: min(1140px, 100% - clamp(28px, 5.2vw, 44px)); margin: 0 auto` |
| `measure-article` | `width: min(760px, 100% - clamp(28px, 5.2vw, 44px))` |
| Gutter (per side) | half of `clamp(28px, 5.2vw, 44px)` → **14px at 390px**, 22px at ≥846px viewport |
| `header-height` | 76px (`scroll-margin-top: 76px` on every section) |
| Deep-link landing offset | 104px ([P] 429). Writing rows have `scroll-margin-top: 120px` |

**[ASSUMED] Two offsets, both CSS (Q29):**
- **76px** (`scroll-margin-top`) on section anchors, matching the header height.
- **104px** (`scroll-margin-top`) on `#post-[id]` rows and any other row-level deep link,
  matching [P]'s JS landing value.

Landing then uses `element.scrollIntoView()`, so the JS and CSS offsets can no longer
disagree (the mockup's 120px row margin was dead against its own 104px JS offset).

### 4.2 Section rhythm

- Standard sections (Experience, Projects, Writing, Skills, Quotes) sit inside
  `measure-page`, with `border-top: 1px border-section` and padding
  `clamp(72px, 11vh, 132px) 0`.
- The bands (About, Contact) are full-bleed accent, with `measure-page` inside.
- The hero has `min-height: 100svh`, a centred flex column, and padding `116px 0 78px`.
- Section heading → content: 42px.

### 4.3 Breakpoint — as a container query

The mockup has **one** breakpoint: `narrow = window.innerWidth < 760` ([P] 410). Everything
else is fluid via `clamp()` / `auto-fit`. Expressed as container queries:

| Container | Element | `container-type` | Rule |
|---|---|---|---|
| `page` | Root page wrapper (spans the viewport; its width is the viewport minus the native scrollbar, which is restored per Q22) | `inline-size` | `@container page (width >= 760px)` = "wide". Base styles are narrow (mobile-first). |
| `stage` | Modal stage (`position: fixed; inset: 0`) | `inline-size` | Same 760px threshold for the modal layout |
| `dock` | Floating dock wrapper (absolute, `left: 0; right: 0`) | `inline-size` | Same 760px threshold for the nav arc radius |

**[ASSUMED] Keep the `clamp()` values in `vw`/`vh` exactly as written (Q25).** They are
fluid *type and rhythm* values tuned against the viewport. Container queries do all
*layout switching* (the 760px rule, the modal layout, the arc radius). Additional
component-level containers are allowed later, but nothing in the mockup needs them.

### 4.4 Per-section behaviour: 390px vs wide (≥760px)

| Section | 390px (narrow) | Wide |
|---|---|---|
| Header | 76px, signature left, 46px toggle right | Same |
| Hero | Clamp minimums: H1 40px, standfirst 16px; CTAs wrap (`flex-wrap`, gap 12px) | Clamp to max: H1 92px @ ≥1243px viewport |
| About | Grid `repeat(auto-fit, minmax(min(100%,250px), 1fr))` → 1 column; portrait `max-width: 360px`, `aspect-ratio: 4/5` | 2 columns once each column has 250px (auto-fit, not the 760 breakpoint); gap `clamp(30px,5vw,72px)` |
| Experience | Row padding `20px 6px`; `align-items: flex-start`; role + company **stacked** (column, gap 4px) | Row padding `24px 6px 24px 0`; baseline-aligned; role + company inline (wrap, gap `6px 20px`) |
| Projects | Cards `flex: 1 1 100%` (one per row); overlay **always visible** | `flex: 1 1 248px; max-width: calc((100% - 2 * gap) / 3)` → 3 per row; partial last row **centred** (`justify-content: center`); overlay on hover |
| Writing | Rows `flex-wrap`; title wraps above meta | Title · read time · date (`margin-left: auto`) on one line |
| Skills | `repeat(auto-fit, minmax(146px, 1fr))` → 2 columns at 390px | Up to 4 columns |
| Quotes | `max-width: 44ch`, centred; box height `clamp(215px, 24vw, 240px)` | Same |
| Contact | Statement 32px; socials wrap (gap 28px) | Statement up to 64px |
| Footer | `min-height: calc(off + 96px)`; two spans `space-between`, wrap gap `6px 12px`; 13px muted | Same |
| Project modal | `width: min(100%, 420px); height: 600px`; column; image full-width `aspect-ratio: 16/9`; body padding 20px, gap 12px, top-aligned | `880px × 420px`; row; image pane 392px wide; body padding 32px, gap 14px, vertically centred. Both capped by `max-height: 88svh; max-width: 100%` |
| Nav arc radius | 250px | 334px (wheel variant: 150px at every width) |
| Article | `measure-article`; same clamps | Same |

**[ASSUMED] The project-card overlay is visible when any of these holds (Q15):**
- the `page` container is narrow (mockup behaviour, kept);
- `@media (hover: none)` (a touch device at any width, as [H]/[DN] require);
- `:hover`;
- `:focus-within` (keyboard).

`(hover: none)` is an input-capability media query, not a layout breakpoint, so it does not
conflict with the container-query rule.

---

## 5. Motion

Source: [P] `@keyframes` lines 22–25 and every `transition` in `renderVals()`; [A];
[DN] "Signature intro", "Floating navigation", "Interaction and motion"; [H] checklist.

### 5.1 Easing tokens

| Token | Value | Used by |
|---|---|---|
| `ease-out-soft` | `cubic-bezier(.2,.85,.25,1)` | Hero `fadeUp`, cue, caret, card lift, card image scale, links/caption, modal, FAB, back-to-top, quote, quote dot |
| `ease-char` | `cubic-bezier(.3,.7,.3,1)` | Signature letters |
| `ease-flip` | `cubic-bezier(.62,.02,.2,1)` | Signature flight to navbar |
| `ease-dial` | `cubic-bezier(.6,0,.2,1)` | Theme dial rotation |
| `ease-expand` | `cubic-bezier(.32,.72,.3,1)` | Experience row height |
| `ease-spiral-out` | `cubic-bezier(.16,.9,.24,1)` | Nav open; wheel-variant dock slide |
| `ease-spiral-in` | `cubic-bezier(.4,.05,.25,1)` | Nav close |
| `ease-cue` | `cubic-bezier(.4,0,.3,1)` | Scroll-cue wheel loop |
| `ease` / `ease-out` | CSS keywords | Colour, opacity and underline draw |

### 5.2 Keyframes

```
charIn  from { opacity:0; transform:translateY(7px) rotate(-2deg) } to { opacity:1; transform:none }
fadeUp  from { opacity:0; transform:translateY(14px) }              to { opacity:1; transform:none }
wheel   0% { transform:translateY(0); opacity:0 } 18% { opacity:1 }
        68% { transform:translateY(15px); opacity:0 } 100% { transform:translateY(15px); opacity:0 }
sigdraw to { stroke-dashoffset:0 }        (path pathLength=1, dasharray 1, dashoffset 1)
```

### 5.3 Per-interaction table

**Reduced-motion rule, verbatim from [DN]:** *"Honour prefers-reduced-motion: skip the
intro, the spiral, and the card scale, and keep the colour and opacity changes."* [H] adds:
"drop the intro, spiral and card scale." The fallback column applies that rule.

**[ASSUMED] General reduced-motion rule for every case it does not name (Q12):**
- **Every transform-based motion (translate, scale, rotate) becomes instant.** In the token
  layer, `--dur-move-*` resolves to `0s`.
- **Opacity and colour transitions keep their durations.**
- **Looping and auto-advancing motion stops.**
- `scroll-behavior` becomes `auto`.

**[ASSUMED] Brief compliance (Q11).** The brief allows only `transform` / `opacity`. Colour
transitions are also allowed: they are paint-only, and the [DN] reduced-motion rule
explicitly keeps them. Everything else (height, padding, box-shadow, filter,
backdrop-filter, width) is re-expressed below as transform/opacity, keeping the mockup's
duration and easing.

The "Ship" notes in the table override the mockup column.

| Interaction | Property · duration · easing · delay | Reduced-motion fallback |
|---|---|---|
| **Theme change** (root, header, bands) | `background-color .45s ease, color .45s ease` | Keep (colour) |
| Theme dial | `transform rotate(0→180deg) .5s ease-dial`; `border-color .4s ease`; `background .4s ease` | [ASSUMED] Rotation instant; colours kept (Q12) |
| Theme toggle button | `border-color .3s ease, background-color .2s ease` | Keep |
| **Signature intro — letters** | `charIn .34s ease-char`, stagger `0.055s × index` (14 glyphs; the space is a ` `) | **Skip intro entirely** |
| Intro — underline | `sigdraw .55s ease-out` delay `1.02s` | Skip |
| Intro — hold → flip | Flip starts `2050ms` after `document.fonts.ready`; `transform .95s ease-flip` from measured big rect to navbar slot (`translate(tx,ty) scale(k)`, `k = slotWidth / bigWidth`, `transform-origin: top left`) | Skip |
| Intro — overlay fade | Overlay paper `opacity 1→0 .75s ease .3s` (starts with the flip) | Skip |
| Intro — hand-off | Phase 2 set `990ms` after the flip starts; big mark hides and navbar mark shows (`opacity 0→1`) **in one frame, no cross-fade** | Navbar mark shown immediately |
| Intro — skip conditions | `sessionStorage['ts-internal'] === '1'` (set on internal link click, consumed on arrival) or `introEnabled === false`. **[ASSUMED] Also skipped under reduced motion. Any `pointerdown`, `keydown`, `wheel` or `touchstart` during the intro jumps straight to the hand-off. The overlay is `pointer-events: none` throughout (Q10)** | — |
| **Hero entrance** (`fadeUp`) | Eyebrow `.8s`, H1 `.85s`, standfirst `.85s`, CTAs `.85s`, all `ease-out-soft`, `both`; delays `var(--enter) + .05s / .14s / .24s / .34s`; `--enter` = `2.3s` while the intro plays, `0.05s` otherwise. **Ship [ASSUMED] (Q9):** keyframe `rise` = `from { transform: translateY(14px) } to { transform: none }`, with **no opacity change**. Hero text is painted at full opacity from the first frame (under the intro overlay, when present), so LCP is never gated by the animation. Durations, easing and delays unchanged | [ASSUMED] No animation (Q12) |
| Scroll cue — loop | `wheel 1.9s ease-cue infinite` | [ASSUMED] Animation off; the wheel dot is shown static at its `0%` position with `opacity: 1` (Q12) |
| Scroll cue — show/hide | `opacity .6s ease, transform translateY(12px→0) .6s ease-out-soft`; shown only after the intro; hides on first `scrollY > 40` or after `8200ms` | [ASSUMED] Opacity kept; translate instant (Q12) |
| **Primary pill button** | `transform .25s ease, opacity .25s ease, background-color .18s ease, color .18s ease`; hover `translateY(-2px); opacity: .92` | [ASSUMED] No lift; `opacity: .92` and colour kept (Q12) |
| Outline pill button | `border-color .25s ease, background-color .18s ease, color .18s ease` | Keep |
| "Show more" | `background .2s ease, color .2s ease, border-color .2s ease` | Keep |
| **Experience row expand** | Body `height 0 → measured scrollHeight .5s ease-expand` + `opacity .38s ease`; caret `rotate(0→180deg) .34s ease-out-soft`; row press bg `.2s ease`. **Ship [ASSUMED] (Q11):** the body's height switches in one frame (`hidden` removed). Its inner content animates `opacity 0→1 .38s ease` + `transform translateY(-8px)→none .5s ease-expand`. Collapse reverses, then re-applies `hidden`. The caret is unchanged | [ASSUMED] Instant open/close; content opacity fade kept; caret rotation instant (Q12) |
| **Writing row hover** | `padding-left 0→16px .3s ease, background-color .3s ease` (to `surface`). **Ship [ASSUMED] (Q11):** row content `transform: translateX(16px) .3s ease`; the row keeps `padding-right: 16px` so a shifted title never touches the date; the background transition is unchanged | [ASSUMED] No shift; background kept (Q12) |
| **Project card hover** | Card `transform translateY(-3px) .35s ease-out-soft, box-shadow .35s ease`; image `filter blur(0→3px) .4s ease, transform scale(1→1.04) .5s ease-out-soft`; veil `opacity .35s ease`; links `opacity .3s ease, translateY(-6px→0) .35s ease-out-soft`; caption `opacity .3s ease, translateY(8px→0) .38s ease-out-soft`. **Ship [ASSUMED] (Q11):** `shadow-card-hover` lives on a `::after` layer whose `opacity 0→1 .35s ease` replaces the box-shadow transition. **Image blur dropped** (the ship veil in §1.3 carries caption legibility); image scale kept | Card lift, image scale and caption/link translates **skipped**; veil, caption, links and shadow-layer opacity kept |
| **Project modal open** | Curtain `opacity .34s ease`, `backdrop-filter blur(0→16px) .34s ease`, `background .34s ease`. **Ship [ASSUMED] (Q11):** `::backdrop` has static `backdrop-filter: blur(16px)` + scrim colour and fades via `opacity .34s ease` only. Card `transform translate(dx,dy) scale(s) → none .46s ease-out-soft`, `opacity 0→1 .3s ease`; starts after 2× `requestAnimationFrame`; `s = clamp(.22, cardRectHeight / min(innerHeight × .8, 620), .8)`; `dx, dy` = clicked card centre − viewport centre | **Card scale skipped**; opacity kept |
| Modal close | Reverse of the above; unmount after `320ms`; scroll restored with `scroll-behavior: auto` | Same |
| **Nav open (arc / wheel)** | Per item `i` (0–5): pivot `rotate(θ+200° → θ)`, arm `translateX(0 → R)`, node counter-rotate + `scale(.35→1)`, all `.82s ease-spiral-out` delay `i × .062s`; node `opacity .34s ease` same delay | **Spiral skipped** (rule); opacity kept |
| Nav close | Same properties reversed, `1.02s ease-spiral-in`, delay `(5 − i) × .07s`; `opacity .5s ease` | Spiral skipped |
| Nav geometry | Arc: θ from `−177°` to `−93°` (bottom-right) or `−158°` to `−22°` (bottom-centre), evenly spaced; R = 334px wide / 250px narrow. Wheel: θ = `−90° + 360° × i / 6`, R = 150px, dock slides to the viewport centre (`transform .72s ease-spiral-out`) | — |
| Nav curtain | `opacity .5s ease, backdrop-filter blur(0→14px) .5s ease, background .5s ease`. **Ship [ASSUMED] (Q11):** static `backdrop-filter: blur(14px)` + scrim colour; the curtain fades via `opacity .5s ease` only | Opacity kept |
| Nav item colour | `background .25s ease, color .25s ease, border-color .25s ease` | Keep |
| FAB icon | Icon swaps to × and `rotate(0→90deg) .5s ease-out-soft` | [ASSUMED] Icon swap without rotation (Q12) |
| FAB appear | `opacity .35s ease`, `transform scale(.7→1) .4s ease-out-soft`, `background .4s ease, color .4s ease` | [ASSUMED] Opacity and colour kept; scale instant (Q12) |
| Back-to-top appear | `opacity .3s ease`, `transform translateY(10px) scale(.7) → none .4s ease-out-soft` | [ASSUMED] Opacity kept; transform instant (Q12) |
| **Quote rotation** | Every `7000ms` (paused while `document.hidden`); figure `opacity .7s ease, transform translateY(10px→0) .7s ease-out-soft`. **Ship [ASSUMED] (Q13):** also paused on `:hover`, on `:focus-within` and by the pause toggle. The dot indicator animates `transform: scaleX(10/22 → 1)` on a 22px bar (`transform-origin: center`) instead of `width` (Q11); duration and easing unchanged | [ASSUMED] Opacity cross-fade kept; translate instant; **auto-advance off**; the rotator starts paused and is user-driven by dots (Q12, Q13) |
| Contact email | `border-color .3s ease` | Keep |
| Article back link / "More writing" | `color .2s ease` | Keep |
| Listen button | `background .25s ease, color .25s ease, border-color .25s ease` | Keep |
| Page scroll | `html { scroll-behavior: smooth }`; forced to `auto` during programmatic restores | [ASSUMED] `scroll-behavior: auto` (Q12) |

**Brief conflicts.** The brief allows only `transform` and `opacity` to animate. The mockup
also animates `height`, `padding-left`, `box-shadow`, `filter`, `backdrop-filter`,
`width` (quote dot) and colours. **[ASSUMED] Each one is re-expressed in the "Ship" notes
above. Colour transitions are kept (Q11).**

---

## 6. Component inventory

Sources: [P], [A], [DN], [H] "Accessibility". "Pressed" = `:active` from `style-active`.
**Focus-visible is undefined for every component** (Q3). **The mockup has no disabled
states.**

**[ASSUMED] Focus-visible, all interactive components (Q3):** the `focus-ring` token (§1.3),
drawn on the element's own shape. Two exceptions:
- **Project card:** the ring goes on the card via `:has(> .card-trigger:focus-visible)`,
  because `overflow: hidden` would clip it.
- **Rows** (experience, writing): the ring is inset (`outline-offset: -2px`), because rows are
  full-width against hairlines.

**[ASSUMED] Disabled:** nothing in the design can be disabled. If it ever is,
`opacity: .45; cursor: not-allowed`, with no hover or pressed change (conventional). Not
needed in Phase 3.

**[ASSUMED] Missing hover states:** [DN] says every control has one. Controls the mockup
left without a hover state ("Show more", nav items, back-to-top, modal Live/Source,
modal close, card icons) get the outline-pill pattern: border → `accent`. Filled controls
(modal Live) get the primary-pill pattern: `opacity: .92`.

| Component | Variants | Default | Hover | Pressed (`:active`) | A11y requirements |
|---|---|---|---|---|---|
| **GrainOverlay** | — | §1.4 | — | — | `aria-hidden`; non-interactive |
| **Header** | — | Fixed, 76px, `bg-translucent` + `blur(10px)`, bottom `border-header` | — | — | `<header>` landmark |
| **SignatureMark** (navbar) | page (scroll to top) / article (back to portfolio) | Caveat 31px ink + accent underline, tilted −4deg; hidden until the intro hands off | Global `a:hover` → accent | — | Link. [P] `aria-label="Top of page"` but visible text "Tanishk Saxena". **[ASSUMED] `aria-label="Tanishk Saxena — back to top"` ([P]) / `"Tanishk Saxena — back to portfolio"` ([A]), so the visible name leads the label (WCAG 2.5.3) (Q23)** |
| **IntroOverlay** | on / off | Full-viewport paper, big signature | — | — | The mockup blocks pointer events during phase 0. **[ASSUMED] `pointer-events: none` throughout; any input skips to the hand-off (Q10)**. `aria-hidden` (duplicate of the name) |
| **ThemeToggle** | — | 46×46 [P] / 44×44 [A] circle, 1px `border-control`, 17px half-filled dial. **[ASSUMED] 46×46 on both routes** ([P] is the primary page; matches the 46px "Show more" height) (Q6) | border → accent | bg + border → accent | `aria-label="Toggle colour mode"`; **[ASSUMED] `aria-pressed` = dark mode on** |
| **Button — primary pill** | with icon (download) | h 50, px 24, gap 10, pill, bg accent, text `#FDF8F0`, 15px/500 | `translateY(-2px); opacity: .92` | bg paper, text accent (inverted), no lift | Résumé link uses `download` |
| **Button — outline pill** | — | h 50, px 24, pill, 1px `border-control`, 15px | border → accent | bg + border accent, text `#FDF8F0` | — |
| **Button — "Show more"** | — | h 46, px 24, pill, 12px/.13em caps, text ink, 1px `border-control` | — (none defined) | bg + border accent, text `#FDF8F0` | Disappears when the list is exhausted; move focus sensibly when it unmounts (not in mockup) |
| **ScrollCue** | — | 26×42 mouse glyph + "Scroll", muted, bottom `clamp(22px,4vh,38px)` | — | — | Decorative: `aria-hidden`, `pointer-events: none` |
| **SectionHeading** | on paper / in band | Serif 400 accent (cream inside a band) | — | — | `<h2>`, one per section |
| **AccentBand** | About / Contact | Full-bleed accent + token overrides (§1.2) | — | — | Contrast failures (§1.5); **[ASSUMED] background = `accent-fill` in both modes, fixing them (Q2)** |
| **PortraitFrame** | placeholder / image | `aspect-ratio: 4/5`, `max-width: 360px`, radius 3px, 1px `border-header`, bg `surface`. **[ASSUMED] The placeholder label uses band `--ink` (Q2)** | — | — | Real image needs `alt`; explicit dimensions (CLS) |
| **ExperienceRow** (accordion) | collapsed / expanded | Top border `border-row`; button row (role · company · years · caret 22×22) | — | bg `press-row`, radius 6px | `<button aria-expanded aria-controls>` ([H]). **[ASSUMED] The collapsed body carries `hidden`** (the mockup only uses height 0 + opacity 0, which leaves content in the a11y tree) |
| **ProjectCard** | overlay hidden (wide, rest) / shown (hover, or always at narrow) | 4:3, radius 10px, 1px `border-card`, bg `surface`; image; veil; name + "kind — year" bottom-left (16px/14px inset); live/source icons top-right (10px inset, gap 8). **[ASSUMED] Name clamped to 2 lines (`line-clamp: 2`); ship veil (§1.3)** | lift −3px + shadow; image blur 3px + scale 1.04; veil/caption/links fade in (**ship: no blur, Q11**) | Icons: bg accent, text `#FDF8F0` | [P] uses `div role="button" tabindex="0"` with only `onClick`: **no Enter/Space handling**, and it **nests two links inside a button** (invalid). **[ASSUMED] Structure (Q15):** `<article>` wrapper → `<button class="card-trigger" aria-haspopup="dialog">`, stretched over the card with an `::after` hit area, accessible name = project name; the icon links are **siblings** positioned above it (`z-index`), so no nesting and native Enter/Space. The overlay shows per §4.4. Icon links: `aria-label` "Live site" / "Source", `target="_blank" rel="noreferrer"` |
| **CardIconLink** | live / source | 38×38 circle, bg `card-icon-bg`, icon `#23201C`. **[ASSUMED] 44×44** (the nav-item precedent; 16px icon unchanged) (Q4) | [ASSUMED] bg `#FDF8F0` (opacity 1) | bg accent, icon `#FDF8F0` | **[ASSUMED] The live link is not rendered when `live_url` is null (Q17)** |
| **ProjectModal** | narrow / wide | §4.4 sizes; radius 14px; 1px `border-card`; `shadow-modal`; image pane; body: kind (accent micro-caps) + year, title, note, ≤3 tags, Live + Source buttons | — | — | [H]: Escape, close button and curtain all close it; **focus trap and return focus to the card (not implemented in mockup — required)**. **[ASSUMED] Native `<dialog>` + `showModal()`** (native focus trap, Escape and inert background) with `aria-labelledby` = title; focus returns to the card trigger; backdrop click closes. **Body keeps the mockup's `overflow-y: auto` as a content-robustness fallback**; copy is authored to fit (Q16). Background scroll-lock: `body{position:fixed; top:-y}` |
| **ModalClose** | — | 38×38 circle, bg paper, 1px `border-close`, × icon, top/right 12px. **[ASSUMED] 44×44, same position (Q4)** | [ASSUMED] border → accent | bg ink, icon paper | `aria-label="Close"` |
| **Tag** | — | 12px/.02em, pad `6px 11px`, pill, 1px `border-header`, text accent | — | — | Static text. **[ASSUMED] Passes with the ship accent `#A9491F` (Q1). Modal shows the first 3 tags (mockup `slice(0,3)`) (Q16)** |
| **Modal Live button** | — | h 44, px 18, gap 9, pill, bg accent, `#FDF8F0`, 14px, globe icon | [ASSUMED] `opacity: .92` | bg paper, text accent | External link. **[ASSUMED] Not rendered when `live_url` is null; Source then stands alone (Q17)** |
| **Modal Source button** | — | h 44, px 18, pill, 1px `border-quiet`, text ink, GitHub icon | — | bg ink, text paper | External link |
| **WritingRow** | — | Link row: pad `24px 16px 24px 0`, top `border-row`; title, read time, date | `padding-left: 16px`, bg `surface`, colour inherit (**ship: content `translateX(16px)`, Q11**) | bg `press-writing` | `<a>` containing `<h3>`; `id="post-[id]"` deep-link target (`scroll-margin-top: 104px` [ASSUMED], Q29). Deep link expands the list first ([DN]) |
| **SkillGroup** | — | `<h4>` label + `<ul>` serif items, gap 11px | — | — | Semantic list |
| **QuoteRotator** | — | Fixed-height box; `figure > blockquote + figcaption`; stacked absolutely, cross-fading | [ASSUMED] Dots: bar → `accent` | [ASSUMED] Dots/pause: bg `press-row` | WCAG 2.2.2 needs a pause/stop for auto-advancing content (>5s); dot controls exist in code (`dotStyle`, 34×44 targets) but are **not rendered**. **[ASSUMED] (Q13):** below the box, a centred row of 6 dot buttons (visual bar 2px tall, 10px inactive / 22px active, radius 2px; active `accent`, **inactive `text-muted`**, since the mockup's ink@28% gives 1.78:1 against the 3:1 UI minimum; **hit area 44×44**, up from the mockup's 34×44), then a 44×44 pause/play icon button (`aria-pressed`, label "Pause quotes" / "Play quotes"). Wrapper `<section aria-roledescription="carousel" aria-label="Quotes">`; each dot `aria-label="Quote n of 6"`, `aria-current` on the active one; the figure container `aria-live="off"` while auto-rotating and `"polite"` while paused; hidden figures `aria-hidden="true"` |
| **ContactBlock** | — | Heading, statement, email at display size, socials | Email: underline → accent | Email: `color: accent` (inside the band, accent = cream) | `mailto:` link |
| **SocialLinks** | GitHub, LinkedIn, Read.cv, X | 15px band-muted, gap 28px | Global `a:hover` → accent (cream in band) | — | Text links: **height < 44px**. **[ASSUMED] `display: inline-flex; align-items: center; min-height: 44px`; the visual line and the 28px gap are unchanged (Q4)** |
| **Footer** | — | "Designed and built in Delhi" · "© 2026 Tanishk Saxena" | — | — | `<footer>` landmark |
| **FloatingNav — FAB** | bottom-right / bottom-centre; arc / centre wheel | 58×58 circle, bg ink, icon paper, `shadow-fab`; icon = active section's glyph (× when open); appears after the hero is scrolled past; sticky above the footer | — | bg paper, icon ink | `aria-label="Jump to section"`. **Add `aria-expanded`** (not in mockup). Escape and curtain tap close it. **[ASSUMED] Variant: bottom-right, arc (mockup defaults) (Q8). `aria-controls` → menu; opening moves focus to the active item; Tab/Shift+Tab cycle within items + FAB; Escape, curtain or item choice closes and returns focus to the FAB (Q26)** |
| **FloatingNav — item** | active / inactive | 44×44 circle, bg paper, icon ink, 1px `border-navdot`, `shadow-float`; label pill below (9px caps, pad `3px 7px`) | Global `a:hover` → accent; **[ASSUMED] border → accent** | bg accent, icon `#FDF8F0` | Link `aria-label` = section name. Active item: bg + border accent, icon/label `#FDF8F0` — add `aria-current` (not in mockup). **Closed items are opacity 0 but still focusable in the mockup. [ASSUMED] The menu container gets `inert` while closed (set after the close transition), and `inert` is removed before the open transition (Q26)** |
| **NavCurtain** | — | `scrim-nav` + blur | — | — | Click closes; `aria-hidden` |
| **BackToTop** | — | 42×42 circle, bg paper, 1px `border-quiet`, `shadow-float-top`, 16px above the FAB; hidden while the nav is open. **[ASSUMED] 44×44; `margin-left: -22px`; same 16px gap (Q4)** | [ASSUMED] border → accent | bg + border accent, icon `#FDF8F0` | `aria-label="Back to top"`. **[ASSUMED] Trigger: the mockup code's behaviour, shown together with the FAB once `scrollY > hero.offsetHeight − 140` (Q14)**. Hidden states are `inert` [ASSUMED] |
| **Article — BackLink** | — | 12px/.14em caps muted, arrow icon, gap 8 | colour accent | colour ink | Label "Writing". Target `/#post-[id]`. **[ASSUMED] `min-height: 44px` (inline-flex, centred), no visual change (Q4)** |
| **Article — Meta** | — | date · 3px dot · "N min read" · Listen button (`margin-left: auto`); bottom `border-article` | — | — | Dot decorative |
| **Article — ListenButton (TTS)** | idle ("Listen", speaker icon in accent) / speaking ("Stop", pause icon, filled accent) | h 40, px 16, gap 9, pill, 13px. **[ASSUMED] h 44 (the modal-button precedent) (Q4)** | [ASSUMED] border → accent | bg + border accent, text `#FDF8F0` | Behind the `textToSpeech` flag; uses `speechSynthesis`; cancels on unmount. Add `aria-pressed`. **[ASSUMED] Shipped on (the mockup default), and not rendered when `window.speechSynthesis` is unavailable (Q18)** |
| **Article — Body** | lead, p, h2, pull-quote | §2.2; column gap 26px; pull-quote `padding-left: clamp(18px,3vw,26px)`, `border-left: 2px accent`, margin `clamp(10px,2vh,18px) 0` | — | — | `<article>`; heading order h1 → h2 |
| **Article — Footer** | — | "Written by Tanishk Saxena" · "More writing" (13px accent) | — | "More writing" → ink | **[ASSUMED] "More writing": `min-height: 44px` (inline-flex, centred) (Q4)** |

Global rules ([P]/[A] `<style>`):
- `a { color: inherit; text-decoration: none }` and `a:hover { color: accent }`.
- `html { scroll-behavior: smooth }`.
- Scrollbars hidden (`scrollbar-width: none`, zero-size `::-webkit-scrollbar`). **[ASSUMED]
  Native scrollbars restored**, with `scrollbar-color: color-mix(in oklab, var(--ink),
  transparent 72%) transparent` (reusing the `border-navdot` mix) and `scrollbar-gutter:
  stable`. Hidden scrollbars remove the scroll-position cue and make the modal scroll-lock
  shift the layout (Q22).
- [DN]: every button and link has a hover state and a pressed state that inverts fill and
  text. Some mockup controls have no hover style ("Show more", nav items, back-to-top,
  modal buttons). Those gaps are recorded as-is in the table above. **[ASSUMED] They are
  filled per the "Missing hover states" rule at the top of §6.**

**Focus order (derived from DOM order in [P]):** Signature → Theme toggle → Hero CTAs →
Experience rows → Project cards (each: card, live, source) → "Show more" → Writing rows →
"Show more" → Email → Social links → [dock: nav items → Back-to-top → FAB]. Modal and
dock markup come **after** `<footer>`, so an open modal must trap focus, and the FAB is
the last tab stop on the page. **[ASSUMED] Keep the FAB last in DOM order (Q26).** The FAB
is a convenience duplicate of in-page scrolling; every section is already reachable in
reading order. Closed nav items are `inert`, so they add no tab stops.
Order per project card: trigger → live → source.

---

## 7. Page / section breakdown and content fields

Source: [P] markup + data constants `SECTIONS`, `ROLES`, `PROJECTS`, `POSTS`, `QUOTES`,
`skills` (lines 285–347, 773–778); [A] `ARTICLES`; [DN] "Routing".

Order: **Hero → About (band) → Experience → Projects → Writing → Skills → Quotes →
Contact (band) → Footer**, all on one page with anchors `#hero #about #experience
#projects #writing #skills #quotes #contact`. The FAB menu lists six: About, Experience,
Projects, Writing, Skills, Contact (not Hero or Quotes). Articles are the only separate
route: **`/articles/[id]`** ([DN], [H]).

| Section | Content fields (drive fixture types) | Mobile (390) | Desktop |
|---|---|---|---|
| **Header** | `name` (signature text) | §4.4 | Same |
| **Hero** | `eyebrow` ("Tanishk Saxena — SDE, Delhi"), `headline` + **one highlighted word** ("web"), `standfirst`, `resume_url`, contact CTA label + target (`#contact`) | Stacked, min 100svh | Same, larger clamps |
| **About** | `portrait_url` (+ alt), `about_lead` (one sentence), `about_paragraphs[]` (2 in mockup) | Portrait above text | Portrait beside text |
| **Experience** | per role: `role`, `company`, `years` (display string, e.g. "2023 — now"), `note` (**one paragraph**). Paging: none (3 shown) | Stacked meta | Inline meta |
| **Projects** | per project: `name`, `kind` ("Open source" / "Side project" / "Client work"), `year`, `note` (short), `about` (modal copy), `tags[]` (**modal shows first 3**), `live`, `repo`, image (placeholder). Paged by 3 | 1 column | 3 columns |
| **Writing** | per post: `id` (slug), `title`, `read` ("6 min"), `date` (list "Aug 2026" vs article "14 August 2026"; **[ASSUMED] one `published_at` ISO date, formatted `MMM yyyy` in the list and `d MMMM yyyy` on the article, both `en-GB` (Q27)**). Paged by 3 | Wrapped row | Single-line row |
| **Skills** | `groups[]`: `title` + `items[]` (4 groups × 4: Languages, Frontend, Backend, Practice) | 2 columns | 4 columns |
| **Quotes** | `quotes[]`: `text`, `who` (6 in mockup) | Same | Same |
| **Contact** | section label, `statement` ("Tell me what you are building."), `email`, `social_links[]`: `label`, `url` (GitHub, LinkedIn, Read.cv, X) | Wrapped socials | Same |
| **Footer** | `footer_left` ("Designed and built in Delhi"), `copyright` ("© 2026 Tanishk Saxena") | Wrap | `space-between` |
| **Article** (`/articles/[id]`) | `title`, `date`, `read`, body blocks (lead paragraph, paragraphs, h2, pull-quote), author line | `measure-article` | Same |

**Reconciliation with the brief's content model (§5).** The mockup wins on structure, but
the brief has to be updated before fixtures are written:
- `experience`: mockup has `note` (one paragraph), `years` as a string, and no
  `location`/`bullets[]`/`stack[]`. Brief has `bullets[]`, `stack[]`, `location`,
  `start_date`/`end_date`.
- `project`: mockup adds `kind`, `year`, `about`, image; brief has `summary` and `featured`
  (unused in the mockup) and a nullable `live_url` (the mockup has no no-live-URL state).
- `skill`: mockup uses titled groups of plain names; brief has
  `tier`/`brand_color`/`icon_slug`.
- `education`: in the brief, **absent from the mockup**.
- `quote`: in the mockup, **absent from the brief**.
- `profile`: mockup adds `eyebrow`, highlighted headline word, `about_lead`,
  `about_paragraphs[]`, contact `statement`, and footer lines.
- `blog_post`: brief's `/blog/[slug]` with nullable `body`/`external_url` vs mockup's
  `/articles/[id]` with an on-site body.

**[ASSUMED] Resolved content model (Q17, Q18, Q28, Q32).** The mockup wins wherever it
speaks. Every entity has `id`, and `sort_order` where the user controls order. The brief's
§5 must be updated to match in Phase 2.

| Entity | Fields |
|---|---|
| `profile` | `name`, `eyebrow`, `headline`, `headline_highlight` (one word that must appear in `headline`), `standfirst`, `about_lead`, `about_paragraphs[]`, `portrait` (image, nullable), `resume_url`, `email`, `contact_statement`, `location`, `footer_note` |
| `experience` | `role`, `org`, `start_date`, `end_date` (null = current → rendered "now"), `summary` (one paragraph). Display: `yyyy — yyyy` / `yyyy — now`, using the mockup's spaced em dash. **Brief's `location`, `bullets[]`, `stack[]` dropped** |
| `project` | `title`, `kind` (`open-source` \| `side-project` \| `client-work`; labels as in the mockup), `year`, `summary` (card/fallback), `description` (modal), `tags[]` (modal shows the first 3), `image` (nullable), `repo_url`, `live_url` (nullable → live icon and Live button not rendered), `sort_order`. **Brief's `featured` dropped** (the mockup orders by list and pages by 3) |
| `skill_group` | `title`, `items[]` (plain strings), `sort_order`. **Brief's `tier`, `brand_color`, `icon_slug` dropped** |
| `quote` | `text`, `author`, `sort_order` (**new**) |
| `article` | `slug`, `title`, `published_at`, `read_minutes`, `body` (Markdown: paragraphs, `##`, `>` pull-quote, code; the first paragraph renders as the lead). Route **`/articles/[slug]`** (the mockup's route segment, keyed by slug). **Brief's `external_url` / nullable body dropped** |
| `social_link` | `label`, `url`, `sort_order` (unchanged) |
| `education` | **Dropped**: not in the mockup |
| `image` (value type) | `src`, `alt`, `width`, `height`. Project images: one source per project at ≥ 1600×1200 (4:3), rendered with `object-fit: cover` into the card (4:3), the narrow modal (16:9) and the wide-modal pane (392×420), plus an optional `focal_point` for `object-position` |

Missing optional media falls back to the mockup's placeholder treatment (bg `surface`,
11px/.14em caps label), which becomes the designed empty state. All copy in the mockup is
placeholder; Phase 2 fixtures carry the real career content from the brief.

---

## 8. Tailwind v4 mapping (spec only — no CSS files yet)

Installed: `tailwindcss@4.3.3`. Tailwind v4 reads design tokens from `@theme`; container
query variants use the `--container-*` namespace (`@<name>:` → `@container (width >= value)`).

The runtime-switched colours are raw custom properties on `:root` and `[data-theme="dark"]`
(both live in `styles/tokens.css` per the brief). `@theme inline` then maps them to utilities.
Values below are the **ship values** (mockup value in a comment where an assumption overrides it).

```css
/* styles/tokens.css — raw tokens (switch per mode) */
:root {
  --paper: #F5F0E7;  --paper2: #EDE6DA;  --paper-fade: rgba(245,240,231,.8);
  --ink:   #23201C;
  --muted: #6D655C;                   /* [ASSUMED] mockup #7A7268 — Q1 */
  --accent-base: #A9491F;             /* [ASSUMED] mockup #B4532A; terracotta chosen over #2F5D72 — Q1, Q8 */
  --accent: var(--accent-base);       /* text, lines, rings */
  --accent-fill: var(--accent-base);  /* [ASSUMED] filled surfaces, both modes — Q2 */
  --on-accent: #FDF8F0;
  --scrim-nav:   rgba(245,240,231,.55);
  --scrim-modal: rgba(232,224,210,.62);
  --shadow-rgb: 40 32 22;             /* light tint; alphas per shadow in @theme */
  --shadow-a-card: .2;  --shadow-a-modal: .28;  --shadow-a-fab: .26;
  --shadow-a-float: .16;  --shadow-a-float-top: .16;
  --grain-blend: multiply;
  --grain-opacity: .06;               /* [ASSUMED] Q5 */
  /* motion durations for transform-based moves; zeroed under reduced motion */
  --dur-move-scale: 1;
  color-scheme: light;
}
[data-theme="dark"] {
  --paper: #191714;  --paper2: #221F1A;  --paper-fade: rgba(25,23,20,.8);
  --ink:   #EDE7DB;  --muted:  #938A7D;
  --accent: color-mix(in oklab, var(--accent-base), white 24%);  /* [ASSUMED] mockup: white 16% — Q2 */
  --scrim-nav:   rgba(25,23,20,.55);
  --scrim-modal: rgba(18,16,14,.62);
  --shadow-rgb: 0 0 0;
  --shadow-a-card: .5;  --shadow-a-modal: .6;  --shadow-a-fab: .5;
  --shadow-a-float: .42;  --shadow-a-float-top: .4;
  --grain-blend: screen;
  color-scheme: dark;
}
.band { /* About + Contact; background: var(--accent-fill) */
  --ink: #FDF8F0;
  --muted: rgba(253,248,240,.89);     /* [ASSUMED] mockup .88 — Q2 */
  --paper2: rgba(253,248,240,.09);    /* [ASSUMED] mockup .13 — Q2 */
  --accent: #FDF8F0;
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }  /* [ASSUMED] Q3 */

@media (prefers-reduced-motion: reduce) {  /* [ASSUMED] Q12 — see §5.3 */
  :root { --dur-move-scale: 0; }
  html { scroll-behavior: auto; }
  /* every transform transition is written as calc(<mockup duration> * var(--dur-move-scale));
     opacity/colour transitions are written with plain durations and stay unchanged.
     Keyframe animations `rise`, `wheel`, `charIn`, `sigdraw` → animation: none. */
}
```

```css
/* app/globals.css — Tailwind theme */
@theme inline {
  /* colour */
  --color-bg: var(--paper);
  --color-surface: var(--paper2);
  --color-bg-translucent: var(--paper-fade);
  --color-text: var(--ink);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-fill: var(--accent-fill);   /* [ASSUMED] Q2 */
  --color-on-accent: var(--on-accent);
  --color-border-header:  color-mix(in oklab, var(--accent), transparent 62%);
  --color-border-section: color-mix(in oklab, var(--accent), transparent 52%);
  --color-border-row:     color-mix(in oklab, var(--accent), transparent 68%);
  --color-border-control: color-mix(in oklab, var(--accent), transparent 55%);
  --color-border-article: color-mix(in oklab, var(--accent), transparent 60%);
  --color-border-listen:  color-mix(in oklab, var(--accent), transparent 58%);
  --color-border-card:    color-mix(in oklab, var(--ink), transparent 86%);
  --color-border-divider: color-mix(in oklab, var(--ink), transparent 88%);
  --color-border-close:   color-mix(in oklab, var(--ink), transparent 82%);
  --color-border-quiet:   color-mix(in oklab, var(--ink), transparent 78%);
  --color-border-navdot:  color-mix(in oklab, var(--ink), transparent 72%);
  --color-press-row:      color-mix(in oklab, var(--accent), transparent 88%);
  --color-press-writing:  color-mix(in oklab, var(--accent), transparent 86%);
  --color-card-icon-bg:   rgba(253,248,240,.92);
  --color-card-kind:      rgba(253,248,240,.9);   /* [ASSUMED] mockup .78 — Q15 */
  --color-scrim-nav: var(--scrim-nav);
  --color-scrim-modal: var(--scrim-modal);

  /* fonts (next/font variables) */
  --font-serif:  var(--font-newsreader), Georgia, serif;
  --font-sans:   var(--font-plex-sans), system-ui, sans-serif;
  --font-script: var(--font-caveat), cursive;
  --font-mono:   var(--font-plex-mono), monospace;   /* [ASSUMED] Q19, article route only */

  /* type (fluid values verbatim from §2.2) */
  --text-display: clamp(40px, 7.4vw, 92px);  --text-display--line-height: 1.05;  --text-display--letter-spacing: -.02em;
  --text-h1:      clamp(34px, 6vw, 58px);    --text-h1--line-height: 1.1;        --text-h1--letter-spacing: -.015em;
  --text-statement: clamp(32px, 5.4vw, 64px); --text-statement--line-height: 1.1; --text-statement--letter-spacing: -.015em;
  --text-lead:    clamp(23px, 3vw, 34px);    --text-lead--line-height: 1.35;
  --text-lead-article: clamp(20px, 2.6vw, 25px); --text-lead-article--line-height: 1.55;
  --text-quote:   clamp(22px, 3.2vw, 34px);  --text-quote--line-height: 1.45;
  --text-quote-mark: clamp(54px, 8vw, 86px); --text-quote-mark--line-height: .6;
  --text-h2:      clamp(21px, 2.5vw, 28px);  --text-h2--line-height: 1;
  --text-h2-article: clamp(24px, 3.4vw, 32px); --text-h2-article--line-height: 1.25;
  --text-pullquote: clamp(20px, 2.6vw, 26px); --text-pullquote--line-height: 1.5;
  --text-h3-role: clamp(21px, 2.4vw, 27px);  --text-h3-role--line-height: 1.2;
  --text-h3-post: clamp(20px, 2.3vw, 26px);  --text-h3-post--line-height: 1.25;
  --text-email:   clamp(22px, 3vw, 32px);
  --text-signature-intro: clamp(54px, 12.5vw, 104px); --text-signature-intro--line-height: .95;
  --text-signature: 31px;  --text-signature--line-height: .95;
  --text-body-lg: clamp(16px, 1.5vw, 18px);  --text-body-lg--line-height: 1.75;
  --text-body-article: 17px;                 --text-body-article--line-height: 1.85;
  --text-body:    16px;                      --text-body--line-height: 1.8;
  --text-body-sm: 15px;                      --text-body-sm--line-height: 1.75;
  --text-list-serif: 19px;                   --text-list-serif--line-height: 1.3;
  --text-meta: 14px;  --text-small: 13px;  --text-label: 12px;  --text-micro: 11px;
  --text-cue: 10px;   --text-nav: 9px;
  --tracking-eyebrow: .16em;  --tracking-label: .14em;  --tracking-button: .13em;
  --tracking-cue: .18em;      --tracking-nav: .07em;    --tracking-years: .06em;  --tracking-tag: .02em;
  --tracking-display: -.02em; --tracking-heading: -.015em;

  /* spacing — Tailwind default base kept: --spacing: 0.25rem (4px); literals are n × base [ASSUMED] Q24 */
  --spacing-header: 76px;
  --spacing-anchor-row: 104px;                                  /* [ASSUMED] Q29 */
  --spacing-section: clamp(72px, 11vh, 132px);
  --spacing-band: clamp(76px, 12vh, 140px);
  --spacing-band-end: clamp(72px, 10vh, 110px);
  --spacing-grid-projects: clamp(16px, 2.4vw, 26px);
  --spacing-grid-about: clamp(30px, 5vw, 72px);
  --spacing-grid-skills-row: clamp(30px, 5vw, 40px);
  --spacing-grid-skills-col: clamp(22px, 4vw, 48px);
  --spacing-more: clamp(26px, 4vw, 38px);
  --spacing-float-offset: clamp(16px, 3.4vw, 34px);
  --spacing-stage: clamp(14px, 3vw, 40px);
  --spacing-gutters: clamp(28px, 5.2vw, 44px);                  /* total, both sides */
  --spacing-article-top: clamp(108px, 15vh, 150px);
  --spacing-article-bottom: clamp(70px, 10vh, 110px);
  --spacing-article-back: clamp(30px, 5vh, 48px);
  --spacing-article-meta-top: clamp(22px, 3vh, 30px);
  --spacing-article-meta-bottom: clamp(26px, 4vh, 36px);
  --spacing-article-body-top: clamp(30px, 5vh, 46px);
  --spacing-article-footer-top: clamp(52px, 8vh, 84px);
  --spacing-article-h2-top: clamp(16px, 3vh, 26px);
  --spacing-pullquote-inline: clamp(18px, 3vw, 26px);
  --spacing-pullquote-block: clamp(10px, 2vh, 18px);
  --spacing-target: 44px;                                        /* [ASSUMED] Q4 minimum hit area */

  /* radii */
  --radius-xs: 2px;  --radius-sm: 3px;  --radius-row: 6px;  --radius-card: 10px;
  --radius-modal: 14px;  --radius-pill: 999px;

  /* shadows — tint and alpha switch per mode via raw vars */
  --shadow-card-hover: 0 20px 44px rgb(var(--shadow-rgb) / var(--shadow-a-card));
  --shadow-modal:      0 40px 90px rgb(var(--shadow-rgb) / var(--shadow-a-modal));
  --shadow-fab:        0 12px 30px rgb(var(--shadow-rgb) / var(--shadow-a-fab));
  --shadow-float:      0 8px 22px rgb(var(--shadow-rgb) / var(--shadow-a-float));
  --shadow-float-top:  0 8px 22px rgb(var(--shadow-rgb) / var(--shadow-a-float-top));

  /* layout */
  --container-wide: 760px;          /* @wide: → @container (width >= 760px) — the single breakpoint */
  --width-page: 1140px;
  --width-article: 760px;

  /* motion */
  --ease-out-soft:   cubic-bezier(.2,.85,.25,1);
  --ease-char:       cubic-bezier(.3,.7,.3,1);
  --ease-flip:       cubic-bezier(.62,.02,.2,1);
  --ease-dial:       cubic-bezier(.6,0,.2,1);
  --ease-expand:     cubic-bezier(.32,.72,.3,1);
  --ease-spiral-out: cubic-bezier(.16,.9,.24,1);
  --ease-spiral-in:  cubic-bezier(.4,.05,.25,1);
  --ease-cue:        cubic-bezier(.4,0,.3,1);
  --animate-rise: rise .85s var(--ease-out-soft) both;       /* [ASSUMED] replaces fadeUp — Q9 */
  --animate-cue: wheel 1.9s var(--ease-cue) infinite;

  @keyframes rise { from { transform: translateY(14px); } to { transform: none; } }
  @keyframes wheel {
    0%   { transform: translateY(0);    opacity: 0; }
    18%  { opacity: 1; }
    68%  { transform: translateY(15px); opacity: 0; }
    100% { transform: translateY(15px); opacity: 0; }
  }
}
```

Notes:
- Shadows switch tint **and** alpha per mode through the raw `--shadow-*` vars, so a
  single utility (`shadow-fab`) is correct in both modes.
- **[ASSUMED] Theme selection (Q7):** `data-theme="light" | "dark"` on `<html>`. The initial
  value is resolved **before first paint** by a tiny inline `<head>` script: the stored
  `localStorage['theme']` if present, else `prefers-color-scheme`. The toggle writes
  `localStorage` and flips the attribute. With no JS, `:root` stays light, which matches
  the mockup default.

---

## 9. Assumed Decisions

Every inline `[ASSUMED]` tag maps to one of these rows. Items marked (D7) were open
questions in [D] §7.

**Revision 2 (owner direction, brief §0.1): the mockup wins every contradiction; perf
rules are applied by intent.** Rows marked **R2** were re-decided on that basis and
override any conflicting inline text above.

| Item | Chosen value | Reasoning (one line) | Confidence |
|---|---|---|---|
| Q1 Light-mode contrast | `text-muted` `#6D655C`, `accent-base` `#A9491F` (lightness-only OKLab shifts) | Smallest change reaching ≥4.6:1 on paper2 while keeping hue/chroma; every small-text use now passes AA | med |
| Q2 Dark-mode bands and fills | Dark `accent` = `mix(accent-base, white 24%)` → `#C17558`; new `accent-fill` = base accent in both modes; band muted `.89`, band paper2 `.09`, portrait label uses band ink | Keeps [DN]'s "derived, never hand-picked" rule, and cream-on-fill stays 5.43:1 in both modes | med |
| Q3 Focus-visible | `2px solid var(--accent)`, offset `2px`; inset `-2px` on rows; card ring via `:has()` | Accent already signals hover everywhere; ring becomes cream automatically inside bands; ≥4.6:1 on every ground | high |
| Q4 Touch targets **R2** | **Visual sizes stay as in the mockup** (38 / 42 / 40px); each hit area is extended invisibly to 44×44 with a centred `::before` (`inset: min(0px, (100% - 44px) / 2)`). Text links: `min-height: 44px`, inline-flex, no visual change | Meets the 44px floor while the mockup look wins | high |
| Q5 Grain | `.06`, fixed, both routes | [P] props, [D] and [H] all state 6% | high |
| Q6 Theme toggle | 46×46 on both routes | Main page is the primary reference, and 46 matches the "Show more" height | med |
| Q7 Initial colour mode | System preference, persisted in `localStorage`, set pre-paint on `<html data-theme>` | Conventional; avoids a flash of the wrong theme; no-JS falls back to the mockup's light default | med |
| Q8 Tweakables (D7) | Terracotta · bottom-right · arc · tilt −4deg · intro on · TTS on | All are the mockup defaults; slate would also fail dark-mode AA | high |
| Q9 Intro vs LCP **R2** | Intro plays exactly as mocked. Hero eyebrow, standfirst and CTAs use the mockup `fadeUp` (opacity + rise). **Only the H1** (the LCP element) uses transform-only `rise`, painted from frame one under the overlay; the overlay's own fade reveals it, so it reads the same as the mockup | Mockup look kept; the one element LCP measures is never at opacity 0 | med |
| Q10 Intro blocking | Overlay `pointer-events: none`; any input skips to hand-off; skipped under reduced motion | The intro must never hold the page hostage; [DN] already skips it on internal navigation | med |
| Q11 Non-transform motion **R2** | **Experience height animates as mocked** (`grid-template-rows: 0fr → 1fr`, `.5s ease-expand`, + opacity `.38s`); **card image blur restored**, on hover-capable devices only (`@media (hover: hover)`); writing-row shift via `translateX(16px)` (visually identical to the padding change); card shadow via `::after` opacity (identical look); curtain blur static + opacity fade (identical look); dot `scaleX` | Mockup fidelity first; one-element, user-initiated effects are cheap; swaps are made only where they look identical | high |
| Q12 Reduced motion (all cases) | All transform motion instant via `--dur-move-scale: 0`; opacity/colour kept; loops and auto-advance off; `scroll-behavior: auto` | Direct generalisation of [DN]'s rule, set at the token layer | high |
| Q13 Quote rotator (D7) | Keep; render the dots (44×44 targets, inactive = `text-muted`), add pause/play, pause on hover/focus, no auto-advance under reduced motion; carousel ARIA | Satisfies WCAG 2.2.2 using controls the mockup already coded | med |
| Q14 Back-to-top trigger | Appears with the FAB at `scrollY > hero.offsetHeight − 140` | Mockup code is the implemented behaviour; [DN] says its numbers are indicative | med |
| Q15 Project card | `<article>` + stretched trigger `<button>` + sibling icon links; overlay on narrow / `(hover: none)` / hover / focus-within; name 2-line clamp; veil `.82 → .62@50% → .06`; kind `.9` alpha | Removes nested interactives, gives native keys, and keeps captions ≥4.5:1 even over a white screenshot | med |
| Q16 Modal | Native `<dialog>` + `showModal()`, `aria-labelledby`, focus return; keep `overflow-y: auto` fallback; 3 tags | Native dialog gives the trap, Escape and inert background [H] asks for; scroll fallback honours the brief's content-robustness rule | med |
| Q17 Content model | Per §7 table: experience summary + dates; project kind/year/summary/description/image, nullable live; skill groups; quotes added; education dropped | Mockup wins on structure per the brief's own precedence rule | med |
| Q18 Article route / TTS (D7) **R2** | `/articles/[slug]` with an on-site Markdown body; `body` nullable → the row links to `external_url` (the brief's pattern, visually identical in the list); TTS on, hidden without `speechSynthesis` | Mockup route and default, plus the brief's flexibility at no visual cost | med |
| Q19 Mono | IBM Plex Mono 400, `.88em`, `surface` bg, 3px radius; article route only | Only mono style anywhere in the mockup set ([DN] `code`) | med |
| Q20 Font weights | Newsreader 300/400/italic 300 (opsz auto), Plex Sans 400/500, Caveat 600 | Ship only what the mockup uses | high |
| Q21 Fallback metrics | `next/font/google` default `adjustFontFallback: true`, `display: 'swap'`, `subsets: ['latin']` | Next 16 docs: this generates the size-adjust fallback automatically | high |
| Q22 Scrollbars **R2** | Hidden, as mocked (`scrollbar-width: none` + zero-size `::-webkit-scrollbar`) | Mockup wins; not a WCAG failure; also means the `page` container = viewport width | high |
| Q23 Signature label | `aria-label="Tanishk Saxena — back to top"` / `"— back to portfolio"` | Satisfies WCAG 2.5.3 label-in-name | high |
| Q24 Spacing | Keep literals, expressed on Tailwind's 0.25rem base; fluid clamps as named `--spacing-*` tokens | No mockup value moves, and nothing in markup is a magic number | med |
| Q25 vw/vh vs cqi | Keep `clamp()` in vw/vh; container queries handle all layout switching | Clamps are viewport-tuned type/rhythm; converting would change rendered values | med |
| Q26 Floating nav a11y (D7) | Menu `inert` when closed; FAB `aria-expanded`/`aria-controls`; focus to active item on open, cycle within, return on close; FAB stays last in DOM | Standard disclosure-menu pattern; FAB duplicates in-page navigation, so its tab position is harmless | med |
| Q27 Dates | `published_at` ISO; list `MMM yyyy`, article `d MMMM yyyy`, `en-GB` | Both formats appear verbatim in the mockup | high |
| Q28 Project images | One ≥1600×1200 4:3 source, `object-fit: cover` into all three crops, optional focal point | Least content burden that still serves card, narrow modal and wide modal | med |
| Q29 Scroll offsets | 76px on section anchors; 104px on row deep links; landing via `scrollIntoView` | Aligns CSS with the mockup's JS landing value; the 120px margin was never used | med |
| Q30 Handwriting twice (D7) | Keep Caveat for signature + hero word | [D] chose variant C deliberately ("always means the same thing") | med |
| Q31 Experience as modal (D7) | No, keep the accordion | [D] §4 rationale: a job has no artefacts to show | high |
| Q32 Placeholders | Mockup placeholder treatment becomes the designed empty state; real copy arrives in Phase 2 fixtures | Content is out of scope for the design spec | high |
| Missing hover states | Outline controls: border → accent; filled: `opacity .92`; card icons: bg `#FDF8F0` | [DN] requires hover on every control; reuses the mockup's two hover patterns | high |
| Disabled state | `opacity .45; cursor: not-allowed`; no hover/pressed | Nothing in the design disables; conventional fallback if ever needed | med |
