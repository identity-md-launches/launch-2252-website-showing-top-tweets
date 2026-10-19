# Swarm Signal

A dark-green reading board for the identity.md conversation, with two Pepe operators equipped with AI tools. Search eight sourced post summaries, filter by topic, sort by captured engagement, and save posts in your browser.

## Install, build and preview

Requires Node.js 22 and npm.

```sh
npm ci
npm run typecheck
npm run build
npm run preview
```

Open the local URL printed by Vite. `npm run dev` starts the development server. The finished website is `dist/index.html`; serve the entire `dist/` directory with any static file server.

Vite uses `base: './'`. Scripts, styles, fonts, the favicon and artwork resolve relatively. The site was tested under `/preview/`, rather than only at an origin root. Navigation uses `#feed` and `#saved`, so no server rewrites are needed. Required runtime assets are local; the site makes no API or third-party asset requests.

## What the feed represents

The collection was captured on **October 19, 2026** from publicly readable [IMD Radar](https://www.sotwe.com/imdradar) and [Prem Makeig](https://www.sotwe.com/nxt3d) profiles on Sotwe. Every card links to its source. Text is a written **summary**, not a quotation or an embedded tweet. Monogram avatars are UI identifiers, not fetched profile photos.

“Top” means most captured likes **within these eight selected posts**, not all posts on X. Other sorts use captured reposts or the relative ages reported by the source. Source mirrors and engagement counts may be delayed. This is a static collection, with no automatic refresh or live X integration.

Stable tweet permalinks could not be independently verified. **Find on X** and the copy control therefore use author-and-text searches, accurately labeled as searches. X can require sign-in, and posts or mirrors may later disappear. The collection notes explain these limitations inside the website.

Bookmarks use local storage under `swarm-signal:saved:v1`. They persist in the same browser, synchronize between tabs and do not synchronize between devices. When storage is unavailable, the UI explains that bookmarks last only for the visit. Clipboard denial produces a recovery message pointing to Find on X.

## Update the collection

Edit `src/posts.ts`. Each entry includes a stable local ID, author, handle, topic, summary, search phrase, source URL, captured engagement and relative source age. Update `CAPTURE_DATE` and the visible snapshot date in `src/App.tsx` together when refreshing the collection. Verify each source before changing numbers. Category counts, results, rankings and search totals derive from the data.

The application is React + TypeScript, with Vite and Lucide icons. `src/styles.css` contains the design tokens and responsive rules. The original SVG operator illustration and favicon are in `public/`; `public/images/share-card.png` is a real 1200 × 630 PNG. All are copied into the export during the build.

## Validation

The production build and separate typecheck passed. The final Chromium interaction suite passed **21/21** checks, and the pinned taste@1 probe passed **16/16** checks. An axe-core audit reported no WCAG A/AA violations in the tested feed and dialog states. The feed, search and first complete post action are visible at **390 × 844**. No horizontal overflow was measured at 320, 390, 620, 720, 820, 1050 or 1440 pixels.

The repeatable interaction suite is `scripts/validate.mjs`. It requires an existing Playwright installation and its Chromium browser. If Playwright is available as a local module:

```sh
npm run validate:ui
```

For an externally installed module:

```sh
npm run validate:ui -- --playwright-module /absolute/path/to/playwright/index.mjs
```

It serves the export at a subpath, blocks external runtime requests and writes disposable results and screenshots under `test/scratch/interaction/`. It checks searches, categories, sorts, saved state, navigation, keyboard interaction, modal focus, copy success/failure, unavailable storage, responsive overflow and reduced motion. It also attempts a WebKit smoke check, explicitly reporting an unavailable runtime instead of recording a pass. WebKit was unavailable in this run; Safari, real devices and assistive-technology checks remain unperformed.

See [VALIDATION.md](VALIDATION.md) for the six-domain review, fixes, measured contrast and remaining limitations. [DESIGN.md](DESIGN.md) documents the final implementation.

## Submission path budget

The `.gitignore` budget is exactly two patterns: `**/node_modules/` for generated dependencies at any nesting level, and `/test/scratch/` for disposable checks. Source, package manifests, the lockfile, public assets, documentation and **all of `dist/` remain included**. There are no dependency archives, vendored registries, submodules or source maps in the deliverable. The complete deliverable is below the 8 MiB limit.

## Credits

Manrope is bundled under the SIL Open Font License in `public/fonts/OFL.txt`. React and Lucide notices are retained in `licenses/`. The pinned Better Interface guidance by Jakub Krehel (MIT), with documentation guidance adapted from Paul Bakaus's Impeccable (Apache-2.0), informed the implementation; its combined license notices are preserved in `licenses/interface-guidance.txt`.
