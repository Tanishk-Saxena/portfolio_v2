import type { Project, ProjectKind } from '@/lib/domain/types';

// PLACEHOLDER — the mockup's seven projects, verbatim (Portfolio.dc.html PROJECTS).
// Images are null (the "No preview to show" frame); links point at example.com.

type Row = [
  id: string,
  title: string,
  kind: ProjectKind,
  year: number,
  description: string,
  tags: string[],
];

const ROWS: Row[] = [
  [
    'marginalia',
    'Marginalia',
    'open-source',
    2025,
    'Readers highlight a passage and leave a note in the margin; maintainers see every note as a queue. A 9kb script with no framework dependency, now running on a few hundred documentation sites.',
    ['TypeScript', 'Web Components', 'Postgres'],
  ],
  [
    'slowtype',
    'Slowtype',
    'side-project',
    2024,
    'A writing app that shows only the paragraph you are working on and dims the rest. Local-first, no account, clean Markdown out. A weekend experiment in removing features that I still draft in daily.',
    ['React', 'IndexedDB', 'Rust'],
  ],
  [
    'tidepool',
    'Tidepool',
    'client-work',
    2023,
    'A realtime dashboard for a coastal research group tracking buoy telemetry. Built for direct sun on a moving boat: high contrast, touch-first, and still useful on an intermittent connection.',
    ['Svelte', 'Go', 'TimescaleDB'],
  ],
  [
    'halfstep',
    'Halfstep',
    'side-project',
    2023,
    'A metronome that listens and follows your tempo instead of forcing one on you. Onset detection runs in a worklet so the click never drifts, and it works offline on a phone in a practice room.',
    ['Web Audio', 'Rust', 'WASM'],
  ],
  [
    'paperweight',
    'Paperweight',
    'open-source',
    2022,
    'A static site generator that emits one self-contained HTML file: styles, fonts and images inlined. Built for documentation that has to survive being emailed around as an attachment.',
    ['Node', 'Markdown', 'Esbuild'],
  ],
  [
    'northbound',
    'Northbound',
    'client-work',
    2022,
    'Route planning rebuilt around how dispatchers actually work: keyboard first, every action undoable, and a map that stays responsive with four thousand stops on screen.',
    ['React', 'Python', 'PostGIS'],
  ],
  [
    'fieldnote',
    'Fieldnote',
    'open-source',
    2021,
    'An offline-first notebook for survey teams working without signal. Conflict resolution happens on the device, so two people editing the same record in the field merge cleanly when they reconnect.',
    ['CRDT', 'Svelte', 'SQLite'],
  ],
];

export const projects: Project[] = ROWS.map(([id, title, kind, year, description, tags], i) => ({
  id,
  title,
  kind,
  year,
  description,
  tags,
  image: null,
  repoUrl: `https://example.com/source/${id}`,
  liveUrl: `https://example.com/${id}`,
  published: true,
  sortOrder: i + 1,
}));
