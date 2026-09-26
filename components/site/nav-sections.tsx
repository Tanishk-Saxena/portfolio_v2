/** Floating-nav destinations with their icon paths, verbatim from the mockup (SECTIONS). */
export interface NavSection {
  id: string;
  label: string;
  icon: string;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'about',
    label: 'About',
    icon: 'M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2M4.9 19.4c.7-3.3 3.5-5.1 7.1-5.1s6.4 1.8 7.1 5.1',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: 'M4 8.6h16v10.2H4zM9 8.6V6.3c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v2.3M4 12.8h16',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'M5 5.2h5.6v5.6H5zM13.4 5.2H19v5.6h-5.6zM5 13.4h5.6V19H5zM13.4 13.4H19V19h-5.6z',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: 'M5 19.2h14M6.6 15.4 15.7 6.3a1.7 1.7 0 0 1 2.4 2.4L9 17.8l-3.3.8z',
  },
  { id: 'skills', label: 'Skills', icon: 'M12 4.6 20 9.1l-8 4.5-8-4.5zM4 14.1l8 4.5 8-4.5' },
  { id: 'contact', label: 'Contact', icon: 'M4.2 6.6h15.6v10.8H4.2zM4.8 7.2 12 12.6l7.2-5.4' },
];

export const CLOSE_ICON = 'M6.6 6.6 17.4 17.4M17.4 6.6 6.6 17.4';

export function SectionGlyph({ d, size = 19 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
