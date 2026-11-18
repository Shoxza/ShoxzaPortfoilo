import { launchName, stepText } from './motion'
import { initSelection } from './selection'
import { startTicker } from './ticker/start'

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
