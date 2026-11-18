import { prefersReducedMotion } from '../motion'
import { startTicker } from '../ticker/start'
import { initJourney } from './journey'

function start() {
  const reduced = prefersReducedMotion()
  initJourney(document, { reduced })
  startTicker()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
