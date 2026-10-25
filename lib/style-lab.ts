/*
 * [EXPERIMENT] The style lab (owner, 2026-10-20): a temporary switch in the header to try the
 * candidate palettes (styles/tokens.css, `data-palette`) and hero backgrounds
 * (components/sections/hero-backdrop/, `data-backdrop`) together. The choice is kept in this
 * browser (localStorage) and set before first paint (lib/theme.ts), or taken from
 * `?palette=` / `?backdrop=`. Only while Settings → Style lab is on (`data-style-lab` on
 * <html>, owner 2026-10-26): off, the button is hidden and nothing applies, so visitors see the
 * site as shipped. Removed once the owner picks.
 */

export const LAB_KEYS = { palette: 'lab-palette', backdrop: 'lab-backdrop' } as const;

export const PALETTES = [
  ['', 'As shipped'],
  ['riso', 'Riso'],
  ['cyanotype', 'Cyanotype'],
  ['library', 'Library'],
  ['lilac', 'Olive & lilac'],
  ['nordic', 'Nordic'],
  ['phosphor', 'Phosphor'],
  ['eames', 'Eames'],
  ['ultramarine', 'Ultramarine'],
  ['forest', 'Forest'],
  ['plum', 'Plum'],
  ['citrus', 'Citrus'],
] as const;

export const BACKDROPS = [
  ['', 'None (glow only)'],
  ['ascii', 'ASCII torus'],
  ['life', 'Game of Life'],
  ['beams', 'Grid beams'],
  ['truchet', 'Truchet tiles'],
  ['mesh', 'Gradient mesh'],
  ['aurora', 'Aurora'],
  ['constellation', 'Constellation'],
  ['halftone', 'Halftone wave'],
  ['flow', 'Flow field'],
  ['contours', 'Topographic'],
] as const;

export type Backdrop = (typeof BACKDROPS)[number][0];

/** Sets both choices on <html> before first paint, with the lab on: the URL, else what was picked here. */
export const labInitSnippet = `try{var de=document.documentElement;if(de.getAttribute('data-style-lab')==='on'){var q=new URLSearchParams(location.search),ls=localStorage;var lp=q.get('palette')||ls.getItem('${LAB_KEYS.palette}');if(lp)de.setAttribute('data-palette',lp);var lb=q.get('backdrop')||ls.getItem('${LAB_KEYS.backdrop}');if(lb)de.setAttribute('data-backdrop',lb)}}catch(e){}`;
