import { stepText } from './motion'
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

  // The helmet drive on load is CSS. If animations never tick (a paused or hidden view),
  // finish it so the name is not left covered by the helmet.
  const id = document.querySelector<HTMLElement>('.hero .id')
  if (id && typeof id.getAnimations === 'function') {
    setTimeout(() => id.getAnimations().forEach(a => a.finish()), 2500)
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
