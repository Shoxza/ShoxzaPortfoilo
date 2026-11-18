import { initBar } from '../bar'
import { ageOn } from '../../render/about/age'
import { about } from '../../data/about'
import { prefersReducedMotion } from '../motion'
import { startTicker } from '../ticker/start'
import { initCarousel } from './carousel'
import { initJourney } from './journey'
import { initWorldMap } from './worldmap'
import { initDistance, initGameNight, initMonaco, initTickets } from './toys'

function start() {
  initBar(window, document.querySelector<HTMLElement>('[data-bar]'))
  const reduced = prefersReducedMotion()
  initJourney(document, { reduced })
  initMonaco(document)
  initTickets(document)
  initGameNight(document, about.gameNight.games, { reduced })
  initCarousel(document, { reduced })
  initWorldMap(document)
  initDistance(document, about.gjovik, 'geolocation' in navigator ? navigator.geolocation : undefined)
  // The age is written at build time; keep it right if the site hasn't been rebuilt since a birthday.
  const age = document.querySelector<HTMLElement>('[data-born]')
  if (age) age.textContent = String(ageOn(age.dataset.born!, new Date()))
  startTicker()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
