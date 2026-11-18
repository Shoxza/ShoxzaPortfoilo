import { animate } from 'animejs'
import type { Stop } from '../../data/about'

type StopId = Stop['id']

interface JourneyOptions {
  reduced: boolean
  observe?: (el: Element, onVisible: () => void) => void
}

/** Fires once when the element is 40% visible, then stops watching. */
const observeOnce = (el: Element, onVisible: () => void) => {
  if (typeof IntersectionObserver === 'undefined') return onVisible()
  const io = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect()
        onVisible()
      }
    },
    { threshold: 0.4 },
  )
  io.observe(el)
}

/** Map stops and the stop list highlight together. The racing line draws itself once. */
export function initJourney(root: Document, opts: JourneyOptions) {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('.stop-btn')]
  const rows = new Map([...root.querySelectorAll<HTMLElement>('ol.stop-list li')].map(li => [li.dataset.stop as StopId, li]))
  // Default: the latest driven turn.
  const driven = buttons.filter(b => b.dataset.status === 'driven')
  let active = (driven[driven.length - 1]?.dataset.stop ?? buttons[0]?.dataset.stop) as StopId

  const highlight = (id: StopId) => {
    active = id
    for (const b of buttons) b.toggleAttribute('data-active', b.dataset.stop === id)
    for (const [rid, li] of rows) li.toggleAttribute('data-active', rid === id)
  }

  buttons.forEach((b, i) => {
    const id = b.dataset.stop as StopId
    b.addEventListener('mouseenter', () => highlight(id))
    b.addEventListener('focus', () => highlight(id))
    b.addEventListener('click', () => highlight(id))
    b.addEventListener('keydown', e => {
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
      if (!step) return
      e.preventDefault()
      buttons[(i + step + buttons.length) % buttons.length].focus()
    })
  })
  for (const [id, li] of rows) li.addEventListener('mouseenter', () => highlight(id))

  const line = root.querySelector<SVGPathElement>('path.racing-line')
  const map = root.querySelector('.journey-map')
  if (line && map && !opts.reduced) {
    let drawn = false
    ;(opts.observe ?? observeOnce)(map, () => {
      if (drawn) return
      drawn = true
      const len = typeof line.getTotalLength === 'function' ? line.getTotalLength() : 2000
      line.style.strokeDasharray = String(len)
      animate(line, { strokeDashoffset: [len, 0], duration: 1200, ease: 'outExpo' })
    })
  }

  highlight(active)
  return { highlight, active: () => active }
}
