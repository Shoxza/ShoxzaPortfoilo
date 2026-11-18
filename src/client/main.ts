import { site } from '../data/site'
import { PENDING } from '../data/types'
import { initSelection } from './selection'
import { connectLanyard } from './ticker/lanyard'
import { toTickerState } from './ticker/state'
import { formatOsloTime, renderTickerState } from './ticker/view'

function startTicker() {
  const time = document.querySelector<HTMLElement>('[data-t="time"]')
  const tick = () => {
    if (time) time.textContent = formatOsloTime(new Date())
  }
  tick()
  setInterval(tick, 30_000)

  const id = site.profile.discordId
  if (id === PENDING) {
    renderTickerState(document, toTickerState(null))
    return
  }
  connectLanyard(id, s => renderTickerState(document, s))
}

function start() {
  initSelection(document, { mobileQuery: matchMedia('(max-width: 859px)') })
  startTicker()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
