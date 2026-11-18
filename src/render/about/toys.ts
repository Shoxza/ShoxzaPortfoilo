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
        <span class="front"><span class="stub-text"><strong>${esc(t.team)}</strong><span>${esc(t.fact)}</span></span><img class="team-logo" src="${esc(t.logo.src)}" alt="" width="${t.logo.width}" height="${t.logo.height}" loading="lazy" decoding="async"><span class="stub-end"><svg class="sport" viewBox="0 0 28 28" aria-hidden="true" focusable="false">${sportIcon[t.league]}</svg></span></span>
        <span class="back">${esc(t.league)}</span>
      </button></li>`,
    )
    .join('')
  return `<section id="tickets" class="toy" aria-labelledby="tickets-h">
  <h2 id="tickets-h">Sports I follow</h2>
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

function distance(a: About): string {
  const home = project(a.gjovik.lat, a.gjovik.lon)
  const { w, h } = WORLD_VIEWBOX
  // The map fills whatever height the card has left; your dot and the line appear after the check.
  return `<section id="distance" class="toy" aria-labelledby="distance-h">
  <h2 id="distance-h">How far are you from Gjøvik?</h2>
  <p class="note">Your location stays in your browser. Nothing is sent anywhere.</p>
  <button class="locate" type="button">Show my distance</button>
  <p class="distance-out" aria-live="polite"></p>
  <div class="world-wrap">
    <svg class="world" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="World map with Gjøvik marked">
      <path class="land" d="${WORLD_LAND}"/>
      <line class="route" x1="${home.x}" y1="${home.y}" x2="${home.x}" y2="${home.y}" visibility="hidden"/>
      <circle class="you" cx="${home.x}" cy="${home.y}" r="2.2" visibility="hidden"/>
      <circle class="home" cx="${home.x}" cy="${home.y}" r="2.6"/>
    </svg>
  </div>
</section>`
}

export function renderToys(a: About): string {
  return `<div class="toys">${setup(a)}${tickets(a)}${gameNight(a)}${piper(a)}${distance(a)}</div>`
}
