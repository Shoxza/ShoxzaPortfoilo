import { site } from '../../data/site'
import { PENDING } from '../../data/types'
import { stepText } from '../motion'
import { connectLanyard } from './lanyard'
import { toTickerState } from './state'
import { formatOsloTime, renderTickerState } from './view'

/** Live ticker shared by every page: Gjøvik time plus Discord presence via Lanyard. */
export function startTicker(): void {
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
