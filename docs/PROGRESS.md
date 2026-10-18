# Progress ledger

Where the build stands, and how it got here. Updated in every PR that changes it. The full
step-by-step diary is this file's git history before the 2026-10-18 cleanup.

**Now:** the build is complete (Phases 0–10), on one data path (Supabase, tested against a
local one in CI), and the owner's review round is merged (PR #67). The owner is entering real
content on dev, to copy to prod when ready.
**Next:** the end-to-end round on prod from **the owner's test list**, once the real content
is in. Later work is ordinary PRs.

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Repo, brief, design extraction (`docs/DESIGN-SPEC.md`) | ✅ |
| 1 | Tooling, token layer, CI, branching rules and hooks | ✅ |
| 2 | Domain types, repository interfaces, fixtures, composition root | ✅ |
| 3 | The public site, mobile first | ✅ |
| 4 | Motion | ✅ |
| 5 | Ship: Vercel, metadata, OG cards, sitemap, JSON-LD, analytics | ✅ live at https://tanishk-saxena.vercel.app |
| 6 | Content model v2; Supabase (dev + prod), migrations, RLS, seed | ✅ |
| 7 | Admin auth: sign-in, `proxy.ts` guard, allowlist | ✅ |
| 8 | Admin portal: every section editable, uploads, Settings | ✅ owner-tested 2026-10-03 |
| 9 | UI review and features (the roadmap below), Lighthouse CI, signed-in admin e2e | ✅ PR #48, 2026-10-18 |
| 10 | Final audit: one reading of prod and the admin; Caveat no longer preloaded. No standing audit (owner) | ✅ PR #49 |

## History

What happened in each phase and why, in short. Design decisions themselves live in the specs
(§9/§10, §13/§14).

**Phase 0–1 (repo, foundation).** All earlier plans voided; the Claude Design mockups became
the one visual source and `DESIGN-SPEC.md` was extracted from them, open points resolved as
`[ASSUMED]` (Q1–Q32). Owner direction recorded early: the mockup wins every contradiction,
rules apply by intent, motion is a feature. Tooling, the token layer and a `/tokens` check
page; CI proven to reject a planted lint error (throwaway PR #1). Trunk-based branching with
local hooks and a server-side ruleset on `main` (PR required, `check` green, linear history,
no bypass; PR #2). Deployment deferred to Phase 5 so everything worked locally first.

**Phase 2 (domain, PR #3).** Domain types and async repository interfaces, fixture
repositories over a shipped dataset plus a stress dataset, `lib/container.ts` switched by
`DATA_SOURCE`, a contract suite run against both datasets, and the ESLint boundary.

**Phase 3 (the site, PRs #4–#7).** Shell, sections, the floating nav and the article route,
built 390px first and compared against the mockup at 390 and 1440. Playwright smoke and axe
entered CI. CLS fixed and fonts split for articles.

**Phase 4 (motion, PR #8).** Every interaction in the spec, with cheap equivalents only where they
look identical. Owner revisions settled here became DESIGN-SPEC §10: page turns as one sheet
(no title morph), section entrances, the hiding header, the ripple, Show more / less as a
sequence, exact Back restoration. The **signature intro was shelved**: the pen-drawn version
shifted at the hand-off and cost ~31 KB of glyph data. Learned: Next's dev server serves JS
only to `localhost` (fixed with `allowedDevOrigins`, so the owner's phone works over the LAN);
the emulator misses GPU cost, so phone motion is verified on the real phone. Testing was
trimmed to unit tests for data plus a small smoke suite (owner).

**Phase 5 (ship, PR #9; fixes #10–#11).** Vercel (main → production, branches → previews) at
`tanishk-saxena.vercel.app`; metadata, OG cards, sitemap, robots, JSON-LD (validated), Vercel
Analytics and Speed Insights (cookieless). Owner rule from here: **performance and
accessibility are flagged, never blocking**; P-1 opened (lab LCP 3.3–3.6 s). Post-ship fix:
phones froze opening an article, because React held the view transition for a late font and
phone GPUs are slow to snapshot the long home page; phones now turn pages with transform and
opacity (worst frame 683 → ~170 ms).

**Milestone B plan (PR #12).** The admin mockup extracted into `ADMIN-DESIGN-SPEC.md` and
reconciled with the shipped site (the site wins where they differ).

**Phase 6 (data, PRs #13–#15).** Content model v2 on fixtures first (published, status,
active, listen, CTA label, settings), visually identical; then Supabase dev + prod,
migrations, RLS, a seed generated from the fixtures, Storage, Supabase repositories passing
the same contract, production switched over with pages still prerendered and revalidated on
save.

**Phase 7 (auth, PR #17).** Email + password, sign-ups off, an allowlist, `proxy.ts`, a
separate admin theme key; RLS as the real boundary.

**Test consolidation (PRs #19–#20).** Owner asked for fewer, faster tests without losing
behaviours: unit 82 → 33, smoke 6 → 3 journeys, the live suite made opt-in
(`npm run test:live`), results pinned to the PR and on the run's Summary. A flaky axe reading
(the scroll cue audited mid-fade) fixed.

**Phase 8 (admin, PRs #22–#26).** Shell and lists; the shared schema, Field and editor with
save + revalidate; list actions (toggles, reorder, delete + Undo, duplicate, 409); Markdown
and uploads; Settings switching the site's variants (slate blue, bottom-centre button, centre
wheel, grain). Closed by the owner's test on dev (2026-10-03), whose findings became Phase 9.3.
Docs process tightened twice (2026-10-02): docs move with the code in the same PR by
`CLAUDE.md`'s steps, and Claude reminds the owner to ask for a docs pass before every merge.

**Phase 9 (UI review and features, PRs #29–#37, #48).** Planned in full by the owner on 2026-10-04 as 33
numbered items (index below). 9.1 Lighthouse CI as a reading; 9.4 a dev test admin so CI runs
a blocking signed-in journey and axe on every admin screen (A-1, an accent-wash contrast miss,
found and fixed); 9.3 the owner's findings (rules, admin UX, site UX, drag to reorder, media);
9.2 site title and description; 9.5 the re-evaluation: skills layout, script face, the
signature intro brought back as the navbar mark itself (no hand-off, no glyph data), the heat
map, Markdown experience, contact links, storage cleanup. Options-first items went through a
comparison page and the owner's pick. 9.5's reviewed PRs #40–#47 were folded into one, PR #48;
its five migrations went to prod on 2026-10-18.

**Phase 10 (final audit, PR #49).** One Lighthouse reading of prod (desktop 100; mobile 87–88)
and the signed-in admin. Only one fix was worth its cost: Caveat no longer preloaded. A weekly
audit workflow was built and then **dropped by the owner before merge**: it repeated the PR
checks and Speed Insights. That set the rule for what follows: simplicity and reliability, no
process that repeats existing checks, test the paths prod runs.

**Docs cleanup (PR #50).** Docs from ~3,600 lines to ~1,300; the design mockups removed (git
history keeps them); this history kept in their place.

**One data path (PR #51).** The owner chose reliability over plug-and-play: the fixture
repositories and `DATA_SOURCE` went, and the app always runs on Supabase. The content files
became one seed (`lib/seed`): the shipped placeholders plus stress cases at the real limits,
which a unit test holds to the admin's own validation. CI starts a throwaway local Supabase
with that seed and its own test admin (no secrets; dev and prod untouched; tests that write
refuse any other Supabase), then runs the database suite, the e2e journeys (new: every kind of
save checked on the site, an upload included) and Lighthouse, now with the signed-in admin
(its budget is accessibility only). The same checks run by hand from the Actions tab. And so
real content never needs an audit, accessibility was closed in code: the article renderer
(one h1, named links, safe hrefs), validation (image descriptions, link words), modal media
named from the project and held muted, and the grain capped at 7% for contrast.

The test changes, in short: unit tests read the seed directly (no in-memory repositories);
`npm run test:live` against dev became `npm run test:db` against the local Supabase, in CI;
the signed-in tests stopped skipping without credentials (CI always has its test admin);
the PR's results table gained the database suite. The first CI runs caught three things, now
fixed: the local Supabase's email provider must stay on (only sign-ups are off); a test image
must be a real file (a hand-written PNG failed to decode, so the admin refused it); Lighthouse
must audit the settled home page (`docs/PERFORMANCE.md`). Readings after it: accessibility
100 everywhere; signed-in admin performance 91–94 mobile, 100 desktop.

**Safari and Dependabot (PR #54).** The tests ran in Chrome only, while most phones visiting
are iPhones: every e2e spec now also runs in Safari's engine on an iPhone profile
(`iphone-safari`). Dependabot opens update PRs (npm weekly, minor and patch grouped; Actions
monthly), and the repo's security alerts and fixes are on; with no secrets in CI, those PRs
run the full checks. Considered and left out (owner): prod's configuration (the owner keeps
prod identical to dev and the tested schema) and end-to-end tests of unusual uploads. The
WebKit run found one race in the tests (a save's refresh landing during a typed navigation;
the tests now let it settle), not in the app.

**Dependabot's first pass (PRs #52–#65, 2026-10-18).** Turning on the alerts showed 14
vulnerabilities. The ones that reach the site were fixed: `next` 16.3.8 (#56: SSRF in image
optimisation, cache poisoning), `sharp` (#53), `source-map-js` (#52); the grouped batch (#63)
then took `next` to 16.4.1 and React to 19.3.1, green in CI. The major upgrades it proposed
(TypeScript 7, ESLint 10, `@types/node` 26, a `next` minor already covered) were closed, and
`dependabot.yml` now skips majors (#64; security updates still come). Actions updates (#57)
and `@types/node` 24.19 (#65) merged; no PR left open. One CI build failed downloading the
Google fonts (a network blip; the re-run passed): the owner's rule is to re-run, and to
self-host the fonts only if it repeats. No change is made unless it is truly needed.

**The owner's review round (PR #67, 2026-10-18/19).** The owner's test round on dev gave 18
verdicts and three extra asks; one PR answers them, with the owner's follow-ups folded in.
Settled: quotes change one at a time (never two on screen); the ripple on every press (Ring,
Press-in and their setting gone); the nav button always bottom right and shown from the
hero (its centre setting gone; a migration drops both columns); the TS app icon; the
admin's phone menu button always at the right; a paste zone whose picker opens only from
**Open files**; contact links added complete from a composer (an empty URL refused; the
error on Add came from an empty row failing validation at once, and `crypto.randomUUID`
missing over plain http); the project modal 70svh on phones, no close button, links above
the copy, media with no scrollbar, pressable dots, and one play per item when rotating (a
GIF's length read from the file); the signature intro on reload too, never for a
`#section` URL or from an article, no animation when off, the hero held until it lands;
the nav opening mirroring its close; the Simple Markdown hint saying what stays as typed.
The follow-ups (2026-10-19): a time-left bar on rotating media that is the timer itself
(hover pauses the rotation only; phones don't pause, a held finger being the long press);
modal arrows on hover, bolder dots; focus on Live site and Source only, the name read first;
the Simple Markdown set as a tooltip; the toast an accent pill, centred (pinned at
`left: 50%`, a long one had overflowed right); the open nav holding the page still and its
wheel centred on the visible screen (measured on opening, so parking above the footer no
longer throws it off); and on phones one admin top bar for every page, which the sections
sheet's header lines up with. Checked: `##` is h2 in articles (the owner had typed it in an
experience description, where headings are off by design); storage cleanup is covered by
unit and database tests; rotation "not working" was the Project media setting, off in dev
and prod. Two local traps, not bugs: the owner's dev server, running through the edits,
served stale admin markup (hydration errors until restarted); and temporary pages on it
leave partial route types in `.next/dev/types` (`tsc` noise CI never sees). After the merge
(2026-10-19): its migration pushed to dev, then prod, once the deploy was live (the two
columns gone, every other setting reading as before); the owner removed what nothing read
any more (the dev test admin and its allowlist row, the four `E2E_*` repository secrets,
Vercel's `DATA_SOURCE`, and four `.env.local` lines: `DATA_SOURCE`, `SUPABASE_SECRET_KEY`,
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`; CI sets its own, for its local Supabase).

## Open items

- **P-1, phone lab LCP** (≈3.2–3.6 s, mobile performance 87–88): flagged, never a gate.
  What's left is framework JS; judged by Speed Insights field data (`docs/PERFORMANCE.md`).
- **Owner:** the GitHub username in **prod's** Settings (the live heat map stays hidden until
  then). Prod's Vault secrets and `GITHUB_TOKEN` are set (2026-10-18).
- **Owner:** pick one script face (Allura or Caveat); then the other is deleted (`lib/fonts.ts`).
- **Six Dependabot alerts, dev tooling only** (`extract-zip` ×2, `tmp` ×2, `sprintf-js`,
  `uuid`): never on the live site; their fixes arrive through Dependabot as upstream ships
  them. Nothing to do meanwhile.
- **Dependabot PRs:** npm weekly (minor and patch in one PR), Actions monthly, security fixes
  at once; no majors. Each runs the full checks; the owner merges, or tells Claude to.

## The owner's test list

Built things to verify by hand, on a real phone and with real files. Not remaining work;
anything flagged becomes an ordinary fix. Everything built so far passed on dev, the review
round's fixes included (owner, 2026-10-19: PR #67, phone checks too).

- [ ] **Script face**: Allura or Caveat, still to pick (open items).
- [ ] Every admin feature on **prod, on a phone**, and a save showing on the live site (roadmap item 33).
- [ ] Remove the **sample media** from the first two projects in dev and prod when real media goes in (`docs/SUPABASE.md`).

## Phase 9 roadmap: item index

Code comments cite these numbers. Every item is built and merged (PR #48) unless marked.

| # | Item | # | Item |
|---|---|---|---|
| 1 | One dev test admin for CI (no roles) | 18 | Calmer quote change (one strip moving left) |
| 2 | Admin axe in CI, every screen | 19 | Menus close in reverse |
| 2b | Blocking signed-in admin journey | 20 | Press feedback setting (since 2026-10-18: the ripple only) |
| 3 | Site axe on open states (row, modal, menu) | 21 | Project card line dropped |
| 4 | Four skill groups at most | 22 | Drag to reorder: lists and skill chips |
| 5 | 4–6 items per skill group | 23 | Paste images; project modal media |
| 6 | Article: External URL or body, never both | 24 | Site title and description in Settings |
| 7 | Early validation everywhere | 25 | Skills as ruled rows / stacked chips |
| 8 | Save disabled when clean | 26 | External URL kept (decided, nothing built) |
| 9 | "Markdown supported" hint | 27 | Name/Location on Hero, Footer note on Contact kept |
| 10 | Stacked, themed toasts | 28a | Script face setting; the signature writes itself |
| 11 | Autofocus in dialogs | 28b, 28c | Experience rows and quotes stay (decided) |
| 12 | Reset to defaults on Settings | 29a, b, d | RSS blog, `/uses`, draft preview: skipped |
| 13 | No double requests: debounce or lock | 29c | Signature intro, with a Settings switch |
| 14 | Delete from the list | 29e | GitHub contribution heat map |
| 15 | Leave dialog lists the changes | 30 | Experience descriptions in simple Markdown |
| 16 | "No preview to show" placeholder | 31 | Contact links as an editable list |
| 17 | Modal year under the name | 32 | Storage cleanup (on save and a daily job) |
| | | 33 | Owner's prod phone test (**open**, on the test list) |
