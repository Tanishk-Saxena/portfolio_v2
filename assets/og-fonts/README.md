Static TTFs for build-time image rendering (`lib/og/`): share cards and app icons. Never
served to visitors. Downloaded from Google Fonts; all SIL Open Font License 1.1.

- `newsreader-display-300.ttf`: Newsreader, opsz 72, weight 300
- `caveat-600.ttf`: Caveat 600
- `plex-sans-400.ttf`: IBM Plex Sans 400

`/favicon.ico` is a route (`app/favicon.ico/route.ts`) that draws the same 48px monogram as
`/icon`, in the saved accent; there is no static `favicon.ico` file to regenerate any more.
