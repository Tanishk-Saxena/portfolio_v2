# Handoff — Tanishk Saxena portfolio

## What is here

| File | What it is |
| --- | --- |
| `Portfolio.dc.html` | The main page, all sections, fully interactive |
| `Article.dc.html` | The article route; read the id from `?id=` |
| `Dev notes.dc.html` | Behaviour spec — read this before writing code |
| `Mobile preview.dc.html` | The page in a 390x844 frame with option controls |
| `DESIGN.md` | Why the design is the way it is |

The mockups are single-file HTML with inline styles. They are a specification of
behaviour and visual detail, not a codebase to port: rebuild in whatever stack you
prefer and treat these as the reference.

## Target

- Single-page scroll for everything except articles, which live at `/articles/[id]`.
- Mobile-first; the only hard breakpoint is 760px (`narrow`), which switches the
  experience rows to stacked, the project modal to a vertical layout, and shrinks the
  nav arc radius. Everything else is fluid.
- No build-time content: all copy, images and links in the mockup are placeholders.

## Design tokens

Light: paper #F5F0E7, paper2 #EDE6DA, ink #23201C, muted #7A7268, accent #B4532A.
Dark: paper #191714, paper2 #221F1A, ink #EDE7DB, muted #938A7D, accent = light accent
mixed with 16% white.

Type: Newsreader (300/400) for display and article body, IBM Plex Sans (400/500) for
UI, Caveat (600) for the signature and the hero's highlighted word.

Grain: fixed fractal-noise SVG over the page, `mix-blend-mode: multiply` in light,
`screen` in dark, 6% opacity.

Measure 1140px (760px for articles), section padding `clamp(72px, 11vh, 132px)`,
hairline rules at `color-mix(in oklab, accent, transparent 52%)`.

## Implementation checklist

- [ ] Signature intro: letter-by-letter reveal by opacity and rise; measure both the
      large mark and the navbar slot after `document.fonts.ready`; animate the
      transform between the measured rects; swap in one frame at the end.
- [ ] Session flag so the intro is skipped when navigating between page and article,
      but plays on any real load.
- [ ] Floating nav: appears past the hero, sticky, parks above the footer separator.
      Arc geometry is a constant radius around the button (334px desktop, 250px
      mobile) with labels below each icon.
- [ ] Back-to-top shares the same appearance trigger and sits above the nav button.
- [ ] Project modal: FLIP-style scale from the clicked card, fixed 880x420 (desktop) /
      600px tall (mobile), body pinned at its offset while open, restored with smooth
      scrolling disabled.
- [ ] Lists page in threes; `#post-[id]` deep links expand the list before scrolling.
- [ ] Experience rows animate to measured height.
- [ ] Every button and link: hover state plus a pressed state that inverts fill/text.
- [ ] Respect `prefers-reduced-motion`: drop the intro, spiral and card scale.
- [ ] Hover-only affordances must be visible by default on touch.

## Accessibility

44px minimum hit targets (already the case in the mockup), `aria-expanded` on the
experience rows, `aria-label` on every icon-only control, Escape closes both the menu
and the modal, focus should be trapped in the open modal and returned to the card on
close (not implemented in the mockup — please add).

## Content still needed

Résumé PDF, portrait, project screenshots, live and repository URLs, real role
history and project write-ups, article bodies, social links, contact address.
