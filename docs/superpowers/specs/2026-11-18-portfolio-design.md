# Shoxza portfolio: design

Date: 2026-11-18
Owner: Shoxza (GitHub `Shoxza`), web development student at NTNU Gjøvik
Status: draft (builder check done), awaiting owner approval

## 1. Intent

A personal portfolio at **shoxza.no** that the owner can link from job applications and send to recruiters while applying for **junior front-end / full-stack** roles. It must feel like the owner (a casual single-player sim racer, F1 fan, gamer, hosts board game nights) and not like a corporate CV, while still letting a recruiter work out in a few seconds who this is, what they've built, and how to reach them.

Success: a recruiter remembers the site, finds the projects and the experience without hunting, and can contact the owner in one click. The owner is proud to send the link.

## 2. Audience

- **Primary:** recruiters and hiring developers who open the link from an application, often skimming on a laptop and sometimes on a phone.
- **Secondary:** peers and lecturers at NTNU.

## 3. Goals, non-goals, anti-goals

**Goals**
- One main page, scannable in one scroll: identity, projects, crew (experience), contact.
- A distinctive "pit wall" look grounded in the owner's motorsport world.
- Personal touches: driver number 26, a custom helmet as the logo, team-radio microcopy, and a live ticker showing what the owner is doing.
- Lightweight and sustainable: static files, small JavaScript, fast on a phone.

**Non-goals (v1)**
- The About page with the travel "lap" map. This is the next iteration (see §10).
- Norwegian translation (possible later for About only).
- Project case-study pages. Projects expand in place.
- A blog, CMS, contact form, analytics or login.

**Anti-goals (a failure even if it technically works)**
- Looks AI-generated or templated: near-black with one neon accent, mono labels as costume, ALL-CAPS eyebrows, middle-dot meta strings, identical cards.
- Reads like a CV: a plain two-column résumé layout.
- Austere minimalism, or navigation that makes people dig through menus.
- Invented claims: no fake case studies, metrics, achievements or links. Only what the owner has confirmed or what the repos' READMEs say.
- Job-pleading copy ("looking for a junior role…"). The intro says just "Junior developer".
- Overkill: no Bruno Simon-style 3D world. Motion supports reading and never blocks it.

## 4. Constraints

- **Stack:** Vite + vanilla TypeScript, no UI framework. The owner's lecturer discourages bloated framework portfolios, and the owner agrees. Small single-purpose libraries are fine.
- **Hosting:** Vercel, deploying from GitHub repo `Shoxza/ShoxzaPortfoilo` (currently empty). Custom domain `shoxza.no`, which the owner already has.
- **No backend:** no server code, database or logins. The live ticker reads a public third-party API from the browser (§7.6).
- **Language:** English.
- **Accessibility:** WCAG AA contrast on the dark ground, full keyboard use, visible focus, `prefers-reduced-motion` respected (every animation has a still version).
- **Performance budget (builder may tune):** first load at most ~150 KB transferred excluding fonts. JS at most ~30 KB gzipped including the animation library. The font is subset and self-hosted. No layout shift from late-loading content (ticker values reserve their space).
- **Repos are private for now.** The owner will make them public later. Until then no code links. The data model must allow links to be added without code changes.

## 5. Approaches considered

**Visual direction.** Three directions were mocked up with the impeccable design skill (references in `2026-11-18-portfolio-refs/`):
1. *One Flying Lap*: the page as one lap of a circuit, with corners as projects. The owner loved it but it's too heavy for the main page. **Reused for the future About page's travel map.**
2. *Pit Wall, Committed*: the page as a live timing screen. **Chosen.**
3. *Licence Book*: a racing-licence booklet with project stamps. Not chosen.

A plain "standard developer portfolio" was offered as an exit and rejected, since it's the CV look the owner dislikes.

**Live ticker data.** (A) Lanyard, which publishes Discord presence publicly and needs no server. (B) A Vercel serverless function calling the Spotify and Steam APIs. (C) A scheduled GitHub Action snapshot. **Chosen: A.** The owner uses Discord, it needs zero backend (which respects the lecturer's rule), and it's real time. B is the fallback if Lanyard ever disappears. C was rejected as not live and wasteful.

**Animation.** anime.js (small, and the owner loved animejs.com's motion) vs GSAP (more powerful, larger) vs CSS only. **Chosen: anime.js for sequenced motion, CSS for everything simple.** GSAP may come back for the scroll-driven lap map later.

## 6. Visual system

**Colour tokens**

| Token | Hex | Use |
|---|---|---|
| asphalt | `#1E1D1B` | Page ground. A warm dark grey, never pure black. |
| kerb | `#252421` | Raised panels (project feed). |
| pit | `#181715` | Timing tower and radio boxes. |
| ticker | `#161513` | Bottom ticker bar. |
| chalk | `#ECE8E1` | Primary text. |
| dust | `#9A958C` | Secondary text. Must still pass AA on its ground. |
| racing blue | `#4781D7` | The single accent and glow colour (Red Bull Racing-inspired, the owner's team). |
| soft (red) | `#E5383B` | Tyre compound for **personal** projects. |
| medium (yellow) | `#F2C14E` | Tyre compound for **school** projects. |

**Glow.** A racing-blue `text-shadow` glow, used only on the name, the selected project title, live ticker values and graphic traces. Sizes: small `0 0 6px rgba(71,129,215,.7), 0 0 18px rgba(71,129,215,.32)`, large `0 0 18px rgba(71,129,215,.5), 0 0 64px rgba(71,129,215,.28)`.

**Type.** One family: **Archivo** variable (width axis 62–125, weight 100–900), self-hosted and subset. The display uses width 125 at weight 800–900 with tight tracking (−0.035em). Body uses width 100 at weight 400–500. Tabular figures are always on. No monospace and no all-caps labels.

**Icons.** A **tyre-wheel icon** (black rubber, a compound-coloured band, a five-spoke rim) marks each project's type. It spins one turn when its row is hovered or focused. All icons are authored SVG, with no emoji.

**Helmet #26 (logo).** A front three-quarter racing helmet, **deep blue top** colourway `#2A4F8F` (reference: `helmet-26-v7.html`, "Deep blue"). The helmet is deliberately darker than the site's racing-blue accent so the logo sits calm on the asphalt.
- Two-tone shell: deep-blue upper, chalk lower, split just under the visor, with an asphalt boundary pinstripe.
- Two thin chalk crown stripes. An outlined angular asphalt band on the upper side holding the **Gjøvik Tech Racing** swan logo (white).
- Slanted asphalt bands across the lower half. The **darling** logo is on the chin in dark ink.
- A chalk visor strip printed with **shoxza.no**, above a dark tinted visor with a subtle blue reflection.
- A large chalk **26** with a dark outline on the rear side.
- Static only: the decals are not interactive. No glowing line on the helmet (the owner rejected it). No team badge on the front.
- A **simplified mark** for nav and favicon sizes (≤48 px): two-tone shell, visor and 26 only.
- The v6 drawing is a strong first version. The builder polishes the silhouette (chin, visor wrap) and makes it one optimised SVG. If the owner supplies a better design (they may try Recraft), it replaces this one.
- Logo files: `2026-11-18-portfolio-refs/gtr-logo-hvit.webp` (white swan-car) and `darling-hvit.svg` (white wordmark). These are the owner's own organisations, supplied by the owner.

## 7. The main page

Reference composition: `2026-11-18-portfolio-refs/pitwall-v6.html`. Its header helmet is an older drawing; use the v6 helmet instead.

### 7.1 Header
- Top left: the **helmet** (about 150 px on desktop), then **#26** in racing blue above **Shoxza** set huge (display type, large glow).
- Top right: **Junior developer**, and below it **Gjøvik, Norway**.
- Nav, minimal: Work, Crew, Contact (anchor links). About appears when it exists.
- **Load moment:** the one orchestrated entrance. The name "launches" from narrow (width 62) to wide (width 125) in about 1.2 s, then stays still. Reduced motion means it renders final.

### 7.2 Timing tower: Projects
A dark panel on the left, styled as a race timing tower:
- Rows show position (1, 2, 3…), tyre icon (compound = type), project name, and year. The selected row has a blue inset edge.
- Selecting a row (click, Enter or Space; rows are buttons; arrow keys move between rows) loads that project into the feed panel. The URL hash updates (`#raceassistant`) so links to a project work.
- A small legend explains the compounds: red = personal, yellow = school.

**v1 projects:**

| # | Project | Type | Year | Stack | Description (from README) |
|---|---|---|---|---|---|
| 1 | RaceAssistant | Personal | 2026 | TypeScript, Node | A personal race engineer for F1 26. It reads live telemetry, makes radio calls and coaches you between runs. Features: radio calls for fuel, gaps, tyres and pit window; lap recording with trace comparison; live timing dashboard for a second screen. |
| 2 | Anti F1 Spoiler | Personal | 2026 | TypeScript, WebExtensions | A browser extension that hides F1 content on YouTube and Instagram until you've watched the race. Works in Firefox and Chrome/Edge from one codebase. |
| 3 | Megaminds Poker Dice | School (IDG2100 exam, team) | 2026 | MongoDB, Express, React, Node | A full-stack MERN dice game built as a team for the IDG2100 exam. **Owner's role: full-stack** (front end and back end). Teammates are not named. Feature list: *to confirm with the owner* (the repo suggests matchmaking, tournaments, an ELO leaderboard, comments, JWT auth and admin pages). |

`doomscroll-assist` stays private and is not shown.

### 7.3 Crew (experience)
Below the projects in the same tower, labelled "Crew". It's a playful way to carry CV facts:
- **Gjøvik Tech Racing**, Web developer, seasons **2025–27**.
- **Darling**, Web committee leader, seasons **2026–27**.
- Each row: the organisation's white logo, its name, the role, and a **season strip** of three small blocks (25, 26, 27), with active seasons lit racing blue.

### 7.4 Project feed (onboard panel)
The large panel to the right of the tower shows the selected project:
- The title (display type, small glow), the description, and a data band (type, stack, year) in one fixed position for every project.
- **Team radio** box: one short, dry, factual line in an engineer's voice. Approved tone and examples:
  - RaceAssistant: "Copy. This one talks back during the race: fuel, gaps, pit window. Quiet in the corners unless you ask."
  - Anti F1 Spoiler: "Don't check your phone. Results are hidden until you've watched it."
  - Poker Dice: *to confirm with the owner* (proposal in the hand-off).
- A **role** field in the data band for team projects (Poker Dice: "Full-stack, team project").
- A **visual** area. RaceAssistant uses a lap-trace graphic: two speed traces, the current one in glowing blue and a reference one dashed. Other projects get screenshots when the owner supplies them. Until then, a tasteful project-specific graphic, never a fake screenshot.
- Key features as a short list, when the README provides them.
- Links (GitHub, live) appear only when the data has them. Today none do.
- Switching projects: the panel content swaps with a short, quick transition. Readouts like the year "step" in whole lines with one small overshoot. This is the site's single motion grammar for changing values.

### 7.5 Contact
A short closing section with links only: email, GitHub (`github.com/Shoxza`) and LinkedIn. The owner must supply the email address and LinkedIn URL. No form.

### 7.6 Live ticker
A slim bar at the bottom of the page (in normal document flow, not fixed over content):
- **Discord** presence (online/idle/offline dot), **Spotify** (track and artist, or "nothing right now"), **Playing** (current game from Discord activity, e.g. Le Mans Ultimate), and **local time in Gjøvik** (computed in the browser with Europe/Oslo time).
- Data comes from **Lanyard** (`api.lanyard.rest`), using the WebSocket for live updates with REST as fallback, keyed by the owner's Discord user ID. Setup: the owner joins the Lanyard Discord server and turns on activity status.
- **What it may show (owner's rule):**
  - "Playing" shows **games only**: Discord activities of type "playing". No editors, other apps' Rich Presence or custom status text.
  - Spotify shows **song and artist** as they are.
  - Do-not-disturb and idle show as **online**.
- **Failure states:** if Lanyard is unreachable or the owner is offline, the bar shows the local time and "offline" quietly. It never errors visibly or shifts the layout.
- Values glow (small) and change with the step motion.

### 7.7 Mobile (below ~860 px)
- The header stacks: helmet and #26 with the name, then "Junior developer".
- The tower becomes a full-width list. Selecting a project expands its feed **inline, under its row** (an accordion) instead of a side panel.
- The crew season strips stay on one line. The ticker wraps to two lines.

## 8. Behaviour and quality floor
- Semantic HTML: header, main, sections with headings, buttons for rows, a list for crew.
- The page works without JavaScript: all projects and crew render as static HTML. JS adds the selection, the ticker and the motion.
- `prefers-reduced-motion`: no launch, no tyre spin, no step overshoot. Changes are instant.
- Themed browser surfaces: text selection, focus rings in racing blue, and the scrollbar in the asphalt palette.
- Metadata: title "Shoxza, junior developer", a description, an Open Graph image (helmet + name on asphalt), and favicons from the simplified helmet.

## 8b. Launch gate (owner's rule)
v1 does **not** go live until every owner input is in place. The plan treats these as blocking inputs:
- the email address and LinkedIn URL;
- the Discord user ID, with the owner having joined the Lanyard Discord server;
- the Poker Dice radio line and confirmed feature list.

The build can proceed with placeholders. Only the public launch (pointing shoxza.no at the deployment) waits.

## 9. Content rules
- Copy is plain and sentence case. Controls name their action.
- Every fact comes from the owner or the repos. Anything unknown is left out, never invented.
- Project data lives in one typed data file (e.g. `src/data/projects.ts`, `crew.ts`), so adding a project, a link or a screenshot is a data edit.

## 10. Next iteration (out of scope for v1, but design for it)
- **About page as a lap.** A circuit-style map of the owner's journey: start at Gjøvik, a corner at Berlin (study visit), and the next corner India (bachelor thesis from January 2027), with the car marking "now". It carries the owner's real name, NTNU, sim racing, and board game nights. Scroll drives the car (reference `lap-direction.png`). Possibly also in Norwegian.
- Project case studies, if a project earns one.
- GitHub links once repos are public.

## 11. Decided by the owner
- Pit wall direction. Asphalt background. Racing-blue glow (not red). English only.
- Hero copy is just "Junior developer".
- Tyre icons with compound colours. doomscroll-assist hidden.
- Number 26. Helmet in front three-quarter, Leclerc-style layout in their own colours, racing-blue top, shoxza.no on the visor strip, 26 on the rear side, GTR and darling as static sponsors.
- Crew section with season strips. Team-radio tone as in the examples.
- Live ticker via Lanyard (they use Discord).
- No lights-out intro.
- Helmet deep blue top. Poker Dice role is full-stack. Ticker shows games + Spotify only. Launch waits for all inputs.

## 12. Calls made by Claude (owner can override)
- anime.js as the animation library (the owner didn't object).
- The name "launch" as the single load animation.
- Nav items: Work, Crew, Contact.
- Mobile accordion behaviour.
- The performance budget numbers.

## 13. Left to the builder
- File and module structure, build config, testing approach.
- Final helmet SVG polish and optimisation.
- Exact spacing scale, breakpoints and motion timings within the rules above.
- How to subset and self-host Archivo.
- Vercel project setup and DNS records for shoxza.no (the owner does the DNS steps in their registrar).
