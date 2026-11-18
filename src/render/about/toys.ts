import type { About } from '../../data/about'
import { esc } from '../escape'
import { monacoSvg } from './monaco'
import { WORLD_LAND, WORLD_VIEWBOX, project } from './world'

function setup(a: About): string {
  const rows: [string, string][] = [
    ['Wheel', a.setup.wheel],
    ['Sims', a.setup.sims.join(', ')],
    ['Favourite track', a.setup.track],
  ]
  return `<section id="setup" class="toy" aria-labelledby="setup-h">
  <h2 id="setup-h">My setup</h2>
  <dl class="sheet">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <figure class="monaco-fig">${monacoSvg()}<figcaption class="monaco-cap"><p class="corner-name" aria-live="polite">${esc(a.setup.track)}</p><button class="corner-step" type="button">Next corner</button></figcaption></figure>
</section>`
}

/** Small line icons for the stub, drawn in the stub's text colour (currentColor). */
const sportIcon: Record<About['tickets'][number]['league'], string> = {
  // Chequered flag.
  F1: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 25V4"/><path d="M7 5h15v10H7"/></g><path fill="currentColor" d="M7 5h5v5H7zM17 5h5v5h-5zM12 10h5v5h-5z"/>',
  // Football (soccer ball).
  Football:
    '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="14" cy="14" r="10"/><path d="M14 9.5l4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="currentColor"/><path stroke-width="1.6" d="M14 9.5V4.5M18.3 12.6l4.6-1.6M16.7 17.6l2.9 4M11.3 17.6l-2.9 4M9.7 12.6l-4.6-1.6"/></g>',
  // Puck and stick.
  Hockey:
    '<path d="M7 3l9 17h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="7" cy="21" rx="4.5" ry="2" fill="currentColor"/>',
  // Basketball with its seams.
  NBA: '<g fill="none" stroke="currentColor" stroke-width="2"><circle cx="14" cy="14" r="10"/><path d="M4 14h20M14 4v20M7 6.5c3.5 4 3.5 11 0 15M21 6.5c-3.5 4-3.5 11 0 15"/></g>',
  // Baseball with two stitched seams.
  MLB: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="14" cy="14" r="10"/><path d="M8.5 5.8c2.6 4.6 2.6 11.8 0 16.4M19.5 5.8c-2.6 4.6-2.6 11.8 0 16.4"/><path stroke-width="1.5" d="M8.7 9.5h2.4M9.6 13h2.4M9.6 16h2.4M8.7 19.5h2.4M16.9 9.5h2.4M16 13h2.4M16 16h2.4M16.9 19.5h2.4"/></g>',
}

function tickets(a: About): string {
  const items = a.tickets
    .map(
      t => `<li><button class="ticket" type="button" aria-pressed="false" style="--c1:${t.colors[0]};--c2:${t.colors[1]}">
        <span class="front"><span class="stub-text"><strong>${esc(t.team)}</strong>${t.fact ? `<span>${esc(t.fact)}</span>` : ''}</span>${
        t.logo
          ? `<img class="team-logo" src="${esc(t.logo.src)}" alt="" width="${t.logo.width}" height="${t.logo.height}" loading="lazy" decoding="async">`
          : ''
      }<span class="stub-end"><svg class="sport" viewBox="0 0 28 28" aria-hidden="true" focusable="false">${sportIcon[t.league]}</svg></span></span>
        <span class="back">${esc(t.league)}</span>
      </button></li>`,
    )
    .join('')
  return `<section id="tickets" class="toy" aria-labelledby="tickets-h">
  <h2 id="tickets-h">Teams I follow</h2>
  <ul class="stubs">${items}</ul>
</section>`
}

function gameNight(a: About): string {
  return `<section id="game-night" class="toy" aria-labelledby="game-h">
  <h2 id="game-h">Board game night</h2>
  <p class="game-text">${esc(a.gameNight.text)}</p>
  <div class="deck">
    <div class="card" aria-live="polite"><span class="card-face"></span></div>
    <button class="draw" type="button">Draw a card</button>
  </div>
</section>`
}

function piper(a: About): string {
  const photos = a.pet.photos
  if (!photos.length) return ''
  const n = photos.length
  const slides = photos
    .map(
      (ph, i) => `<li class="slide" aria-roledescription="slide" aria-label="${i + 1} of ${n}"><figure>
        <img src="${esc(ph.src)}" alt="${esc(ph.alt)}" width="${ph.width}" height="${ph.height}" loading="lazy" decoding="async">${
          ph.caption ? `<figcaption>${esc(ph.caption)}</figcaption>` : ''
        }
      </figure></li>`,
    )
    .join('')
  // Without JS it's a swipeable strip with scroll snap; carousel.ts adds the buttons' behaviour.
  return `<section id="piper" class="toy" aria-labelledby="piper-h">
  <h2 id="piper-h">${esc(a.pet.name)}, <span class="breed">${esc(a.pet.tagline)}</span></h2>
  <div class="carousel" aria-roledescription="carousel" aria-label="Photos of ${esc(a.pet.name)}">
    <ul class="slides" tabindex="0" aria-label="Photos, scroll sideways">${slides}</ul>
    <div class="carousel-nav">
      <button class="prev" type="button" aria-label="Previous photo"><span aria-hidden="true">←</span></button>
      <span class="count" aria-live="polite">1 / ${n}</span>
      <button class="next" type="button" aria-label="Next photo"><span aria-hidden="true">→</span></button>
    </div>
  </div>
</section>`
}

/** Faint lines every 30° of latitude and longitude, like a chart behind the timing screen. */
function graticule(w: number, h: number): string {
  const d: string[] = []
  for (let x = 0; x <= w; x += 30) d.push(`M${x} 0V${h}`)
  for (let lat = 60; lat >= -30; lat -= 30) d.push(`M0 ${80 - lat}H${w}`)
  return d.join('')
}

function distance(a: About): string {
  const home = project(a.gjovik.lat, a.gjovik.lon)
  const { w, h } = WORLD_VIEWBOX
  // An LED dot-matrix world (worldmap.ts keeps dots and pins the same size on screen at any zoom).
  // The map fills the card's spare height; your pin, the route and the readout appear after the check.
  const pin = (cls: string, label: string, hidden: boolean) =>
    `<g class="pin ${cls}" data-x="${home.x}" data-y="${home.y}" transform="translate(${home.x} ${home.y})"${hidden ? ' visibility="hidden"' : ''}>
        <circle class="pulse" r="5"/><circle class="core" r="4"/><text class="pin-label" x="-10" y="3.5" text-anchor="end">${label}</text>
      </g>`
  return `<section id="distance" class="toy" aria-labelledby="distance-h">
  <h2 id="distance-h">How far are you from Gjøvik?</h2>
  <p class="note">Your location stays in your browser. Nothing is sent anywhere.</p>
  <button class="locate" type="button">Show my distance</button>
  <p class="distance-out" aria-live="polite"></p>
  <div class="world-wrap" role="region" aria-label="World map. Drag or use the arrow keys to move it; scroll, pinch or use plus and minus to zoom.">
    <div class="map-ctrl">
      <button class="zoom-in" type="button" aria-label="Zoom in">+</button>
      <button class="zoom-out" type="button" aria-label="Zoom out">−</button>
      <button class="zoom-reset" type="button" aria-label="Reset the map view">⟲</button>
    </div>
    <svg class="world" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="World map with Gjøvik marked">
      <defs>
        <path id="land" d="${WORLD_LAND}"/>
        <pattern id="land-dots" patternUnits="userSpaceOnUse" width="1.6" height="1.6"><circle cx="0.8" cy="0.8" r="0.48"/></pattern>
      </defs>
      <path class="grid" d="${graticule(w, h)}"/>
      <use class="land-base" href="#land"/>
      <use class="land-dots" href="#land" fill="url(#land-dots)"/>
      <path class="route" d=""/>
      ${pin('pin--you', 'YOU', true)}
      ${pin('pin--home', 'GJØVIK', false)}
    </svg>
  </div>
  <dl class="readout" aria-hidden="true" hidden>
    <div><dt>Gap</dt><dd class="r-gap"></dd></div>
    <div><dt>Bearing</dt><dd class="r-brg"></dd></div>
  </dl>
</section>`
}

export function renderToys(a: About): string {
  return `<div class="toys">${setup(a)}${tickets(a)}${gameNight(a)}${piper(a)}${distance(a)}</div>`
}
