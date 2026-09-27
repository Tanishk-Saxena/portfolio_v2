export const ACCENTS = { 'Terracotta': '#B4532A', 'Slate blue': '#2F5D72' };

const fmtDate = (iso) => { try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
export const wordCount = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
export const estRead = (s) => Math.max(1, Math.round(wordCount(s) / 220)) + ' min';

export const SCHEMAS = {
  profile: { label: 'Hero', kind: 'single', view: 'Portfolio.dc.html#hero', fields: [
    { k: 'eyebrow', label: 'Eyebrow', type: 'text', hint: 'Small capitals above the headline.' },
    { k: 'headline', label: 'Headline', type: 'text', req: true },
    { k: 'highlight', label: 'Highlighted word', type: 'text', hint: 'Set in the handwriting face. Must appear in the headline.' },
    { k: 'intro', label: 'Intro', type: 'textarea', rows: 3 },
    { k: 'resume', label: 'Résumé', type: 'file', accept: '.pdf', side: true, hint: 'Served by the “Download résumé” button.' },
    { k: 'ctaLabel', label: 'Secondary button', type: 'text', side: true }
  ] },
  about: { label: 'About', kind: 'single', view: 'Portfolio.dc.html#about', fields: [
    { k: 'lead', label: 'Lead line', type: 'textarea', rows: 2, req: true },
    { k: 'body', label: 'Body', type: 'textarea', rows: 9, hint: 'Leave a blank line between paragraphs.' },
    { k: 'portrait', label: 'Portrait', type: 'file', accept: 'image/*', image: true, side: true, hint: '4:5, at least 900 px wide.' }
  ] },
  contact: { label: 'Contact', kind: 'single', view: 'Portfolio.dc.html#contact', fields: [
    { k: 'line', label: 'Heading', type: 'text', req: true },
    { k: 'email', label: 'Email', type: 'email', req: true },
    { k: 'github', label: 'GitHub', type: 'url', placeholder: 'https://github.com/…' },
    { k: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/…' },
    { k: 'readcv', label: 'Read.cv', type: 'url', placeholder: 'https://read.cv/…' },
    { k: 'x', label: 'X', type: 'url', placeholder: 'https://x.com/…', hint: 'Links left empty are hidden on the site.' }
  ] },
  experience: { label: 'Experience', singular: 'role', kind: 'list', ordered: true, view: 'Portfolio.dc.html#experience',
    blank: () => ({ role: '', company: '', start: '', end: '', current: false, note: '' }),
    fields: [
      { k: 'role', label: 'Title', type: 'text', req: true },
      { k: 'company', label: 'Company', type: 'text', req: true },
      { k: 'note', label: 'Description', type: 'textarea', rows: 5, hint: 'Shown when the row is expanded.' },
      { k: 'start', label: 'Start year', type: 'text', req: true, side: true, placeholder: '2023' },
      { k: 'current', label: 'Current role', type: 'toggle', side: true, on: 'Shows “now”', off: 'Has an end year' },
      { k: 'end', label: 'End year', type: 'text', side: true, placeholder: '2025', hideIf: 'current' }
    ],
    row: (it) => ({ title: it.role, sub: it.company, meta: (it.start || '?') + ' — ' + (it.current ? 'now' : (it.end || '?')) }),
    search: (it) => it.role + ' ' + it.company },
  projects: { label: 'Projects', singular: 'project', kind: 'list', ordered: true, view: 'Portfolio.dc.html#projects',
    filters: ['All', 'Published', 'Hidden'], filterBy: (it, f) => f === 'All' || (f === 'Published') === !!it.published,
    blank: () => ({ name: '', kind: 'Side project', year: String(new Date().getFullYear()), note: '', about: '', tags: [], live: '', repo: '', image: '', published: false }),
    fields: [
      { k: 'name', label: 'Name', type: 'text', req: true },
      { k: 'kind', label: 'Type', type: 'select', options: ['Open source', 'Side project', 'Client work'] },
      { k: 'note', label: 'Card line', type: 'textarea', rows: 2, max: 110, hint: 'One sentence. Used in lists and link previews.' },
      { k: 'about', label: 'Description', type: 'textarea', rows: 5, max: 320, hint: 'Shown in the project modal, which does not scroll. Keep it under 320 characters.' },
      { k: 'tags', label: 'Stack', type: 'tags', placeholder: 'Add and press Enter', hint: 'Up to four read best.' },
      { k: 'live', label: 'Live URL', type: 'url', placeholder: 'https://' },
      { k: 'repo', label: 'Repository URL', type: 'url', placeholder: 'https://github.com/…' },
      { k: 'published', label: 'Visibility', type: 'toggle', side: true, on: 'Published', off: 'Hidden from the site' },
      { k: 'year', label: 'Year', type: 'text', side: true },
      { k: 'image', label: 'Cover image', type: 'file', accept: 'image/*', image: true, side: true, hint: '4:3, at least 1200 px wide.' }
    ],
    row: (it) => ({ title: it.name, sub: it.kind, meta: it.year, status: it.published ? 'Published' : 'Hidden' }),
    search: (it) => it.name + ' ' + it.kind + ' ' + (it.tags || []).join(' ') },
  articles: { label: 'Writing', singular: 'article', kind: 'list', sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    filters: ['All', 'Published', 'Draft'], filterBy: (it, f) => f === 'All' || it.status === f,
    blank: () => ({ title: '', slug: '', date: new Date().toISOString().slice(0, 10), status: 'Draft', read: '', tts: true, body: '' }),
    fields: [
      { k: 'title', label: 'Title', type: 'text', req: true },
      { k: 'body', label: 'Body', type: 'markdown', placeholder: 'Start writing…' },
      { k: 'status', label: 'Status', type: 'select', side: true, options: ['Draft', 'Published'] },
      { k: 'slug', label: 'Slug', type: 'text', req: true, side: true, hint: 'Lives at /articles/[slug]. Filled from the title until you edit it.' },
      { k: 'date', label: 'Publish date', type: 'date', side: true },
      { k: 'read', label: 'Read time', type: 'text', side: true, placeholder: 'Auto' },
      { k: 'tts', label: 'Listen button', type: 'toggle', side: true, on: 'Text-to-speech shown', off: 'Hidden' }
    ],
    row: (it) => ({ title: it.title || 'Untitled', sub: '/articles/' + (it.slug || '…'), meta: fmtDate(it.date) + ' · ' + (it.read || estRead(it.body)), status: it.status }),
    search: (it) => it.title + ' ' + it.slug },
  skills: { label: 'Skills', singular: 'group', kind: 'list', ordered: true, max: 4, view: 'Portfolio.dc.html#skills',
    blank: () => ({ title: '', items: [] }),
    fields: [
      { k: 'title', label: 'Column heading', type: 'text', req: true },
      { k: 'items', label: 'Items', type: 'tags', placeholder: 'Add and press Enter', hint: 'Shown in this order. Four to six per column.' }
    ],
    row: (it) => ({ title: it.title, sub: (it.items || []).join(', '), meta: (it.items || []).length + ' items' }),
    search: (it) => it.title + ' ' + (it.items || []).join(' ') },
  quotes: { label: 'Quotes', singular: 'quote', kind: 'list', ordered: true, view: 'Portfolio.dc.html#quotes',
    blank: () => ({ text: '', author: '', active: true }),
    fields: [
      { k: 'text', label: 'Quote', type: 'textarea', rows: 3, req: true, max: 140, hint: 'The quote box has a fixed height. 140 characters fits on every screen.' },
      { k: 'author', label: 'Attribution', type: 'text', req: true },
      { k: 'active', label: 'In rotation', type: 'toggle', side: true, on: 'Shown', off: 'Skipped' }
    ],
    row: (it) => ({ title: '“' + it.text + '”', sub: it.author, status: it.active ? 'Shown' : 'Skipped' }),
    search: (it) => it.text + ' ' + it.author },
  settings: { label: 'Settings', kind: 'single', view: 'Portfolio.dc.html', fields: [
    { k: 'accent', label: 'Accent', type: 'select', options: ['Terracotta', 'Slate blue'], hint: 'The dark-mode accent is derived from this.' },
    { k: 'grain', label: 'Grain', type: 'range', min: 0, max: 24, step: 0.5, unit: '%' },
    { k: 'fab', label: 'Navigation button', type: 'select', options: ['Bottom right', 'Bottom centre'] },
    { k: 'menu', label: 'Menu layout', type: 'select', options: ['Arc', 'Centre wheel'] },
    { k: 'intro', label: 'Signature intro', type: 'toggle', on: 'Plays on first load', off: 'Off' },
    { k: 'tilt', label: 'Signature tilt', type: 'range', min: -10, max: 4, step: 0.5, unit: '°' }
  ] }
};

export const NAV = [
  { group: 'Page', items: ['profile', 'about', 'contact'] },
  { group: 'Content', items: ['experience', 'projects', 'articles', 'skills', 'quotes'] },
  { group: 'Site', items: ['settings'] }
];

const id = () => Math.random().toString(36).slice(2, 9);
const body1 = `On the last product I worked on, the initial load was a respectable 1.2 seconds. Switching a tab took 240 milliseconds, and that was the number people complained about.

## What the second render costs

The first render is a promise. The second is where you keep it or break it: every filter, every tab, every back button.

> Users forgive a slow start. They do not forgive a slow response.

Most of the fixes were boring: stop refetching what we already had, keep the previous view on screen until the next one is ready, and measure interactions rather than page loads.`;

export const SEED = () => ({
  profile: { eyebrow: 'Tanishk Saxena — SDE, Delhi', headline: 'I build quiet, careful software for the web.', highlight: 'web', intro: 'Six years turning tangled requirements into interfaces people can actually use. Currently working on developer tooling and design systems.', resume: 'tanishk-saxena-resume.pdf', ctaLabel: 'Get in touch' },
  about: { lead: 'I care about the unglamorous parts: the empty state, the error copy, the second render.', body: 'I started out writing Django views for a logistics company and stayed because I liked watching people use the thing I made. Since then I have worked mostly at the seam between design and engineering — building component libraries, arguing about spacing scales, and shipping the boring infrastructure that makes a product feel fast.\n\nAway from the editor I read a lot of non-fiction, run slowly, and keep a notebook of interfaces I wish existed. If you are building something thoughtful, I would like to hear about it.', portrait: '' },
  contact: { line: 'Tell me what you are building.', email: 'hello@example.com', github: '', linkedin: '', readcv: '', x: '' },
  experience: [
    { id: id(), role: 'Senior Frontend Engineer', company: 'Northwind Labs', start: '2023', end: '', current: true, note: 'Own the design system and the editor surface. Cut first-paint by half and made the component API something people reach for.' },
    { id: id(), role: 'Product Engineer', company: 'Kettle', start: '2021', end: '2023', current: false, note: 'Second engineering hire. Built the billing flow, the onboarding, and most of the internal tooling that replaced it.' },
    { id: id(), role: 'Software Engineer', company: 'Gravel Logistics', start: '2019', end: '2021', current: false, note: 'Django and a lot of spreadsheets. Learned to ask what the operations team actually does before shipping anything.' }
  ],
  projects: [
    ['Marginalia', 'Open source', '2025', 'A margin-notes layer for documentation sites. 2.1k stars and a surprising amount of email.', ['TypeScript', 'Web Components', 'Postgres']],
    ['Slowtype', 'Side project', '2024', 'A writing app that only shows you the current paragraph. Built in a weekend, still use it daily.', ['React', 'IndexedDB', 'Rust']],
    ['Tidepool', 'Client work', '2023', 'Realtime dashboard for a coastal research group. Charts that stay legible on a boat.', ['Svelte', 'Go', 'TimescaleDB']],
    ['Halfstep', 'Side project', '2023', 'A metronome that follows your playing instead of the other way round.', ['Web Audio', 'Rust', 'WASM']],
    ['Paperweight', 'Open source', '2022', 'A static site generator that outputs a single HTML file.', ['Node', 'Markdown', 'Esbuild']],
    ['Northbound', 'Client work', '2022', 'Route planning for a regional logistics operator, rebuilt around the dispatcher.', ['React', 'Python', 'PostGIS']],
    ['Fieldnote', 'Open source', '2021', 'An offline-first notebook for survey teams working without signal.', ['CRDT', 'Svelte', 'SQLite']]
  ].map(([name, kind, year, note, tags], i) => ({ id: id(), name, kind, year, note, about: '', tags, live: '', repo: '', image: '', published: i < 6 })),
  articles: [
    ['second-render', 'The second render is the one users feel', '6 min', '2026-08-14', body1],
    ['error-copy', 'Notes on writing error copy that helps', '4 min', '2026-05-02'],
    ['spacing-scale', 'A spacing scale you can defend in review', '9 min', '2026-02-19'],
    ['design-systems', 'Design systems die in the gap between the two teams', '7 min', '2025-11-08'],
    ['code-review', 'What I look for first in a code review', '5 min', '2025-09-21'],
    ['side-projects', 'Finishing things: a short defence of the small project', '3 min', '2025-06-12'],
    ['empty-states', 'The empty state is the first screen most people see', '6 min', '2025-03-04'],
    ['estimates', 'Why my estimates got better when they got vaguer', '4 min', '2024-12-10'],
    ['typography-ui', 'Reading the interface: type choices that carry weight', '8 min', '2024-10-15'],
    ['first-90-days', 'Notes from ninety days on an unfamiliar codebase', '5 min', '2024-07-02']
  ].map(([slug, title, read, date, body]) => ({ id: id(), slug, title, read, date, status: 'Published', tts: true, body: body || '' }))
    .concat([{ id: id(), slug: 'shipping-less', title: 'On shipping less', read: '', date: '2026-09-20', status: 'Draft', tts: true, body: '' }]),
  skills: [
    { id: id(), title: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
    { id: id(), title: 'Frontend', items: ['React', 'Angular', 'Svelte', 'CSS architecture'] },
    { id: id(), title: 'Backend', items: ['Node', 'Django', 'Postgres', 'Redis'] },
    { id: id(), title: 'Practice', items: ['Design systems', 'Accessibility', 'Performance', 'Technical writing'] }
  ],
  quotes: [
    ['Simplicity is prerequisite for reliability.', 'Edsger W. Dijkstra'],
    ['Programs must be written for people to read, and only incidentally for machines to execute.', 'Harold Abelson'],
    ['Premature optimization is the root of all evil.', 'Donald Knuth'],
    ['Design is not just what it looks like and feels like. Design is how it works.', 'Steve Jobs'],
    ['Talk is cheap. Show me the code.', 'Linus Torvalds'],
    ['Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', 'Martin Fowler']
  ].map(([text, author]) => ({ id: id(), text, author, active: true })),
  settings: { accent: 'Terracotta', grain: 6, fab: 'Bottom right', menu: 'Arc', intro: true, tilt: -4 }
});
