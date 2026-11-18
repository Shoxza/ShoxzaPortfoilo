# Shoxza portfolio: About page design

Date: 2026-11-18
Owner: Ben Hughes Tretnes ("Shoxza", #26)
Status: approved by the owner 2026-11-18
Builds on: `2026-11-18-portfolio-design.md`, the main spec. Its visual system, constraints and content rules all apply here unless this document says otherwise.

## 1. Intent

A separate **About** page in the spirit of Josh Comeau's About page (joshwcomeau.com/about-josh): personal and playful, made of small interactive "fact toys" rather than a bio paragraph. A recruiter who clicks "About" should come away knowing who Ben is as a person in under a minute: where he's from, what he's into, and that he's fun to work with. Meanwhile the main page stays focused on work.

## 2. Goals, non-goals, anti-goals

**Goals**
- A **journey map** of Ben's life so far, drawn as a race circuit. It's the first thing on the page.
- Five small **fact toys** below it, each one about a real, specific thing.
- The real name **Ben Hughes Tretnes** appears here; the main page stays "Shoxza".

**Non-goals**
- A Norwegian version (maybe later).
- A scroll-driven or pinned animation of the lap (the owner chose map-first; see §4).
- Any backend. The distance toy runs entirely in the visitor's browser.

**Anti-goals**
- Invented facts. Only what's listed in §6.
- Real team or sponsor **logos** for the sports teams and games. Names and colours only.
- Fake or drawn "cute" illustrations of the dog. A real photo, or no picture at all.
- Toys that hide information: every fact is readable without interacting.

## 3. Constraints
- Same stack: Vite + vanilla TypeScript, anime.js, and no new runtime dependencies.
- It's a second static page, `about.html`, served at `/about` (Vercel `cleanUrls`). Same render-from-data approach as the main page, so it's complete without JavaScript.
- Same header (helmet, nav) and the same live ticker footer as the main page. The nav on both pages becomes: Work, Crew, About, Contact. On the About page, Work, Crew and Contact link back to the main page's sections (`/#work`, and so on).
- Same performance budget: the About page's own first load is ≤ 150 KB excluding fonts, and JS ≤ 30 KB gzipped across the site.
- Accessibility as in the main spec: keyboard operable, AA contrast, reduced motion gives a still page.

## 4. Approaches considered
1. **Vertical lap:** the route runs down the page and a car follows the scroll. Mobile-friendly, but more scrolling.
2. **Map first, toys below:** one-screen circuit diagram, toys in a grid underneath. Simplest, and you see the whole journey at once. **Chosen by the owner.**
3. **Pinned flying lap:** the circuit is pinned and scroll drives the car. Most dramatic, but it takes over scrolling and drifts toward "too much".

## 5. Page structure

```
┌ header: helmet · nav (Work Crew About Contact) ┐
│ Ben Hughes Tretnes                          #26 │
│ ┌──────────── journey map (circuit) ─────────┐ │
│ │ NI ● start ─╮                              │ │
│ │             ╰─ Vestnes ─╮                  │ │
│ │                          ╰─ Gjøvik ● now   │ │
│ │                    Berlin ╯   ╰ ┄ ┄ India  │ │
│ └────────────────────────────────────────────┘ │
│ [stop details: text for the selected stop]     │
│ ┌ setup sheet ┐ ┌ ticket stubs ┐ ┌ game night ┐│
│ ┌ Piper ──────┐ ┌ how far are you from Gjøvik? ┐│
├ ticker (same as main page) ────────────────────┤
```

### 5.1 Heading
- **Ben Hughes Tretnes** in the display type (Archivo, width 125), large, with the large glow.
- Beside it, small: **#26** (blue-text) and "Shoxza" in dust colour, to link the two identities.
- No bio paragraph. One short line under the name, exactly: "Junior developer from Norway" (owner's wording).

### 5.2 Journey map (the circuit)
- **A schematic circuit, not a geographic map:** it's a stylised race track (the asphalt band, kerbs at the corners and a racing-blue racing line), with each stop as a corner in order. Reference: `2026-11-18-portfolio-refs/lap-direction.png` for the track style.
- **Stops, in order:**

  | Stop | Line shown when selected |
  |---|---|
  | **Northern Ireland** (start/finish line) | "Where I'm from." |
  | **Vestnes**, Møre og Romsdal | "Where I grew up." |
  | **Gjøvik**: NTNU | "Studying web development at NTNU. Web developer for Gjøvik Tech Racing, web committee leader at Darling." |
  | **Berlin** (a short detour corner off Gjøvik) | "Study visit." |
  | **India** | "Next corner: bachelor thesis, from January 2027." |

  Berlin has already happened (the owner: "I have also visited Berlin"), so its detour is drawn as driven. Only India is drawn **dashed / not yet driven**.
- A small glowing **car marker** sits at **Gjøvik** ("now").
- **Interaction:**
  - Under the map, a **stop list** always shows all five stops with their lines, in route order. It's visible with or without JavaScript, so no fact needs a click.
  - Each stop on the map is a button. Hovering, focusing or clicking it highlights that stop on the map **and** its row in the list (and the reverse: hovering a list row highlights its corner).
  - Gjøvik is highlighted by default.
  - Arrow keys move between stops in route order.
- **Motion:** when the map first scrolls into view, the racing line draws itself from the start through Vestnes to Gjøvik, including the Berlin detour, once (stroke-dashoffset, about 1.2 s). Reduced motion shows it already drawn. This is the page's one orchestrated moment.
- **Without JavaScript:** the map shows with all stop labels, and the same stop list sits under it (no highlighting).
- **Mobile:** the circuit scales to the full width (it stays a single SVG). Stop labels sit outside the track so they stay legible. Under 400 px it's fine for labels to shrink to their short names.

### 5.3 Fact toys (grid below the map)
A responsive grid: three columns on desktop, one on mobile. Each toy is a card on the kerb panel colour with a heading in sentence case.

1. **Setup sheet** ("My setup"). Styled like a car-setup screen, as rows of label and value:
   - Wheel: **Logitech G29**, on a desk
   - Sims: **F1**, **Assetto Corsa Competizione**, **Le Mans Ultimate**
   - Favourite track: **Monaco**
   - It includes a **small simplified Monaco outline** (authored SVG, recognisable, not survey-accurate). Hovering or tapping it lights the racing line and shows the corner name nearest the pointer, using real Monaco corner names from Sainte Dévote to Anthony Noghès. Reduced motion: no line animation.
2. **Ticket stubs** ("Sports I follow"). Three ticket-stub cards. Clicking flips each one (CSS 3D flip; with reduced motion the back is shown under the front instead):
   - **Gjøvik Hockey**: the front reads "Local hockey in Gjøvik."
   - **OKC Thunder**: the front reads "My NBA team."
   - **San Diego Padres**: the front reads "I've been to a Padres game."
   - The fact is on the **front**, so it's readable without clicking. The flip reveals the stub's back, styled in the team's colours with the league (Hockey / NBA / MLB) and a torn-ticket edge: decoration, not hidden content.
   - Team **colours and names only**: no logos. The colour choice is up to the builder; it should be recognisable without copying marks.
3. **Game night deck** ("Board game night"). One sentence: "Every couple of weeks with friends. Usually: Exploding Kittens or Horrible Therapist." Both names are always in that text. Plus a **Draw a card** button: a card flips over to show one of the two, alternating with each draw, as a playful extra.
4. **Piper** ("Piper, Jack Russell"). A **Throw the ball** button: a tennis ball arcs off the card, and about 1.2 s later it returns with the text "Piper brought it back." With reduced motion only the text appears. If the owner supplies a photo of Piper, it shows on the card. Without a photo the card is text plus the ball, never a drawing of a dog.
5. **Distance** ("How far are you from Gjøvik?"). A button asks for the visitor's location using the browser's own geolocation permission. The distance to Gjøvik (60.7957 N, 10.6915 E) is worked out **in the browser** with the haversine formula and shown in km (e.g. "You're about 1 284 km from Gjøvik."). Nothing is sent anywhere. If permission is denied or unavailable, it says "No worries. Gjøvik is at 60.8° N, 10.7° E." If the visitor is under 5 km away: "You're basically in Gjøvik."

## 6. Content (all owner-supplied, 2026-11-18)
- Real name: Ben Hughes Tretnes. From Northern Ireland, grew up in Vestnes (Møre og Romsdal), studies at NTNU in Gjøvik, study visit to Berlin, bachelor thesis in India from January 2027.
- Sim racing: Logitech G29 on a desk, F1 / ACC / Le Mans Ultimate, favourite track Monaco.
- Sports: multisport fan. Gjøvik Hockey, OKC Thunder (NBA), has been to a San Diego Padres game.
- Board game nights every couple of weeks with friends. Exploding Kittens and Horrible Therapist.
- Pet: Piper, a Jack Russell.
- Crew roles (already on the main page): Gjøvik Tech Racing web developer; Darling web committee leader.

## 7. Data and code shape (decided)
- All About content lives in a typed data file (e.g. `src/data/about.ts`), following the main site's pattern, so text edits are data edits.
- The existing build plugin is generalised to render each page into its own HTML: `index.html` and `about.html`, each with its own app slot.
- About-page client code is its own entry, loaded only on the About page. Shared pieces (the ticker, motion helpers) are reused, not duplicated.

## 8. Calls made by Claude (owner can override)
- Every fact stays visible without clicking (the stop list stays on screen, stub facts sit on the fronts, both game names are in the text). The toys are playful extras on top. This resolved a builder-check question in favour of the anti-goal in §2.
- The page shares the main page's header and live ticker.
- The nav order is Work, Crew, About, Contact.
- (Intro line: set by the owner, "Junior developer from Norway".)
- The toys' exact interactions: flip, draw, throw, opt-in distance.
- The Monaco mini-map and its corner-name hover.
- The racing-line draw as the single load moment.
- The ticket-stub and card copy.

## 9. Left to the builder
- Circuit geometry and how the five stops sit on it (it must read as a race track with five corners and a Berlin detour).
- Grid breakpoints, card sizes, exact motion timings within the main spec's rules.
- Team colour choices for the ticket stubs (recognisable, no marks).
- How the build plugin is generalised for two pages.
