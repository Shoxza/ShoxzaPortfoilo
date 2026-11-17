# Shoxza Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the "pit wall" portfolio for shoxza.no as a static Vite + vanilla TypeScript site on Vercel.

**Architecture:** All content lives in typed data files. Pure render functions turn that data into HTML strings, and a small Vite plugin injects them into `index.html` at dev and build time, so the page is complete without JavaScript. A client bundle then enhances it: project selection and the mobile accordion, the Lanyard live ticker, and anime.js motion. CSS is plain, with design tokens as custom properties.

**Tech Stack:** Vite 7, TypeScript 5 (strict), Vitest + jsdom, anime.js v4, `@fontsource-variable/archivo` (self-hosted), Vercel static hosting, Lanyard (Discord presence API).

**Spec:** `docs/superpowers/specs/2026-11-18-portfolio-design.md` (visual references in `docs/superpowers/specs/2026-11-18-portfolio-refs/`). Read both before starting.

## Global Constraints

- No UI framework. Vanilla TypeScript only. Runtime dependencies are limited to `animejs` and `@fontsource-variable/archivo`.
- No server code, serverless functions, database or forms. The ticker calls Lanyard from the browser.
- Colour tokens (exact): asphalt `#1E1D1B`, kerb `#252421`, pit `#181715`, ticker `#161513`, chalk `#ECE8E1`, dust `#9A958C`, racing blue `#4781D7`, soft `#E5383B` (personal), medium `#F2C14E` (school), helmet deep blue `#2A4F8F`.
- Glow (exact): small `0 0 6px rgba(71,129,215,.7), 0 0 18px rgba(71,129,215,.32)`, large `0 0 18px rgba(71,129,215,.5), 0 0 64px rgba(71,129,215,.28)`. Only on: the name, the selected project title, live ticker values, graphic traces.
- Type: Archivo variable only (wdth 62–125, wght 100–900), tabular figures on. Display: wdth 125, wght 800–900, tracking −0.035em. No monospace, no all-caps labels, no `·` meta separators, no eyebrow labels above headings.
- Copy: sentence case. Hero says exactly "Junior developer". Never invent facts. Unknown content is omitted, never filled.
- Accessibility: WCAG AA contrast, keyboard operable, visible racing-blue focus ring, `prefers-reduced-motion` gives a still site.
- Budget: first load ≤ 150 KB transferred excluding fonts. JS ≤ 30 KB gzipped total.
- Breakpoint: mobile layout below 860 px.
- Launch gate: the site is not pointed at shoxza.no while `launchCheck()` reports anything missing.

## Review Focus

1. **Odd or partial Lanyard data:** no Spotify, no activities, unknown activity types, missing fields, the socket dropping mid-session. Expected: the ticker shows the time and "offline" or the last good values, never throws, never shifts layout. Tests in Task 5.
2. **A URL hash that isn't a project:** `#nope`, `#RaceAssistant` (wrong case), or empty. Expected: the first project is selected and no error. Tests in Task 4.
3. **Resizing across 860 px with a project open:** the selected project moves between the side feed and its accordion slot and stays selected. Tests in Task 4.
4. **Hostile or long text from Spotify** (`<b>`, `&`, 120-character titles): rendered as text, never HTML, and truncated with an ellipsis, with the full title in `title`. Tests in Task 5.
5. **JavaScript disabled or failing:** every project, crew role and contact link is visible and readable. Test in Task 2.

---

### Task 1: Repository, toolchain and content data

Connects the folder to GitHub, scaffolds Vite, and defines the typed content plus the launch gate.

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/data/types.ts`, `src/data/site.ts`, `src/data/launch.ts`, `src/styles/tokens.css`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces (in `src/data/types.ts`):
  - `type ProjectKind = 'personal' | 'school'`
  - `interface Link { label: string; href: string }`
  - `type Visual = { kind: 'lap-trace' } | { kind: 'image'; src: string; alt: string } | null`
  - `interface Project { slug: string; name: string; kind: ProjectKind; year: number; stack: string[]; description: string; features: string[]; role?: string; radio: string; links: Link[]; visual: Visual }`
  - `interface CrewRole { org: string; role: string; logo: { src: string; alt: string }; seasons: number[] }`
  - `interface Profile { handle: 'Shoxza'; number: 26; title: 'Junior developer'; location: 'Gjøvik, Norway'; email: string; linkedin: string; github: string; discordId: string }`
  - `interface Site { profile: Profile; projects: Project[]; crew: CrewRole[]; seasonsShown: number[] }`
  - `const PENDING = '__PENDING__'`
- Produces (in `src/data/site.ts`): `export const site: Site`
- Produces (in `src/data/launch.ts`): `launchCheck(site: Site): string[]`, which returns a human-readable list of missing inputs (empty = ready).

- [ ] **Step 1: Connect the repo.** In the project root (`C:\Users\benja\Desktop\Shoxfolio`) run `git init -b main` and `git remote add origin https://github.com/Shoxza/ShoxzaPortfoilo.git`. Write a `.gitignore` covering `node_modules/`, `dist/`, `.vercel/`, `.superpowers/`, `.impeccable/mocks/`, `.impeccable/review/`, `.impeccable/questions/`, `.impeccable/config.local.json` and `*.local`. Do not push. Pushing happens in Task 8 with the owner's go-ahead.

- [ ] **Step 2: Scaffold.**
  - Run `npm create vite@latest . -- --template vanilla-ts`, keeping existing files.
  - Remove the template's demo files (`counter.ts`, `typescript.svg`, demo CSS and markup).
  - Run `npm i animejs @fontsource-variable/archivo` and `npm i -D vitest jsdom @types/node`.
  - In `package.json`, add the scripts `"test": "vitest run"`, `"launch-check": "tsx scripts/launch-check.ts"` (plus `npm i -D tsx`) and `"budget": "node scripts/check-budget.mjs"`.
  - In `tsconfig.json`, set `"strict": true`.
  - In `vite.config.ts`, set `test: { environment: 'jsdom' }`.

- [ ] **Step 3: Write the failing tests** in `tests/data.test.ts`:

```ts
import { site } from '../src/data/site'
import { launchCheck } from '../src/data/launch'
import { PENDING } from '../src/data/types'

test('projects are in display order with unique lowercase slugs', () => {
  expect(site.projects.map(p => p.slug)).toEqual(['raceassistant', 'anti-f1-spoiler', 'poker-dice'])
})
test('kinds match the spec', () => {
  expect(site.projects.map(p => p.kind)).toEqual(['personal', 'personal', 'school'])
})
test('doomscroll-assist is never listed', () => {
  expect(JSON.stringify(site)).not.toMatch(/doomscroll/i)
})
test('crew seasons match the spec', () => {
  expect(site.crew.map(c => [c.org, c.role, c.seasons])).toEqual([
    ['Gjøvik Tech Racing', 'Web developer', [25, 26, 27]],
    ['Darling', 'Web committee leader', [26, 27]],
  ])
  expect(site.seasonsShown).toEqual([25, 26, 27])
})
test('launchCheck lists every pending input and nothing else', () => {
  const s = structuredClone(site)
  s.profile.email = PENDING; s.profile.linkedin = PENDING; s.profile.discordId = PENDING
  s.projects[2].radio = PENDING
  expect(launchCheck(s)).toEqual(['profile.email', 'profile.linkedin', 'profile.discordId', 'poker-dice.radio', 'poker-dice.features'])
})
test('launchCheck is empty when everything is filled in', () => {
  const s = structuredClone(site)
  s.profile.email = 'a@b.no'; s.profile.linkedin = 'https://linkedin.com/in/x'; s.profile.discordId = '1'
  s.projects.forEach(p => { p.radio = 'x'; if (!p.features.length) p.features = ['x'] })
  expect(launchCheck(s)).toEqual([])
})
```

- [ ] **Step 4: Run** `npm test`. Expected: FAIL, because the modules don't exist yet.

- [ ] **Step 5: Implement `types.ts`, `site.ts` and `launch.ts`.**
  - Fill `site.ts` with the spec §7.2 table and §7.3 crew, verbatim. Radio lines come from spec §7.4.
  - Anti F1 Spoiler features, from its README: `["Hides F1 content on YouTube and Instagram until you've watched the race", "Works in Firefox and Chrome/Edge from one TypeScript codebase"]`.
  - Poker Dice: `role: 'Full-stack, team project'`, `features: []`, `radio: PENDING`.
  - RaceAssistant: `visual: { kind: 'lap-trace' }`. Others: `visual: null`.
  - All `links: []`. `github: 'https://github.com/Shoxza'`. `email`, `linkedin` and `discordId` are `PENDING`.
  - Logos: `/sponsors/gtr.webp` (alt "Gjøvik Tech Racing") and `/sponsors/darling.svg` (alt "Darling"). Copy them from `docs/superpowers/specs/2026-11-18-portfolio-refs/` into `public/sponsors/`.
  - `launchCheck` reports every profile field equal to `PENDING`, every project whose `radio` is `PENDING`, and every project with empty `features`, in that order, using the key format shown in the tests.

- [ ] **Step 6: Add `scripts/launch-check.ts`.** It prints the `launchCheck(site)` list and exits 1 when the list isn't empty.

- [ ] **Step 7: Write `src/styles/tokens.css`.** Put the Global Constraints colours and glows in it as custom properties (`--asphalt`, `--kerb`, `--pit`, `--ticker`, `--chalk`, `--dust`, `--blue`, `--soft`, `--medium`, `--helmet-blue`, `--glow-sm`, `--glow-lg`). Import Archivo with `@fontsource-variable/archivo/wdth.css`, or the package's multi-axis file. Check its `package.json` exports and pick the file whose `@font-face` declares `font-stretch` 62%–125%.

- [ ] **Step 8: Run** `npm test` (expected: PASS) and `npm run build` (expected: exits 0).

- [ ] **Step 9: Commit.** Stage everything, including `PRODUCT.md`, `docs/` and `.impeccable/config.json` if present, and commit with the message `chore: scaffold vite + ts, content data and launch gate`.

---

### Task 2: Static page render (complete without JavaScript)

**Files:**
- Create: `src/render/escape.ts`, `src/render/header.ts`, `src/render/tower.ts`, `src/render/feed.ts`, `src/render/contact.ts`, `src/render/ticker.ts`, `src/render/page.ts`, `src/styles/base.css`, `src/styles/page.css`
- Modify: `vite.config.ts` (add the inject plugin), `index.html`
- Test: `tests/render.test.ts`

**Interfaces:**
- Consumes: `Site`, `Project`, `CrewRole` from Task 1.
- Produces:
  - `esc(s: string): string`
  - `renderPage(site: Site, helmetSvg: string): string`, the full `<body>` inner markup
  - `renderTower(site: Site): string`
  - `renderFeed(projects: Project[]): string`
  - `renderContact(p: Profile): string`
  - `renderTicker(): string`
- **DOM contract** that Tasks 4–6 rely on:
  - `<html class="no-js">`. An inline head script swaps it to `js`.
  - `h1#name.name` carries `style="--wdth:125"`.
  - Project rows: `ol.runs > li > button.run[data-slug="<slug>"][aria-controls="p-<slug>"]`.
  - Feed: `section#feed.feed > article.project#p-<slug>[data-slug="<slug>"]`.
  - Values that animate on change carry `[data-step]`.
  - Crew: `ul.crew > li.crew-role` with `ol.seasons > li[data-on="true|false"]`.
  - Contact: `section#contact`.
  - Ticker: `footer.ticker` containing `[data-t="status"]`, `[data-t="spotify"]`, `[data-t="game"]`, `[data-t="time"]`.

- [ ] **Step 1: Write the failing tests** in `tests/render.test.ts`. Each one parses `renderPage(site, '<svg id="helmet"></svg>')` into a jsdom document:
  - `rows in order with positions 1..3 and tyre class tyre--personal|tyre--school`
  - `every project has an article with description, data band (kind, stack joined ", ", year) and role when set`
  - `RaceAssistant article contains svg.lap-trace; others contain no visual element`
  - `radio box is omitted when radio === PENDING; shown with the exact text otherwise`
  - `links section is omitted when links is empty`
  - `crew rows: GTR seasons on=[25,26,27]; Darling 25 off, 26 and 27 on`
  - `contact omits email/LinkedIn while PENDING and always shows GitHub`
  - `no article or crew row carries the hidden attribute (readable without JS)` (Review Focus 5)
  - `text from data is escaped: a project named "<b>&" renders as text`
  - `hero contains exactly "Junior developer", "Gjøvik, Norway" and "#26"`
  - `nav has exactly Work → #work, Crew → #crew, Contact → #contact`
  - `the compound legend shows "Personal" and "School"`

- [ ] **Step 2: Run** `npm test -- render`. Expected: FAIL.

- [ ] **Step 3: Implement the render modules** to the DOM contract.
  - All interpolated data goes through `esc`.
  - Tyre icon: an inline `<svg class="tyre tyre--<kind>"><use href="#tyre"/></svg>`, with a single `<symbol id="tyre">` defined once in `renderPage`. Geometry: rubber circle r 15.6 `#121110`, compound band r 12.2 stroke 1.7 `currentColor`, rim r 9.6 `#2c2b28`, five spokes, hub r 2.6.
  - Lap-trace: the two polylines from `pitwall-v6.html`.
  - Compound legend text: "Personal" and "School".

- [ ] **Step 4: Add the Vite plugin** in `vite.config.ts`. `transformIndexHtml` replaces `<!--app-->` in `index.html` with `renderPage(site, helmetSvg)`, where `helmetSvg` is read from `src/assets/helmet.svg`. Until Task 3 lands, that file is a placeholder `<svg>`. Also add the inline head script `document.documentElement.className='js'`.

- [ ] **Step 5: Write `base.css` and `page.css`** to match the composition of `pitwall-v6.html` (header, tower plus feed grid, crew, contact, ticker), using tokens only.
  - Under `.no-js` and below 860 px, everything stacks in one column with all articles visible.
  - Under `.js`, only the selected article shows (Task 4 sets it).
  - Ticker values reserve their width (`min-width` and `text-overflow: ellipsis`), so updates never shift the layout.
  - Theme the browser surfaces: `::selection` uses blue at 35 % on chalk text, `:focus-visible` is a 2 px racing-blue outline with 3 px offset, and `scrollbar-color` uses dust on asphalt.

- [ ] **Step 6: Run** `npm test` (expected: PASS). Then run `npm run dev` and check the page in a browser with JavaScript disabled: all content should be readable.

- [ ] **Step 7: Commit** with the message `feat: static pit-wall page rendered from data`.

---

### Task 3: Helmet, favicons and metadata

**Files:**
- Create: `src/assets/helmet.svg`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og.png`, `scripts/og.html`
- Modify: `index.html` (head metadata)
- Test: `tests/meta.test.ts`

**Interfaces:**
- Consumes: the `helmetSvg` slot from Task 2.
- Produces: `src/assets/helmet.svg`, the full helmet as inline SVG with `role="img"` and `aria-label="Helmet number 26"`.

- [ ] **Step 1: Write the failing tests** in `tests/meta.test.ts`, reading `index.html` after `renderPage` injection (call the plugin's transform directly):
  - the `<title>` is exactly `Shoxza, junior developer`
  - a `meta[name=description]` exists
  - `og:image` is `/og.png` and `og:title` exists
  - `link[rel=icon]` is `/favicon.svg`, and an apple-touch-icon is present
  - `helmet.svg` contains `shoxza.no` and `26`, and no `<filter` with blur (the owner rejected the glow line)

- [ ] **Step 2: Run** `npm test -- meta`. Expected: FAIL.

- [ ] **Step 3: Build `helmet.svg`** from `docs/superpowers/specs/2026-11-18-portfolio-refs/helmet-26-v7.html`, using the "Deep blue" colourway (`--up:#2A4F8F; --band:#1E1D1B`).
  - Polish the silhouette: a stronger chin bar, and a visor that wraps toward the hinge.
  - Keep all parts: crown stripes, the outlined upper band holding the GTR logo, slanted lower bands, the chalk visor strip with "shoxza.no", the outlined 26 on the rear side, and darling in dark ink on the chin.
  - Inline the logos as `<image href="/sponsors/...">`. This works because the helmet is inlined in HTML, not used as an `<img>`.
  - Run it through SVGO-style cleanup by hand, removing unused defs. Keep it under 12 KB.
  - **If the owner has supplied a Firefly or Recraft helmet by now**, redraw from that instead and keep the same parts list.

- [ ] **Step 4: Make the icons.**
  - `favicon.svg`: the simplified mark (two-tone shell, visor, 26), as in the `h5s` symbol in the v7 reference, using deep blue.
  - `apple-touch-icon.png` (180×180) and `og.png` (1200×630, helmet plus "Shoxza / Junior developer" on asphalt): screenshot `scripts/og.html` with headless Edge, e.g. `msedge --headless=new --screenshot=public/og.png --window-size=1200,630 file:///…/scripts/og.html`.

- [ ] **Step 5: Add the head metadata** to `index.html`.

- [ ] **Step 6: Run** `npm test`. Expected: PASS. Look at the header in `npm run dev` at desktop and 390 px widths.

- [ ] **Step 7: Commit** with the message `feat: helmet #26 logo, favicons and metadata`.

---

### Task 4: Project selection and mobile accordion

**Files:**
- Create: `src/client/selection.ts`, `src/client/main.ts`
- Test: `tests/selection.test.ts`

**Interfaces:**
- Consumes: the DOM contract from Task 2.
- Produces:
  - `initSelection(root: Document, opts: { mobileQuery: MediaQueryList; onChange?: (slug: string) => void }): { select(slug: string): void; current(): string }`
  - `slugFromHash(hash: string, slugs: string[]): string`, which returns a valid slug or `slugs[0]`
  - `main.ts` wires everything on `DOMContentLoaded`.

- [ ] **Step 1: Write the failing tests** in `tests/selection.test.ts`. Load `renderPage(site, '')` into jsdom and use a fake `MediaQueryList` whose `matches` can be toggled and that fires `change`:
  - `initial selection is the first project when hash is empty`
  - `slugFromHash('#nope') → 'raceassistant'; slugFromHash('#RaceAssistant') → 'raceassistant'` (Review Focus 2)
  - `slugFromHash('#poker-dice') → 'poker-dice'`
  - `clicking a row shows only its article, sets aria-current on that row, updates location.hash`
  - `ArrowDown/ArrowUp move focus between rows and wrap; Enter/Space select`
  - `mobile: the selected article is moved directly after its row's li; desktop: it lives in #feed` (Review Focus 3)
  - `toggling the media query keeps the same project selected and moves the article`
  - `onChange is called with the new slug`

- [ ] **Step 2: Run** `npm test -- selection`. Expected: FAIL.

- [ ] **Step 3: Implement `selection.ts`.**
  - Non-selected articles get `hidden`.
  - Use `history.replaceState` for the hash so the back button isn't spammed.
  - Listen to `hashchange`.
  - On mobile, `li.after(article)`. On desktop, `#feed.append(article)`.
  - In `main.ts`, call it with `matchMedia('(max-width: 859px)')`.

- [ ] **Step 4: Run** `npm test`. Expected: PASS. Then try it in `npm run dev`: keyboard only, a resize across 860 px, and a direct link to `/#anti-f1-spoiler`.

- [ ] **Step 5: Commit** with the message `feat: project selection, deep links and mobile accordion`.

---

### Task 5: Live ticker (Lanyard)

**Files:**
- Create: `src/client/ticker/state.ts`, `src/client/ticker/lanyard.ts`, `src/client/ticker/view.ts`
- Modify: `src/client/main.ts`
- Test: `tests/ticker.test.ts`

**Interfaces:**
- Consumes: `site.profile.discordId`, and the ticker DOM contract from Task 2.
- Produces:
  - `interface TickerState { status: 'online' | 'offline'; spotify: { song: string; artist: string } | null; game: string | null }`
  - `toTickerState(presence: unknown): TickerState`, a pure function over Lanyard's `data` object
  - `formatOsloTime(d: Date): string`, giving `HH:MM` in `Europe/Oslo`
  - `connectLanyard(id: string, onState: (s: TickerState) => void, deps?: { WebSocket?: typeof WebSocket; fetch?: typeof fetch }): () => void`, which returns a disconnect function
  - `renderTickerState(root: Document, s: TickerState): void`

- [ ] **Step 1: Write the failing tests** in `tests/ticker.test.ts`.

  `toTickerState`:
  - `discord_status 'online' | 'idle' | 'dnd' → 'online'; 'offline' or missing → 'offline'`
  - `game is the name of the first activity with type 0 only; type 2 (Spotify), 4 (custom status) and others are ignored` (Review Focus 1)
  - `spotify maps {song, artist} when listening_to_spotify is true, else null`
  - `garbage input (null, {}, a string, missing arrays) → {status:'offline', spotify:null, game:null}`

  `formatOsloTime(new Date('2026-11-18T23:24:00Z'))`:
  - `→ '00:24'`
  - summer time: `'2026-07-01T10:05:00Z' → '12:05'`

  `renderTickerState`:
  - `a song "<b>&" by "x" is rendered via textContent (no element created)`
  - `the full song text is in title` and the cell has the truncation class (Review Focus 4)
  - `offline renders status "offline", hides spotify and game cells, keeps time`

  `connectLanyard` (mock WebSocket and fetch):
  - `sends {op:2, d:{subscribe_to_id:id}} after op 1 Hello and heartbeats {op:3} every heartbeat_interval`
  - `INIT_STATE and PRESENCE_UPDATE events call onState(toTickerState(d))`
  - `on socket close it falls back to GET https://api.lanyard.rest/v1/users/<id> and retries the socket with backoff (1s, 2s, 4s… max 30s)`
  - `a failing fetch calls onState with offline and never throws`

- [ ] **Step 2: Run** `npm test -- ticker`. Expected: FAIL.

- [ ] **Step 3: Implement the three modules** to the interfaces.
  - The display text for Spotify is `"<song> by <artist>"`.
  - In `main.ts`:
    - if `discordId === PENDING`, render offline and don't connect;
    - otherwise, connect;
    - always update the time every 30 s.

- [ ] **Step 4: Run** `npm test`. Expected: PASS.

- [ ] **Step 5: Commit** with the message `feat: live ticker via Lanyard with games-and-Spotify filter`.

---

### Task 6: Motion (anime.js)

**Files:**
- Create: `src/client/motion.ts`, `src/styles/motion.css`
- Modify: `src/client/main.ts`, `src/client/selection.ts` (call `stepText` via `onChange`), `src/client/ticker/view.ts` (use `stepText` for value changes)
- Test: `tests/motion.test.ts`

**Interfaces:**
- Produces:
  - `prefersReducedMotion(win?: Window): boolean`
  - `launchName(el: HTMLElement, opts?: { reduced?: boolean }): void`, which animates `--wdth` from 62 to 125 over 1200 ms with an expo-out ease. Reduced motion sets 125 immediately.
  - `stepText(el: HTMLElement, next: string, opts?: { reduced?: boolean }): void`, which slides the old text out and the new text in by one line height with a single overshoot (anime.js `outBack(1.4)`, 380 ms). Reduced motion swaps the text instantly.

- [ ] **Step 1: Write the failing tests** in `tests/motion.test.ts`, mocking `animejs` with `vi.mock`:
  - `reduced: launchName sets --wdth to 125 and never calls animate`
  - `not reduced: launchName calls animate once targeting --wdth 62→125, 1200ms`
  - `stepText ends with el.textContent === next in both modes`
  - `stepText reduced never calls animate`

- [ ] **Step 2: Run** `npm test -- motion`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - Import only the named functions from `animejs` so it tree-shakes.
  - In `motion.css`:
    - the tyre spin on `.run:hover .tyre, .run:focus-visible .tyre` (one turn, 1.1 s, `cubic-bezier(.2,.7,.1,1)`);
    - a panel swap in 180 ms as an opacity and 6 px translate;
    - all of it disabled under `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Run** `npm test` (expected: PASS). Run `npm run build && npm run budget` (expected: JS gzip ≤ 30 KB).

- [ ] **Step 5: Commit** with the message `feat: name launch, step readouts and tyre spin`.

---

### Task 7: Quality pass and budget check

**Files:**
- Create: `scripts/check-budget.mjs`
- Modify: any CSS or render file the checks flag
- Test: the budget script itself acts as the gate

**Interfaces:**
- Produces: `npm run budget`, which exits 1 when gzipped JS over `dist/assets/*.js` is > 30 KB, or when the total gzipped size of `dist/` excluding `*.woff2` is > 150 KB. It prints both numbers.

- [ ] **Step 1: Write `scripts/check-budget.mjs`** using `node:zlib` `gzipSync`. Run `npm run build && npm run budget`. Expected: it prints the sizes and exits 0.

- [ ] **Step 2: Run the impeccable detector** once on the built page: `C:/Users/benja/.claude/skills/impeccable/scripts/impeccable detect --json dist/index.html src/styles`. Fix the mechanical findings.

- [ ] **Step 3: Contrast audit.** Check each text/ground pair in the tokens (chalk and dust on asphalt, kerb, pit and ticker, plus links). Every pair must be ≥ 4.5:1. Raise `--dust` lightness if a pair fails, and note the new value in the spec's token table.

- [ ] **Step 4: Visual check at 1440, 1024, 390 and 360 px** with `npm run preview`.
  - Check overlap, clipping, focus visibility, a long Spotify title, the offline ticker, and every project selected.
  - Fix what you find in one batch, then recheck once.

- [ ] **Step 5: Commit** with the message `chore: budget gate, contrast and responsive fixes`.

---

### Task 8: Deploy to Vercel and launch

This is mostly owner actions. Each one needs the owner's explicit go-ahead.

**Files:**
- Create: `vercel.json`, with `{ "cleanUrls": true, "headers": [ long-cache for /assets/(.*) ] }`
- Modify: `src/data/site.ts` (fill in the owner's inputs)

- [ ] **Step 1: Fill in the inputs.** Put the owner's email, LinkedIn URL, Discord user ID, Poker Dice radio line and confirmed Poker Dice features into `site.ts`. Run `npm run launch-check`. Expected: exits 0 with an empty list. **Stop here and report what's missing if it doesn't.**

- [ ] **Step 2:** Confirm with the owner that their Discord shows "Playing" and Spotify with activity status on, and that they've joined the Lanyard Discord server. Check `https://api.lanyard.rest/v1/users/<id>` returns `success: true`.

- [ ] **Step 3: Push** to `origin main`. **This needs the owner's go-ahead first.**

- [ ] **Step 4: Owner connects Vercel.** In the Vercel dashboard, the owner imports `Shoxza/ShoxzaPortfoilo`. Framework preset Vite, build `npm run build`, output `dist`. They check the preview URL.

- [ ] **Step 5: Owner adds the domain.** In Vercel they add `shoxza.no` and `www.shoxza.no`, then set the DNS records Vercel shows at their registrar. Verify HTTPS and that `www` redirects to the apex.

- [ ] **Step 6: Smoke test on the live domain.** Check desktop and phone, a deep link to `/#poker-dice`, the live ticker updating, and favicon and OG preview (paste the link into Discord to see the card).

- [ ] **Step 7: Commit** any final data with the message `chore: launch content`, and push once the owner says go.
