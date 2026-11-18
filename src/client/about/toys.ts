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

/** Throw the ball; Piper brings it back. One ball in flight at a time. */
export function initPiper(root: Document, opts: { reduced: boolean; returnMs?: number }): void {
  const btn = root.querySelector<HTMLButtonElement>('#piper button.throw')
  const ball = root.querySelector<HTMLElement>('#piper .ball')
  const msg = root.querySelector<HTMLElement>('#piper .fetch-msg')
  if (!btn || !ball || !msg) return
  const back = 'Piper brought it back.'
  btn.addEventListener('click', () => {
    if (btn.disabled) return
    if (opts.reduced) {
      msg.textContent = back
      return
    }
    msg.textContent = ''
    btn.disabled = true
    ball.classList.add('thrown')
    setTimeout(() => {
      ball.classList.remove('thrown')
      msg.textContent = back
      btn.disabled = false
    }, opts.returnMs ?? 1200)
  })
}

/** Opt-in distance to Gjøvik, worked out in the browser. Nothing is sent anywhere. */
export function initDistance(root: Document, target: LatLon, geo: Geolocation | undefined): void {
  const btn = root.querySelector<HTMLButtonElement>('#distance button.locate')
  const out = root.querySelector<HTMLElement>('#distance .distance-out')
  if (!btn || !out) return
  const done = (text: string) => {
    out.textContent = text
    btn.disabled = false
  }
  btn.addEventListener('click', () => {
    if (!geo) return done(DENIED_MESSAGE)
    btn.disabled = true
    out.textContent = 'Checking…'
    try {
      geo.getCurrentPosition(
        pos => done(distanceMessage(haversineKm({ lat: pos.coords.latitude, lon: pos.coords.longitude }, target))),
        () => done(DENIED_MESSAGE),
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
      )
    } catch {
      done(DENIED_MESSAGE)
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

/** Hover or tap the Monaco map: the line lights up and the nearest corner is named. */
export function initMonaco(root: Document): void {
  const svg = root.querySelector<SVGSVGElement>('#setup svg.monaco')
  const label = root.querySelector<HTMLElement>('#setup .corner-name')
  if (!svg || !label) return
  const dots = [...svg.querySelectorAll<SVGCircleElement>('.corner')]
  const point = (e: PointerEvent | MouseEvent) => {
    const r = svg.getBoundingClientRect()
    const vb = svg.viewBox.baseVal
    return {
      x: vb.x + ((e.clientX - r.left) / r.width) * vb.width,
      y: vb.y + ((e.clientY - r.top) / r.height) * vb.height,
    }
  }
  const show = (e: PointerEvent | MouseEvent) => {
    svg.classList.add('lit')
    const p = point(e)
    const name = nearestCorner(p.x, p.y)
    if (label.textContent !== name) label.textContent = name
    dots.forEach((d, i) => d.classList.toggle('on', MONACO_CORNERS[i].name === name))
  }
  svg.addEventListener('pointermove', show)
  svg.addEventListener('click', show)
}
