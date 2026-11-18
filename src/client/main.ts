import { site } from '../data/site'
import { PENDING } from '../data/types'
import { launchName, stepText } from './motion'
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
  connectLanyard(id, s => renderTickerState(document, s, stepText))
}

function start() {
  initSelection(document, {
    mobileQuery: matchMedia('(max-width: 859px)'),
    onChange: slug => {
      // The new panel's readouts step in, the same grammar as the ticker.
      document.querySelectorAll<HTMLElement>(`#p-${slug} [data-step]`).forEach(el => {
        const text = el.textContent ?? ''
        el.textContent = ''
        stepText(el, text)
      })
    },
  })
  startTicker()

  // The load launch is CSS; hovering the name replays it.
  const name = document.getElementById('name')
  name?.addEventListener('pointerenter', () => {
    name.classList.add('replay')
    launchName(name)
  })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
