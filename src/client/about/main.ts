import { about } from '../../data/about'
import { prefersReducedMotion } from '../motion'
import { startTicker } from '../ticker/start'
import { initJourney } from './journey'
import { initDistance, initGameNight, initMonaco, initPiper, initTickets } from './toys'

function start() {
  const reduced = prefersReducedMotion()
  initJourney(document, { reduced })
  initMonaco(document)
  initTickets(document)
  initGameNight(document, about.gameNight.games, { reduced })
  initPiper(document, { reduced })
  initDistance(document, about.gjovik, 'geolocation' in navigator ? navigator.geolocation : undefined)
  startTicker()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
