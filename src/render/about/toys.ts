import type { About } from '../../data/about'
import { esc } from '../escape'
import { monacoSvg } from './monaco'

function setup(a: About): string {
  const rows: [string, string][] = [
    ['Wheel', a.setup.wheel],
    ['Sims', a.setup.sims.join(', ')],
    ['Favourite track', a.setup.track],
  ]
  return `<section id="setup" class="toy" aria-labelledby="setup-h">
  <h2 id="setup-h">My setup</h2>
  <dl class="sheet">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <figure class="monaco-fig">${monacoSvg()}<p class="corner-name" aria-live="polite">${esc(a.setup.track)}</p></figure>
</section>`
}

function tickets(a: About): string {
  const items = a.tickets
    .map(
      t => `<li><button class="ticket" type="button" aria-pressed="false" style="--c1:${t.colors[0]};--c2:${t.colors[1]}">
        <span class="front"><strong>${esc(t.team)}</strong><span>${esc(t.fact)}</span></span>
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
  const photo = a.pet.photo ? `<img class="pet-photo" src="${esc(a.pet.photo.src)}" alt="${esc(a.pet.photo.alt)}" loading="lazy">` : ''
  return `<section id="piper" class="toy" aria-labelledby="piper-h">
  <h2 id="piper-h">${esc(a.pet.name)}, <span class="breed">${esc(a.pet.breed)}</span></h2>
  ${photo}
  <div class="yard"><span class="ball" aria-hidden="true"></span></div>
  <button class="throw" type="button">Throw the ball</button>
  <p class="fetch-msg" aria-live="polite"></p>
</section>`
}

function distance(): string {
  return `<section id="distance" class="toy" aria-labelledby="distance-h">
  <h2 id="distance-h">How far are you from Gjøvik?</h2>
  <p class="note">Your location stays in your browser. Nothing is sent anywhere.</p>
  <button class="locate" type="button">Show my distance</button>
  <p class="distance-out" aria-live="polite"></p>
</section>`
}

export function renderToys(a: About): string {
  return `<div class="toys">${setup(a)}${tickets(a)}${gameNight(a)}${piper(a)}${distance()}</div>`
}
