# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static `/about` page, with a journey-circuit map of Ben's life and five interactive fact toys, to the existing Vite + vanilla TS portfolio.

**Architecture:**
- About content lives in a typed data file. Pure render functions build `about.html` at build time through the existing inject plugin, now page-aware, so the page is complete without JavaScript.
- A separate client entry, `src/client/about/main.ts`, adds the map highlighting, the line draw and the toys. It reuses the shared ticker and motion code.

**Tech Stack:** Vite 8 multi-page build, TypeScript 7, Vitest + jsdom, anime.js v4 (already installed). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-18-about-page-design.md`, which builds on `docs/superpowers/specs/2026-11-18-portfolio-design.md`. Read both.

## Global Constraints

- No new runtime dependencies. No backend. Distance is computed in the browser only, and nothing is sent anywhere.
- Every fact is readable without clicking and without JavaScript. Toys are extras on top.
- No team logos, and no drawn dog. Piper gets a photo only if `pet.photo` is set.
- Copy is exact as in spec §5–6. The intro line is exactly `Junior developer from Norway`. The heading is exactly `Ben Hughes Tretnes`.
- Main-spec tokens, type and glow rules apply (`src/styles/tokens.css`). Respect `prefers-reduced-motion`. Every toy is a native `<button>`.
- Budget: `npm run budget` must pass with both pages built (JS ≤ 30 KB gzipped total, page load ≤ 150 KB excluding fonts).
- Nav on both pages is exactly: Work, Crew, About, Contact.

## Review Focus

1. **Geolocation denied, timed out, or unsupported** (`navigator.geolocation` undefined). Expected: the friendly fallback message, no throw, and the button usable again. Tests in Task 4.
2. **Rapid repeated taps** on Throw the ball or Draw a card. Expected: one ball in flight at a time, one message, and alternation that stays correct. Tests in Task 4.
3. **Arriving on the main page from About's nav** (`/#crew`, `/#contact`). Expected: the main page scrolls to that section and selection doesn't steal the hash. This is already covered by the existing selection test "a hash that is not a project…". Task 1 adds an assertion that the About nav links use these exact hrefs.
4. **Reduced motion:** every toy still gives its result instantly (text appears, the line is shown drawn, the card shows its face). Tests in Tasks 3 and 4.
5. **Keyboard only:** every stop and every toy is reachable and operable, and the arrow keys walk the stops in route order. Tests in Tasks 2 and 3.

---

### Task 1: Two-page build and shared chrome

**Files:**
- Modify: `src/render/header.ts`, `src/render/page.ts`, `src/build/inject.ts`, `vite.config.ts`
- Create: `about.html`, `vercel.json`, `src/client/about/main.ts` (stub entry)
- Test: `tests/render.test.ts` (nav test updated), `tests/pages.test.ts`

**Interfaces:**
- Produces:
  - `type Page = 'home' | 'about'`, in `src/render/header.ts`
  - `renderHeader(p: Profile, helmetSvg: string, page: Page): string`. The `home` variant keeps today's hero. The `about` variant is a compact bar: the helmet at about 72 px, then "Shoxza" in small text, then the nav, with no big hero.
  - `renderNav(page: Page): string`, which builds the nav for the given page:
    - `home`: Work `#work`, Crew `#crew`, About `/about`, Contact `#contact`.
    - `about`: Work `/#work`, Crew `/#crew`, About `/about` with `aria-current="page"`, Contact `/#contact`.
  - `injectPage(html: string, page: Page): string`. The plugin derives `page` from the transform context path (`/about.html` → `about`, anything else → `home`).

- [ ] **Step 1: Write failing tests.**
  - In `tests/render.test.ts`, change the nav test to expect `[['Work','#work'],['Crew','#crew'],['About','/about'],['Contact','#contact']]`.
  - Create `tests/pages.test.ts`:
    - `about nav links back to main-page sections and marks About current`. Expect, from `renderNav('about')`: `[['Work','/#work'],['Crew','/#crew'],['About','/about'],['Contact','/#contact']]`, and `aria-current="page"` on About only.
    - `injectPage(html, "about") fills the slot with the about page, not the home page`. The result contains `id="about"` and not `id="feed"`. Use a stub `about.html` string with `<!--app-->`.
    - `about.html exists, has the app slot, the about client entry and the shared stylesheet`. Read the file: it contains `<!--app-->`, `/src/client/about/main.ts` and `/src/styles/index.css`.
    - `vercel.json enables cleanUrls`.
- [ ] **Step 2: Run** `npx vitest run render pages`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `renderPage(site, helmet)` passes `'home'` to `renderHeader`.
  - Add a placeholder `renderAboutPage` that returns `<main id="about"></main>`. Task 2 replaces it.
  - `injectPage` switches on `page`.
  - In `vite.config.ts`, set `build.rollupOptions.input = { main: 'index.html', about: 'about.html' }`, and have the plugin handler `(html, ctx) => injectPage(html, ctx.path.endsWith('about.html') ? 'about' : 'home')`.
  - `about.html` gets the same `<head>` as `index.html`, with title `About Ben Hughes Tretnes, Shoxza`, its own description, and `og:url` `https://shoxza.no/about`.
  - `vercel.json` is `{ "cleanUrls": true, "headers": [{ "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }] }`.
- [ ] **Step 4: Run** `npm test` and `npm run build`. Expected: all tests PASS, and `dist/about.html` exists.
- [ ] **Step 5: Commit** with the message `feat: two-page build with shared header and About nav`.

---

### Task 2: About data and static render

**Files:**
- Create: `src/data/about.ts`, `src/render/about/page.ts`, `src/render/about/journey.ts`, `src/render/about/toys.ts`, `src/render/about/monaco.ts`, `src/styles/about.css` (imported from `index.css`)
- Test: `tests/about-render.test.ts`

**Interfaces:**
- Produces, in `src/data/about.ts`:
  - `interface Stop { id: 'ni' | 'vestnes' | 'gjovik' | 'berlin' | 'india'; name: string; line: string; status: 'driven' | 'next' }`
  - `interface Ticket { team: string; league: 'Hockey' | 'NBA' | 'MLB'; fact: string; colors: [string, string] }`
  - `interface About { name: string; intro: string; stops: Stop[]; setup: { wheel: string; sims: string[]; track: string }; tickets: Ticket[]; gameNight: { text: string; games: [string, string] }; pet: { name: string; breed: string; photo?: { src: string; alt: string } }; gjovik: { lat: number; lon: number } }`
  - `export const about: About`. All values are verbatim from spec §5–6, and `gjovik = { lat: 60.7957, lon: 10.6915 }`.
- Produces, in `src/render/about/monaco.ts`:
  - `MONACO_CORNERS: { name: string; x: number; y: number }[]`: the 13 corners in lap order, from Sainte Dévote to Anthony Noghès, in a 0–100 coordinate space.
  - `monacoSvg(): string`
- Produces, in `src/render/about/page.ts`: `renderAboutPage(about: About, site: Site, helmetSvg: string): string` (header, `main#about`, ticker). Task 1's placeholder now delegates to it.
- **DOM contract** that Tasks 3 and 4 rely on:
  - Map: `section#journey` contains `svg.journey`, which contains `path.racing-line` (the driven part, Berlin included) and `path.racing-line--next` (dashed, to India). Each stop is a `button.stop-btn[data-stop=<id>]`, absolutely positioned over its corner. The car is `.car` at Gjøvik.
  - Stop list: `ol.stop-list > li[data-stop=<id>]`, containing `<strong>` with the name and `<span>` with the line.
  - Setup: `section#setup`, with a `dl` of Wheel, Sims and Favourite track, plus `svg.monaco` and `p.corner-name[aria-live=polite]`.
  - Tickets: `section#tickets > ul > li > button.ticket[aria-pressed=false]`, each containing `.front` (team plus fact) and `.back` (league), with `style="--c1:…;--c2:…"`.
  - Game night: `section#game-night`, with `p.game-text`, `button.draw` and `div.card[aria-live=polite]`.
  - Piper: `section#piper`, with `button.throw`, `.ball` and `p.fetch-msg[aria-live=polite]`, plus an `img` only when a photo is set.
  - Distance: `section#distance`, with `button.locate` and `p.distance-out[aria-live=polite]`.

- [ ] **Step 1: Write failing tests** in `tests/about-render.test.ts`. Mount `renderAboutPage(about, site, '<svg id="helmet"></svg>')`.
  - `heading is exactly "Ben Hughes Tretnes" with "#26" and "Shoxza" beside it, intro exactly "Junior developer from Norway"`
  - `stops in route order with exact lines`. Expect ids `['ni','vestnes','gjovik','berlin','india']`. Lines must match spec §5.2 verbatim, e.g. gjovik = `'Studying web development at NTNU. Web developer for Gjøvik Tech Racing, web committee leader at Darling.'` and india = `'Next corner: bachelor thesis, from January 2027.'`
  - `only India is "next"; Berlin is driven`. Check `data-status` on `.stop-btn`.
  - `the stop list shows every stop's line without JS`
  - `every stop and every toy control is a native button`. Count: 5 `.stop-btn`, 3 `.ticket`, plus `.draw`, `.throw`, `.locate`.
  - `all facts are in the static text`. The page text contains: `Logitech G29`, `Assetto Corsa Competizione`, `Le Mans Ultimate`, `Monaco`, `I've been to a Padres game.`, `My NBA team.`, `Local hockey in Gjøvik.`, `Exploding Kittens`, `Horrible Therapist`, `Piper`, `Jack Russell`.
  - `no images in tickets (no logos) and no image on Piper without a photo; one img with alt when photo is set`
  - `Monaco has 13 corners from Sainte Dévote to Anthony Noghès`
  - `data text is escaped` (set `about.name = '<b>'` on a clone).
- [ ] **Step 2: Run** `npx vitest run about-render`. Expected: FAIL.
- [ ] **Step 3: Implement the data and render modules** to the contract.
  - Journey geometry is the builder's call (spec §9), in the circuit style of `docs/superpowers/specs/2026-11-18-portfolio-refs/lap-direction.png`: asphalt band, corner kerbs, the racing-blue line, Berlin as a short detour loop off Gjøvik, and India as a dashed final straight.
  - Stop buttons are positioned with percentage `left`/`top` taken from the same coordinates as the SVG, so they track the scaling.
  - Ticket colours are the builder's call; recognisable, with no marks.
- [ ] **Step 4: Write `about.css`.**
  - The map is full width, with the stop list under it in two columns on desktop and one on mobile.
  - The toy grid is three columns, two at ≤ 1024 px, one at < 860 px.
  - Cards use the kerb background and a 14 px radius.
  - No eyebrow labels. Headings are in sentence case.
- [ ] **Step 5: Run** `npm test`. Expected: PASS. Run `npm run dev`, open `/about.html` with JavaScript off, and check that everything is readable.
- [ ] **Step 6: Commit** with the message `feat: About page content and static render`.

---

### Task 3: Journey map interaction and line draw

**Files:**
- Create: `src/client/about/journey.ts`
- Modify: `src/client/about/main.ts`
- Test: `tests/journey.test.ts`

**Interfaces:**
- Produces: `initJourney(root: Document, opts: { reduced: boolean; observe?: (el: Element, onVisible: () => void) => void }): { highlight(id: Stop['id']): void; active(): Stop['id'] }`.
  - The default `observe` uses `IntersectionObserver` with threshold 0.4 and disconnects after the first hit.
  - The line draw animates `stroke-dashoffset` from the path length to 0 over 1200 ms with an `outExpo` ease, using anime.js. Reduced motion sets it drawn immediately.

- [ ] **Step 1: Write failing tests** in `tests/journey.test.ts`. Mount the About page, and mock `animejs` as in `tests/motion.test.ts`.
  - `Gjøvik is highlighted by default on map and list`. Check `[data-active]` on `.stop-btn[data-stop=gjovik]` and `li[data-stop=gjovik]`, and on nothing else.
  - `hover, focus or click on a map stop highlights it and its list row`
  - `hovering a list row highlights its map stop`
  - `ArrowRight/ArrowDown and ArrowLeft/ArrowUp move focus through stops in route order and wrap`
  - `reduced: line shown drawn, animate never called`
  - `not reduced: the line draws once, when the map becomes visible`. A fake `observe` captures the callback. Calling it calls `animate` once with `strokeDashoffset`; calling it again does not animate again.
- [ ] **Step 2: Run** `npx vitest run journey`. Expected: FAIL.
- [ ] **Step 3: Implement `journey.ts`, and wire it in `about/main.ts`** with `prefersReducedMotion()` from `src/client/motion.ts`. Start the shared ticker there too: extract `startTicker()` from `src/client/main.ts` into `src/client/ticker/start.ts` and import it in both entries.
- [ ] **Step 4: Run** `npm test`. Expected: PASS, including the existing main-page tests.
- [ ] **Step 5: Commit** with the message `feat: journey map highlighting and racing-line draw`.

---

### Task 4: Fact toys

**Files:**
- Create: `src/client/about/toys.ts`, `src/client/about/distance.ts`
- Modify: `src/client/about/main.ts`
- Test: `tests/toys.test.ts`

**Interfaces:**
- Produces, in `distance.ts`:
  - `haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number`
  - `distanceMessage(km: number): string`
  - `DENIED_MESSAGE = 'No worries. Gjøvik is at 60.8° N, 10.7° E.'`
- Produces, in `toys.ts`:
  - `initTickets(root: Document): void`
  - `initGameNight(root: Document, games: [string, string], opts: { reduced: boolean }): void`
  - `initPiper(root: Document, opts: { reduced: boolean; returnMs?: number }): void` (default `returnMs` 1200)
  - `initDistance(root: Document, target: { lat: number; lon: number }, geo: Geolocation | undefined): void`
  - `nearestCorner(x: number, y: number): string`, which returns the name from `MONACO_CORNERS` closest to (x, y) in the 0–100 space
  - `initMonaco(root: Document, opts: { reduced: boolean }): void`, which updates `p.corner-name` on pointer move or tap over `svg.monaco`

- [ ] **Step 1: Write failing tests** in `tests/toys.test.ts`.
  - `haversineKm Oslo→Gjøvik ≈ 98 km and London→Gjøvik ≈ 1228 km`. Use `toBeCloseTo(…, 0)` with a ±1 km tolerance; reference values are 98.1 and 1227.7.
  - `distanceMessage(1284.4) === "You're about 1\u00a0284 km from Gjøvik."` (the thousands separator is a no-break space). `distanceMessage(98.1) === "You're about 98 km from Gjøvik."`
  - `distanceMessage(3) === "You're basically in Gjøvik."`
  - `locate: success writes the message; denied, timeout and missing geolocation write DENIED_MESSAGE; button re-enabled after each` (Review Focus 1). Fake `Geolocation.getCurrentPosition` calls its success or error callback, and `undefined` is passed for the missing case.
  - `tickets: click toggles aria-pressed and .flipped; front text stays in the DOM`
  - `draw: first draw shows games[0], second games[1], third games[0]; rapid clicks still alternate one per click` (Review Focus 2)
  - `throw: button disabled while the ball is out; after returnMs the message is "Piper brought it back." and the button is enabled; a second click while out does nothing` (fake timers)
  - `reduced: throw shows the message immediately; draw shows the card face without flip classes` (Review Focus 4)
  - `nearestCorner(0,0)-style probes return the expected corner names` (pick 3 corners' own coordinates from `MONACO_CORNERS`)
- [ ] **Step 2: Run** `npx vitest run toys`. Expected: FAIL.
- [ ] **Step 3: Implement**, and wire it all in `about/main.ts` with `navigator.geolocation`.
  - Geolocation options: `{ enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }`.
  - The ball arc and the card flip use CSS transitions toggled by classes. No extra anime.js is needed for the toys.
- [ ] **Step 4: Run** `npm test` (expected: PASS) and `npm run build && npm run budget` (expected: within budget).
- [ ] **Step 5: Commit** with the message `feat: About fact toys (setup, tickets, game night, Piper, distance)`.

---

### Task 5: Quality pass

**Files:**
- Modify: `src/styles/about.css`, plus any render file the checks flag

- [ ] **Step 1: Run the detector.** Run `npm run build`, then `C:/Users/benja/.claude/skills/impeccable/scripts/impeccable detect --json dist/about.html src/styles/about.css`. Fix the mechanical findings. The glow warnings stay, as on the main page (owner's choice).
- [ ] **Step 2: Contrast.** Every new text/ground pair must be ≥ 4.5:1, including the ticket fronts on their team colours. Darken or lighten the stub ground until they pass.
- [ ] **Step 3: Visual check** of `/about.html` at 1440, 1024, 390 and 360 px, using the browser pane's JS for overflow (`scrollWidth === innerWidth`) and headless Edge for desktop screenshots. Check every toy state, keyboard focus on stops and toys, and that the map labels stay legible at 360 px.
- [ ] **Step 4: Run** `npm test` and `npm run budget`. Expected: PASS and within budget.
- [ ] **Step 5: Commit** with the message `chore: About page contrast and responsive fixes`.
