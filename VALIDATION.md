# Validation record

Validated October 19, 2026. These are worker-run checks, not independent certification. The final production export was served beneath `/preview/`; it requires no external assets or runtime data requests.

## Acceptance coverage

| Requirement | Result | Evidence |
| --- | --- | --- |
| Usable website and working primary interactions | Met | 21/21 Chromium interaction checks in `scripts/validate.mjs` |
| Dark green, Pepes armed with AI | Met | Forest tokens and locally drawn `public/images/pepe-operators.svg`; rendered artwork inspected |
| Top tweets about identity.md | Met with disclosed data scope | Eight real, source-linked summaries; captured-like ranking within the selection; no invented live stream |
| Source, lockfile and static export | Met | React/TypeScript source, `package-lock.json`, Vite relative base and complete `dist/` |
| Production build and typecheck | Passed | `npm run build`, `npm run typecheck`, both exit 0 |
| Product/main action on first phone screen | Met | At 390 × 844, search/topics and first entire post are visible; first card y=528–817.8 |
| Required metadata and real image | Met | Title, favicon, description, og:title, og:image and 1200 × 630 PNG checked |
| Six-domain review and design documentation | Met | Review below; final source tokens/components in root `DESIGN.md` |
| Install, preview and rebuild instructions | Met | Root `README.md` |

## Actual checks

- **TypeScript:** `npm run typecheck` passed, no diagnostics.
- **Production:** `npm run build` passed. Final Vite build emitted one approximately 246 kB JavaScript bundle and one approximately 20 kB stylesheet, plus local public assets. No source maps or dependency archives are delivered.
- **Interactions:** `npm run validate:ui` with the available external Playwright module passed **21 tests, 0 failed** in Chromium. The script is included. It tested content, category totals, author/text/handle search, combined filters, empty/reset states, all three sorts, bookmarking, reload persistence, saved removal, back/forward navigation, dialog dismissals, keyboard focus, link construction, clipboard success/denial, sidebar topics, storage denial and reduced motion.
- **Static subpath and network:** runtime was served at `/preview/`, external requests were blocked, and all local assets and the Manrope font loaded. No script errors, missing local resources or attempted external runtime requests were observed. External hyperlinks were checked as URLs; they were not all followed through sign-in.
- **Responsive:** no horizontal overflow at 320, 390, 620, 720, 820, 1050 and 1440px. A long uninterrupted empty-state query wrapped at 320px. 720px supplies a desktop narrow-viewport check; it is not a claim of a native browser zoom test.
- **Pinned taste@1:** ran the supplied `design-critic/scripts/taste.mjs` against `dist/` using the provided Playwright/Chromium runtime and `--out test/scratch/taste --offline`. Final result **16/16 passed**: render, layout, targets, contrast, casing, tracking, eyebrows, type-sizes, type-faces, glyphs, slogans, repetition, copy-budget, chrome, motion and share.
- **Rendered inspection:** viewed production screenshots at 390px and 1440px, the 320px full-page capture, the mobile dialog and the generated PNG share card. The 390px image confirms the first full summary and actions fit above the fold. The illustration no longer covers introduction text. Full-page screenshots and measurements are disposable under `test/scratch/` and are not required runtime files.
- **Automated accessibility:** axe-core 4.10.3, WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags. Feed audits at 320, 390 and 1440 reported **0 violations**; the open dialog at 390 reported **0 violations**. Final mobile feed/dialog audits had no incomplete results. The desktop about heading required manual color review; its rendered pair measured 13.36:1, and the pinned contrast probe also passed.

## Better Interface: six-domain review

| Domain | Coverage and disposition | Final source |
| --- | --- | --- |
| Accessibility | Native controls, persistent input label, landmarks/headings, named icon actions, skip link, polite status messages, keyboard activation, modal focus loop/restoration, reduced motion and recoverable clipboard/storage failure states checked. Axe found no tested WCAG violations. Screen readers and real assistive devices were not tested. | `src/App.tsx:58`, `src/App.tsx:172`, `src/styles.css:363`, `src/styles.css:1393` |
| Layout | Controls precede the feed; mobile first screen, sidebar relocation, seven viewport widths, long query wrapping and source-card spacing checked. Hero collision was repaired and visually rechecked. Native 200% zoom, RTL and pseudo-localization were not performed. | `src/styles.css:232`, `src/styles.css:285`, `src/styles.css:1088` |
| Writing | Labels match their actions; empty/error states supply recovery; snapshot, summaries, ranking scope, relative ages, storage scope and X search links are explicitly explained. No invented tweets, metrics, account or live integration. | `src/posts.ts`, `src/App.tsx:172`, `src/App.tsx:492` |
| Typography | Local Manrope loaded; computed family and weights verified. Six desktop sizes including one-off headings; five on phones. Three weights, input at 16px, body at 14/16px, readable line-height and no critical truncation. | `src/styles.css:1`, `src/styles.css:31`, `src/styles.css:566` |
| Colors | Shared semantic aliases, solid card backgrounds and selected/focus states reviewed. Actual contrast measured below. Dark-only direction preserved. Artwork color contrast is decorative and was visually reviewed; no text is placed on the illustration. | `src/styles.css:8`, `src/styles.css:423` |
| UI | Quiet bordered surfaces without shadows; consistent icon controls, appropriate copy icon, pressed/saved/focus states, native select/dialog and restrained 150ms transitions checked. No endless motion. Real touch devices and slowed browser Animations-panel inspection were not performed. | `src/App.tsx:58`, `src/styles.css:210`, `src/styles.css:547`, `src/styles.css:894` |

## Findings repaired

1. **Mobile artwork crowded the introduction.** Source: `src/styles.css:1135` and `src/styles.css:1353`. Early 390px screenshot showed illustration details behind the description. Shortened the description and allocated separate artwork/text widths, including a smaller 150px illustration at 320px. Final screenshots confirm separation.
2. **Modal Tab sequence could leave its controls.** Source: `src/App.tsx:194`. Chromium's native sequence moved from the last button toward browser chrome. Added explicit forward/reverse Tab wrapping. The interaction suite confirms focus remains inside and returns to the trigger on Escape; all four dismiss actions pass.
3. **Engagement label had no semantic group.** Source: `src/App.tsx:118`. The first axe audit marked `aria-label` on a generic div for review. Added `role="group"`; the final audit has no remaining ARIA incomplete results.
4. **Post source age disappeared on phones.** Source: `src/App.tsx:89`. Moved the captured age into the always-visible summary line, so mobile visitors can interpret the source-age sort.
5. **Copy shortcut used an external-link symbol.** Source: `src/App.tsx:140`. Replaced it with a copy icon, retaining the descriptive accessible name and recovery message.
6. **Bookmark target was smaller than the preferred touch target.** Source: `src/styles.css:547`. Raised shared icon controls to 44px. The final probe passes WCAG target spacing; 37 compact author/source/metadata controls remain below 44px, which the probe reports without failing.

All applicable observed findings above were corrected before the final build and rechecked. No confirmed blocking design or interaction findings remain in the tested Chromium states.

## Rendered contrast measurements

Computed foreground and opaque ancestor background were collected from the final render; ratios use WCAG relative luminance.

| Element | Foreground / background | Ratio |
| --- | --- | --- |
| Post summary | `#edf2df` / `#0d2219` | 14.58:1 |
| Source and summary metadata | `#94ab97` / `#0d2219` | 6.77:1 |
| Primary button | `#081b13` / `#c1f76b` | 14.27:1 |
| About heading | `#edf2df` / `#112a1f` | 13.36:1 |
| Sort control | `#b0bfae` / `#081b13` | 9.27:1 |
| Selected topic | `#c1f76b` / `#081b13` | 14.27:1 |

## Package budget

The deliverable, including source, lockfile, all runtime assets, export and documentation, measures approximately **0.69 MiB uncompressed**, well below 8 MiB. Generated dependencies and disposable checks are ignored; `dist/` is included. No submodules or dependency archives are present.

## Limitations

WebKit could not launch because its browser executable was unavailable. Safari/WebKit interactions and screenshots are **not verified**. No claim is made for real iPhone behavior, screen-reader output, native browser zoom, RTL translation, forced-colors rendering or automated testing of every dialog scroll position.

The X dataset is a selected static snapshot from two public mirror profiles, not an exhaustive X search or a current ranking. A mirror can be stale and authors can edit/delete posts. No stable tweet IDs were invented. Every original-search link explicitly goes to X search; external X sign-in and later source availability remain outside the static site's control. Bookmark state is local to the browser and cross-device sync is not implemented.

The dedicated browser connector was unavailable; browser validation and screenshots were performed with the available local Playwright Chromium runtime instead. The structural verifier does not independently establish any behavioral claims in this record.
