import type { ReactNode } from 'react';

const COLORS = [
  ['paper', 'bg-paper'],
  ['surface', 'bg-surface'],
  ['ink', 'bg-ink'],
  ['muted', 'bg-muted'],
  ['accent', 'bg-accent'],
  ['accent-fill', 'bg-accent-fill'],
  ['on-accent', 'bg-on-accent'],
  ['border-section', 'bg-border-section'],
  ['border-row', 'bg-border-row'],
  ['border-control', 'bg-border-control'],
  ['border-card', 'bg-border-card'],
  ['border-navdot', 'bg-border-navdot'],
] as const;

const TYPE = [
  ['display', 'font-serif font-light text-display', 'Quiet, careful'],
  ['h1', 'font-serif font-light text-h1', 'The second render'],
  ['statement', 'font-serif font-light text-statement', 'Tell me what'],
  ['lead', 'font-serif font-light text-lead', 'The unglamorous parts.'],
  ['quote', 'font-serif font-light text-quote', 'Simplicity is prerequisite.'],
  ['h2', 'font-serif text-h2 text-accent', 'Experience'],
  ['h3-role', 'font-serif text-h3-role', 'Frontend Engineer'],
  ['h3-post', 'font-serif text-h3-post', 'Notes on error copy'],
  ['list-serif', 'font-serif font-light text-list-serif', 'TypeScript'],
  ['body-lg', 'text-body-lg text-muted', 'Interfaces people can actually use.'],
  ['body', 'text-body text-muted', 'Body copy at sixteen pixels.'],
  ['body-sm', 'text-body-sm text-muted', 'Experience note copy.'],
  ['small', 'text-small tracking-years text-accent tabular-nums', '2024 — now'],
  ['label', 'text-label tracking-eyebrow uppercase text-muted', 'Eyebrow label'],
  ['micro', 'text-micro tracking-label uppercase text-muted', 'No preview to show'],
  ['signature', 'font-script font-semibold text-signature', 'Tanishk Saxena'],
] as const;

const RADII = ['rounded-xs', 'rounded-sm', 'rounded-row', 'rounded-card', 'rounded-modal'] as const;
const SHADOWS = ['shadow-float', 'shadow-fab', 'shadow-card-hover', 'shadow-modal'] as const;
const EASES = [
  'ease-out-soft',
  'ease-char',
  'ease-flip',
  'ease-dial',
  'ease-expand',
  'ease-spiral-out',
  'ease-spiral-in',
  'ease-cue',
] as const;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border-section py-8">
      <h2 className="mb-6 font-serif text-h2 text-accent">{title}</h2>
      {children}
    </section>
  );
}

export function TokenPanel({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <div data-theme={mode} className="relative bg-paper px-6 py-10 text-ink">
      <p className="mb-2 text-label tracking-eyebrow text-muted uppercase">Mode</p>
      <p className="mb-8 font-serif text-h1 font-light">{mode}</p>

      <Group title="Colour">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {COLORS.map(([name, cls]) => (
            <li key={name} className="text-micro text-muted">
              <span className={`mb-1.5 block h-12 rounded-sm border border-border-card ${cls}`} />
              {name}
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Band">
        <div className="band rounded-sm bg-accent-fill p-6 text-ink">
          <p className="font-serif text-h2">About</p>
          <p className="mt-3 text-body text-muted">Band muted copy on the accent fill.</p>
          <a href="#" className="mt-3 inline-block font-serif text-email">
            hello@example.com
          </a>
        </div>
      </Group>

      <Group title="Type">
        <ul className="flex flex-col gap-4">
          {TYPE.map(([name, cls, sample]) => (
            <li key={name}>
              <span className="text-micro text-muted">{name}</span>
              <p className={cls}>{sample}</p>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Radii & shadows">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r} className={`size-16 border border-border-card bg-surface ${r}`} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <div key={s} className={`grid size-20 place-items-center rounded-card bg-paper ${s}`}>
              <span className="text-nav text-muted">{s.replace('shadow-', '')}</span>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Easing (hover the row)">
        <ul className="flex flex-col gap-2">
          {EASES.map((e) => (
            <li key={e} className="group flex items-center gap-3 text-micro text-muted">
              <span className="w-24 shrink-0">{e}</span>
              <span className="@container relative h-1 flex-1 rounded-pill bg-surface">
                <span
                  className={`absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-accent transition-transform duration-[calc(900ms*var(--motion))] group-hover:translate-x-[calc(100cqi-12px)] ${e}`}
                />
              </span>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Focus">
        <div className="flex gap-3">
          <button className="h-11 rounded-pill border border-border-control px-6">Tab to me</button>
          <button className="h-11 rounded-pill bg-accent-fill px-6 text-on-accent">And me</button>
        </div>
      </Group>
    </div>
  );
}
