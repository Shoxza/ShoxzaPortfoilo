import { MONACO_CORNERS } from '../../render/about/monaco'
import { DENIED_MESSAGE, distanceMessage, haversineKm, type LatLon } from './distance'

/** Ticket stubs flip on click. The fact stays on the front, so nothing is hidden. */
export function initTickets(root: Document): void {
  for (const t of root.querySelectorAll<HTMLButtonElement>('button.ticket')) {
    t.addEventListener('click', () => {
      const on = t.getAttribute('aria-pressed') !== 'true'
      t.setAttribute('aria-pressed', String(on))
      t.classList.toggle('flipped', on)
    })
  }
}

/** Draw a card: alternates between the two games, one per click. */
export function initGameNight(root: Document, games: [string, string], opts: { reduced: boolean }): void {
  const card = root.querySelector<HTMLElement>('#game-night .card')
  const face = card?.querySelector<HTMLElement>('.card-face')
  const draw = root.querySelector<HTMLButtonElement>('#game-night button.draw')
  if (!card || !face || !draw) return
  let n = 0
  draw.addEventListener('click', () => {
    face.textContent = games[n++ % 2]
    card.classList.add('shown')
    if (opts.reduced) return
    card.classList.remove('flipping')
    void card.offsetWidth // restart the flip
    card.classList.add('flipping')
    setTimeout(() => card.classList.remove('flipping'), 180)
  })
}

/** Busy state via aria-disabled, not the disabled property: disabling a focused button drops keyboard focus. */
const setBusy = (btn: HTMLButtonElement, busy: boolean) => btn.setAttribute('aria-disabled', String(busy))
const isBusy = (btn: HTMLButtonElement) => btn.getAttribute('aria-disabled') === 'true'

/** Throw the ball; Piper brings it back. One ball in flight at a time. */
export function initPiper(root: Document, opts: { reduced: boolean; returnMs?: number }): void {
  const btn = root.querySelector<HTMLButtonElement>('#piper button.throw')
  const ball = root.querySelector<HTMLElement>('#piper .ball')
  const msg = root.querySelector<HTMLElement>('#piper .fetch-msg')
  if (!btn || !ball || !msg) return
  const back = 'Piper brought it back.'
  btn.addEventListener('click', () => {
    if (isBusy(btn)) return
    if (opts.reduced) {
      msg.textContent = back
      return
    }
    msg.textContent = ''
    setBusy(btn, true)
    ball.classList.add('thrown')
    setTimeout(() => {
      ball.classList.remove('thrown')
      msg.textContent = back
      setBusy(btn, false)
    }, opts.returnMs ?? 1200)
  })
}

/** How long to wait for an answer to the permission prompt before falling back. */
const PROMPT_WATCHDOG_MS = 15_000

/** Opt-in distance to Gjøvik, worked out in the browser. Nothing is sent anywhere. */
export function initDistance(root: Document, target: LatLon, geo: Geolocation | undefined): void {
  const btn = root.querySelector<HTMLButtonElement>('#distance button.locate')
  const out = root.querySelector<HTMLElement>('#distance .distance-out')
  if (!btn || !out) return
  const show = (text: string) => {
    out.textContent = text
    setBusy(btn, false)
  }
  btn.addEventListener('click', () => {
    if (isBusy(btn)) return
    if (!geo) return show(DENIED_MESSAGE)
    setBusy(btn, true)
    out.textContent = 'Checking…'
    // Browsers may never answer if the prompt is ignored or dismissed; the API timeout doesn't cover that.
    const watchdog = setTimeout(() => show(DENIED_MESSAGE), PROMPT_WATCHDOG_MS)
    try {
      geo.getCurrentPosition(
        pos => {
          clearTimeout(watchdog)
          show(distanceMessage(haversineKm({ lat: pos.coords.latitude, lon: pos.coords.longitude }, target)))
        },
        () => {
          clearTimeout(watchdog)
          show(DENIED_MESSAGE)
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
      )
    } catch {
      clearTimeout(watchdog)
      show(DENIED_MESSAGE)
    }
  })
}

/** Name of the Monaco corner closest to (x, y) on the map's 0–100 grid. */
export function nearestCorner(x: number, y: number): string {
  let best = MONACO_CORNERS[0]
  let bestD = Infinity
  for (const c of MONACO_CORNERS) {
    const d = (c.x - x) ** 2 + (c.y - y) ** 2
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best.name
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}
interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** Pointer position → viewBox units, for an SVG drawn with the default xMidYMid meet (letterboxed). */
export function clientToViewBox(rect: Rect, vb: Box, clientX: number, clientY: number): { x: number; y: number } {
  const scale = Math.min(rect.width / vb.width, rect.height / vb.height)
  const offX = rect.left + (rect.width - vb.width * scale) / 2
  const offY = rect.top + (rect.height - vb.height * scale) / 2
  return { x: vb.x + (clientX - offX) / scale, y: vb.y + (clientY - offY) / scale }
}

/**
 * Monaco mini-map: hover or tap names the nearest corner and lights the line.
 * Keyboard: the "Next corner" button steps through corners (arrows go both ways).
 */
export function initMonaco(root: Document): void {
  const svg = root.querySelector<SVGSVGElement>('#setup svg.monaco')
  const label = root.querySelector<HTMLElement>('#setup .corner-name')
  const step = root.querySelector<HTMLButtonElement>('#setup button.corner-step')
  if (!svg || !label) return
  const dots = [...svg.querySelectorAll<SVGCircleElement>('.corner')]
  let index = -1

  const showCorner = (i: number) => {
    index = i
    svg.classList.add('lit')
    const name = MONACO_CORNERS[i].name
    if (label.textContent !== name) label.textContent = name
    dots.forEach((d, j) => d.classList.toggle('on', j === i))
  }
  const fromPointer = (e: PointerEvent | MouseEvent) => {
    const r = svg.getBoundingClientRect()
    const vb = svg.viewBox.baseVal
    const p = clientToViewBox(r, vb, e.clientX, e.clientY)
    const name = nearestCorner(p.x, p.y)
    showCorner(MONACO_CORNERS.findIndex(c => c.name === name))
  }
  svg.addEventListener('pointermove', fromPointer)
  svg.addEventListener('click', fromPointer)

  if (!step) return
  const n = MONACO_CORNERS.length
  step.addEventListener('click', () => showCorner((index + 1) % n))
  step.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    showCorner((index + d + n) % n)
  })
}
