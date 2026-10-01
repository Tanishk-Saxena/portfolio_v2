-- Generated from the fixtures by lib/repositories/supabase/seed.ts. Do not edit by hand.

insert into public.profile (name, eyebrow, headline, headline_highlight, standfirst, cta_label, about_lead, about_paragraphs, portrait, resume_url, email, contact_statement, location, footer_note) values
  ('Tanishk Saxena', 'Tanishk Saxena — SDE, Delhi', 'I build quiet, careful software for the web.', 'web', 'Six years turning tangled requirements into interfaces people can actually use. Currently working on developer tooling and design systems.', 'Get in touch', 'I care about the unglamorous parts: the empty state, the error copy, the second render.', array['I started out writing Django views for a logistics company and stayed because I liked watching people use the thing I made. Since then I have worked mostly at the seam between design and engineering — building component libraries, arguing about spacing scales, and shipping the boring infrastructure that makes a product feel fast.', 'Away from the editor I read a lot of non-fiction, run slowly, and keep a notebook of interfaces I wish existed. If you are building something thoughtful, I would like to hear about it.'], null, '/placeholder/resume.pdf', 'hello@example.com', 'Tell me what you are building.', 'Delhi', 'Designed and built in Delhi');

insert into public.settings (accent, grain, nav_position, menu_layout) values
  ('terracotta', 6, 'right', 'arc');

insert into public.experience (id, role, org, start_date, end_date, summary, sort_order) values
  ('northwind-labs', 'Senior Frontend Engineer', 'Northwind Labs', '2023-01', null, 'Own the design system and the editor surface. Cut first-paint by half and made the component API something designers can read.', 1),
  ('kettle', 'Product Engineer', 'Kettle', '2021-01', '2023-01', 'Second engineering hire. Built the billing flow, the onboarding, and most of the internal tooling that replaced it.', 2),
  ('gravel-logistics', 'Software Engineer', 'Gravel Logistics', '2019-01', '2021-01', 'Django and a lot of spreadsheets. Learned to ask what the operations team actually does before shipping anything.', 3);

insert into public.project (id, title, kind, year, summary, description, tags, image, repo_url, live_url, published, sort_order) values
  ('marginalia', 'Marginalia', 'open-source', 2025, 'A margin-notes layer for documentation sites. 2.1k stars and a surprising amount of email.', 'Readers highlight a passage and leave a note in the margin; maintainers see every note as a queue. A 9kb script with no framework dependency, now running on a few hundred documentation sites.', array['TypeScript', 'Web Components', 'Postgres'], null, 'https://example.com/source/marginalia', 'https://example.com/marginalia', true, 1),
  ('slowtype', 'Slowtype', 'side-project', 2024, 'A writing app that only shows you the current paragraph. Built in a weekend, still use it daily.', 'A writing app that shows only the paragraph you are working on and dims the rest. Local-first, no account, clean Markdown out. A weekend experiment in removing features that I still draft in daily.', array['React', 'IndexedDB', 'Rust'], null, 'https://example.com/source/slowtype', 'https://example.com/slowtype', true, 2),
  ('tidepool', 'Tidepool', 'client-work', 2023, 'Realtime dashboard for a coastal research group. Charts that stay legible on a boat.', 'A realtime dashboard for a coastal research group tracking buoy telemetry. Built for direct sun on a moving boat: high contrast, touch-first, and still useful on an intermittent connection.', array['Svelte', 'Go', 'TimescaleDB'], null, 'https://example.com/source/tidepool', 'https://example.com/tidepool', true, 3),
  ('halfstep', 'Halfstep', 'side-project', 2023, 'A metronome that follows your playing instead of the other way round.', 'A metronome that listens and follows your tempo instead of forcing one on you. Onset detection runs in a worklet so the click never drifts, and it works offline on a phone in a practice room.', array['Web Audio', 'Rust', 'WASM'], null, 'https://example.com/source/halfstep', 'https://example.com/halfstep', true, 4),
  ('paperweight', 'Paperweight', 'open-source', 2022, 'A static site generator that outputs a single HTML file.', 'A static site generator that emits one self-contained HTML file: styles, fonts and images inlined. Built for documentation that has to survive being emailed around as an attachment.', array['Node', 'Markdown', 'Esbuild'], null, 'https://example.com/source/paperweight', 'https://example.com/paperweight', true, 5),
  ('northbound', 'Northbound', 'client-work', 2022, 'Route planning for a regional logistics operator, rebuilt around the dispatcher.', 'Route planning rebuilt around how dispatchers actually work: keyboard first, every action undoable, and a map that stays responsive with four thousand stops on screen.', array['React', 'Python', 'PostGIS'], null, 'https://example.com/source/northbound', 'https://example.com/northbound', true, 6),
  ('fieldnote', 'Fieldnote', 'open-source', 2021, 'An offline-first notebook for survey teams working without signal.', 'An offline-first notebook for survey teams working without signal. Conflict resolution happens on the device, so two people editing the same record in the field merge cleanly when they reconnect.', array['CRDT', 'Svelte', 'SQLite'], null, 'https://example.com/source/fieldnote', 'https://example.com/fieldnote', true, 7);

insert into public.article (slug, title, excerpt, published_at, read_minutes, body, external_url, status, listen) values
  ('second-render', 'The second render is the one users feel', '', '2026-08-14', 6, 'Every performance conversation starts at the first paint, because that is the number the tooling hands you. The moment users actually judge, though, is the second render: the one that happens after they touch something.

A cold load has a story around it. People expect a pause when they arrive somewhere new, and a skeleton screen buys more patience than it has any right to. Tap a filter and wait two hundred milliseconds, though, and the interface feels broken in a way no loading bar repairs. The contract changed: you promised a response, not an arrival.

## What the second render costs

On the last product I worked on, the initial load was a respectable 1.2 seconds. Switching a tab took 240 milliseconds, most of it spent re-deriving a list that had not changed. Nobody filed a bug about the cold start. Three people filed bugs about the tabs.

> Users forgive a slow arrival. They do not forgive a slow answer.

The fix was unglamorous. Memoise the derivation, move the filter state out of the tree that owned the layout, and stop recreating the row components on every keystroke. None of it showed up in the lighthouse score. All of it showed up in how the product felt.

## Measuring the thing you care about

Record an interaction trace instead of a page load. Pick the three actions people take most, put a mark at the event and another at the committed frame, and watch that number in CI the way you watch bundle size. It is a less impressive metric to put in a deck, and a much better one to design against.

The rest is discipline: keep the work small, keep it off the main thread when you can, and treat a re-render as something you have to justify rather than something that happens to you.', null, 'published', true),
  ('error-copy', 'Notes on writing error copy that helps', '', '2026-05-02', 4, 'This is a placeholder for “Notes on writing error copy that helps”. The full article is still being written.', null, 'published', true),
  ('spacing-scale', 'A spacing scale you can defend in review', '', '2026-02-19', 9, 'This is a placeholder for “A spacing scale you can defend in review”. The full article is still being written.', null, 'published', true),
  ('design-systems', 'Design systems die in the gap between the two teams', '', '2025-11-01', 7, 'This is a placeholder for “Design systems die in the gap between the two teams”. The full article is still being written.', null, 'published', true),
  ('code-review', 'What I look for first in a code review', '', '2025-09-01', 5, 'This is a placeholder for “What I look for first in a code review”. The full article is still being written.', null, 'published', true),
  ('side-projects', 'Finishing things: a short defence of the small project', '', '2025-06-01', 3, 'This is a placeholder for “Finishing things: a short defence of the small project”. The full article is still being written.', null, 'published', true),
  ('empty-states', 'The empty state is the first screen most people see', '', '2025-03-01', 6, 'This is a placeholder for “The empty state is the first screen most people see”. The full article is still being written.', null, 'published', true),
  ('estimates', 'Why my estimates got better when they got vaguer', '', '2024-12-01', 4, 'This is a placeholder for “Why my estimates got better when they got vaguer”. The full article is still being written.', null, 'published', true),
  ('typography-ui', 'Reading the interface: type choices that carry weight', '', '2024-10-01', 8, 'This is a placeholder for “Reading the interface: type choices that carry weight”. The full article is still being written.', null, 'published', true),
  ('first-90-days', 'Notes from ninety days on an unfamiliar codebase', '', '2024-07-01', 5, 'This is a placeholder for “Notes from ninety days on an unfamiliar codebase”. The full article is still being written.', null, 'published', true);

insert into public.skill_group (id, title, items, sort_order) values
  ('languages', 'Languages', array['TypeScript', 'Python', 'Go', 'SQL'], 1),
  ('frontend', 'Frontend', array['React', 'Angular', 'Svelte', 'CSS architecture'], 2),
  ('backend', 'Backend', array['Node', 'Django', 'Postgres', 'Redis'], 3),
  ('practice', 'Practice', array['Design systems', 'Accessibility', 'Performance', 'Technical writing'], 4);

insert into public.quote (id, text, author, active, sort_order) values
  ('quote-1', 'Simplicity is prerequisite for reliability.', 'Edsger W. Dijkstra', true, 1),
  ('quote-2', 'Programs must be written for people to read, and only incidentally for machines to execute.', 'Harold Abelson', true, 2),
  ('quote-3', 'Premature optimization is the root of all evil.', 'Donald Knuth', true, 3),
  ('quote-4', 'Design is not just what it looks like and feels like. Design is how it works.', 'Steve Jobs', true, 4),
  ('quote-5', 'Talk is cheap. Show me the code.', 'Linus Torvalds', true, 5),
  ('quote-6', 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', 'Martin Fowler', true, 6);

insert into public.social_link (id, label, url, sort_order) values
  ('github', 'GitHub', 'https://github.com/', 1),
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/', 2),
  ('read-cv', 'Read.cv', 'https://read.cv/', 3),
  ('x', 'X', 'https://x.com/', 4);
