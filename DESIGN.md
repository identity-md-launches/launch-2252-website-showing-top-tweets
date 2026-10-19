# Swarm Signal design

## Overview

Swarm Signal is a reading board for people following identity.md's builders, ideas and community. The requested dark green and “Pepes armed with AI” direction appears in a forest palette and an original vector illustration of two Pepe operators with a circuit-powered blaster and coding laptop.

The feed is the product. A compact introduction precedes search, topic filters and source-linked posts. An informational sidebar adds context on wide screens and moves after the complete feed on phones. Nothing requires a wallet, account or backend.

Source of truth: `src/styles.css`, components in `src/App.tsx`, data in `src/posts.ts`, and local assets in `public/`. Browser measurements and review coverage are recorded in `VALIDATION.md`.

## Colors

`src/styles.css:8` defines hex primitives and semantic aliases. Components use the semantic names.

| Semantic token | Value | Use |
| --- | --- | --- |
| `--bg` | `#081b13` | Page, header and primary-action text |
| `--surface` | `#0d2219` | Posts, search and dialog |
| `--surface-raised` | `#112a1f` | About panel and subtle hover areas |
| `--hover` | `#193627` | Pressed/saved feedback and quiet counters |
| `--border` | `#304b39` | Structural dividers and field/card borders |
| `--text` | `#edf2df` | Headings and post summaries |
| `--muted` | `#b0bfae` | Supporting copy, navigation and links |
| `--subtle` | `#94ab97` | Captured metrics and source metadata |
| `--accent` / `--focus` | `#c1f76b` | Primary action, selected topics, saved state and keyboard ring |
| `--accent-hover` | `#d1ff88` | Primary-action hover |

Avatar colors are illustrative identifiers in `.avatar-*`, not status colors. The site deliberately has one dark theme. Selected states also have an underline, filled bookmark or `aria-pressed` state.

Measured rendered pairs: post text/surface **14.58:1**; source metadata/surface **6.77:1**; primary-action text/accent **14.27:1**; about heading/raised surface **13.36:1**. These are measurements of the final Chromium render, not estimates of other devices.

## Typography

The local variable Manrope font is `public/fonts/manrope-latin.woff2`, with Arial and sans-serif fallbacks. `@font-face` declares its 200–800 range; the interface uses only **400, 600 and 800**. Actual font loading was checked in Chromium.

| Token | Size | Role |
| --- | --- | --- |
| `--text-caption` | 12px / .75rem | Metadata, source links, compact phone filters |
| `--text-small` | 14px / .875rem | Supporting copy, author names, desktop controls, phone post text |
| `--text-body` | 16px / 1rem | Desktop post text, search input at every width |
| `--text-section` | 20px / 1.25rem | Feed/dialog headings and wordmark |
| `--text-title` | 32px / 2rem | About heading and phone hero |
| `--text-display` | 56px / 3.5rem | Desktop hero |

The hero uses 1.06 line height and −.055em tracking, changing to 1.08 / −.045em on phones. Post prose uses 1.7 line height and a 68ch maximum measure. Supporting copy uses 1.6–1.7. Metadata uses the base 1.5. Tight tracking is reserved for headings and the wordmark. Changing counts use tabular numerals. Long names and search queries wrap; meaningful values are not ellipsized.

## Layout

The header and page shell have a maximum outer width of **1256px** and 28px inline padding. At wide widths, the feed shares a grid with a **306px sidebar**, separated by **38px**. Main alignment comes from `.page-shell` and `.content-layout`, not independent margins on each post.

Spacing uses recurring 4, 8, 12, 16, 20, 24, 28 and 32px steps, with small optical adjustments in author rows and card padding. Posts are separated by 14px on desktop and 12px on phones. The full introduction is 284px minimum on wide screens and 195px on phones.

Implemented breakpoints:

- **1050px:** sidebar narrows to 270px, grid gap to 24px, illustration to 460px.
- **820px:** feed becomes one column; the sidebar moves below it in a two-column arrangement. The About header control is removed because collection notes remain available by the feed.
- **620px:** 18px page margins, compact 32px hero, separate 205px operator illustration, full-width feed and a stacked sidebar. Header keeps the brand and Saved control. Primary reading actions remain beside the feed. The external identity.md link remains in the about panel.
- **360px:** 14px margins, 150px illustration, compact wordmark and metrics. The redundant copy shortcut is hidden; Find on X remains available.

Controls precede what they change. Search has a persistent visible label. At 390 × 844, the first card begins at y=528 and ends at approximately y=818, including its source and original-search actions. Overflow was checked at 320, 390, 620, 720, 820, 1050 and 1440px.

## Elevation & Depth

The system is flat: tonal surfaces and 1px borders define structure, with no card shadows or nested surface cards. The only overlay is the native collection dialog. Its backdrop is translucent dark green with a 4px blur; the native top layer puts it above the page. The hero illustration has its own drawn grid, which does not extend behind interface text.

## Shapes

Search and primary buttons use 7px radii, post/about surfaces 10px, the dialog 14px, counters 5px and avatar identifiers a circle. Icon controls use a subtle 5px hover shape. The illustration's visual frame is part of the SVG artwork, not a container around the reading interface.

## Components

### `PostCard` — `src/App.tsx:58`

Takes a `Post`, its captured-like rank, saved state and save/copy callbacks. It renders topic, source age, author link, summary, read-only engagement and source/search actions. Monograms distinguish authors without suggesting verified portraits. The displayed rank stays tied to the collection's like ranking even when another sort is selected.

Bookmarks have an accessible action name, `aria-pressed` and a filled selected icon. Saving updates both the card and header count. Removing a saved card moves focus to the next bookmark or the empty-state action.

### Feed controls — `src/App.tsx:492`

The search field matches summaries, people, handles and topic text. A clear control restores focus to the field. Topic buttons form a native button group using `aria-pressed`, rather than custom tabs that would require arrow-key behavior. A native select offers likes, relative source age and reposts. Result changes are announced through a polite status region.

### Empty and unavailable states — `src/App.tsx:571`

An empty saved list explains the bookmark action and links to the feed. An unmatched search names the query and offers Clear filters. Storage failure explicitly changes persistence to the current visit. Copy failure points to the adjacent Find on X action. No fake loading or live-refresh state is displayed for static data.

### `CollectionDialog` — `src/App.tsx:172`

A native modal dialog explains collection selection, source limitations, original-search links and browser-local saved state. Focus starts on Close; Tab and Shift+Tab cycle through its controls. Escape, Close, backdrop and Back to the feed dismiss it. Native modal behavior blocks interaction with the background and returns focus to the trigger. Content scrolls within an 85dvh maximum, changing to 88dvh on phones.

### Shared controls and icons — `src/styles.css`

`.primary-button` is the lime filled action. `.icon-button` is normally 44 × 44px; the compact copy shortcut is smaller on phones and removed at the narrowest width. Small author/source links retain their distinct reading zones and passed the probe's target-spacing check. Focus-visible uses a 2px lime outline with a 4px offset; the search field also changes its border on focus.

Lucide icons use `currentColor`. Hover states are gated by `(hover: hover)`. Interactive transitions name only color, background and transform, use 150ms and `cubic-bezier(.2,0,0,1)`. Buttons press to 0.96 scale. Reduced motion removes transitions and press transforms. There is no autoplay or endless animation. Forced-colors rules preserve selected outlines and button boundaries; real assistive-device testing is not claimed.

## Do's and Don'ts

- Start new reading sections inside `.page-shell`; reuse feed width and source/summary patterns.
- Keep source dates, selection rules and captured metrics clear. Add entries through `src/posts.ts` and verify their sources.
- Use the existing six type tokens and three weights. Keep input text at 16px on phones.
- Reuse the lime primary action and quiet secondary controls; keep saved/selected states recognizable without color alone.
- Preserve local font/art assets, relative paths and hash navigation when adding another view.
- Do not present this snapshot as a live or comprehensive X ranking, use invented engagement, or turn the read-only metrics into simulated X actions.

For another view, add a hash state in `App`, reuse the heading/control layout, supply a recoverable empty state, and check its first screen at 390px before rebuilding the complete `dist/` export.

Design guidance credits and licenses are retained in `licenses/interface-guidance.txt`.
