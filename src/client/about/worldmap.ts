import { fitView, project } from '../../render/about/project'
import { prefersReducedMotion } from '../motion'
import type { LatLon } from './distance'

type View = { x: number; y: number; w: number; h: number }
type Pt = { x: number; y: number }

// Sizes on screen, in CSS pixels, whatever the zoom: pins and the LED dot grid stay crisp.
const DOT_GAP_PX = 4.2
const DOT_R_PX = 1.25
/** Closest the map zooms in, in degrees across, so the 1:110m coastline still reads. */
const MIN_VIEW_W = 22
/** Room kept clear beside each pin for its label, in CSS pixels. */
const LABEL_ROOM_PX = 64

/** Initial bearing from a to b, degrees clockwise from north. */
export function bearing(a: LatLon, b: LatLon): number {
  const r = (d: number) => (d * Math.PI) / 180
  const dl = r(b.lon - a.lon)
  const y = Math.sin(dl) * Math.cos(r(b.lat))
  const x = Math.cos(r(a.lat)) * Math.sin(r(b.lat)) - Math.sin(r(a.lat)) * Math.cos(r(b.lat)) * Math.cos(dl)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function compass(deg: number): string {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8]
}

/** "034° NE" */
export function bearingLabel(deg: number): string {
  return `${String(Math.round(deg) % 360).padStart(3, '0')}° ${compass(deg)}`
}

/** "+1 284 km", with a no-break thousands space. */
export function gapLabel(km: number): string {
  return `+${String(Math.round(km)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km`
}

/**
 * The route as a flight-style arc from a to b, drawn up to t (0–1). The bend is a fixed share
 * of the length and always bows upward on the map.
 */
export function arcPath(a: Pt, b: Pt, t = 1): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  let nx = -dy * 0.22
  let ny = dx * 0.22
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const c = { x: (a.x + b.x) / 2 + nx, y: (a.y + b.y) / 2 + ny }
  const lerp = (p: Pt, q: Pt, s: number) => ({ x: p.x + (q.x - p.x) * s, y: p.y + (q.y - p.y) * s })
  const p1 = lerp(a, c, t)
  const p2 = lerp(p1, lerp(c, b, t), t)
  const f = (n: number) => +n.toFixed(2)
  return `M${f(a.x)} ${f(a.y)}Q${f(p1.x)} ${f(p1.y)} ${f(p2.x)} ${f(p2.y)}`
}

const parseView = (s: string | null): View => {
  const [x, y, w, h] = (s ?? '0 0 360 138').split(/\s+/).map(Number)
  return { x, y, w, h }
}

/** Map units per CSS pixel for a view drawn with "slice" into the svg's box. */
function unitsPerPx(svg: SVGSVGElement, v: View): number {
  const box = svg.getBoundingClientRect()
  if (!box.width || !box.height) return v.w / 360
  return 1 / Math.max(box.width / v.w, box.height / v.h)
}

/** Keeps the dot grid and the pins the same size on screen at the current zoom. */
function rescale(svg: SVGSVGElement, v: View) {
  const k = unitsPerPx(svg, v)
  const pat = svg.querySelector('pattern')
  const dot = pat?.querySelector('circle')
  if (pat && dot) {
    const gap = +(DOT_GAP_PX * k).toFixed(3)
    pat.setAttribute('width', String(gap))
    pat.setAttribute('height', String(gap))
    dot.setAttribute('cx', String(gap / 2))
    dot.setAttribute('cy', String(gap / 2))
    dot.setAttribute('r', String(+(DOT_R_PX * k).toFixed(3)))
  }
  for (const pin of svg.querySelectorAll<SVGGElement>('.pin')) {
    pin.setAttribute('transform', `translate(${pin.dataset.x} ${pin.dataset.y}) scale(${+k.toFixed(4)})`)
  }
}

const setView = (svg: SVGSVGElement, v: View) => {
  svg.setAttribute('viewBox', `${+v.x.toFixed(2)} ${+v.y.toFixed(2)} ${+v.w.toFixed(2)} ${+v.h.toFixed(2)}`)
  rescale(svg, v)
}

/** Sizes the dots and pins for the map as drawn, and again whenever the card resizes. */
export function initWorldMap(root: Document): void {
  const svg = root.querySelector<SVGSVGElement>('#distance svg.world')
  if (!svg) return
  const apply = () => rescale(svg, parseView(svg.getAttribute('viewBox')))
  apply()
  if (typeof ResizeObserver === 'function') new ResizeObserver(apply).observe(svg)
}

/**
 * Each label goes on the side away from the other pin, so the two never collide, unless that
 * side runs out of map in the final view; then it flips.
 */
export function labelSides(h: Pt, y: Pt, view: View, unitsPerPx: number): { home: 'left' | 'right'; you: 'left' | 'right' } {
  const room = LABEL_ROOM_PX * unitsPerPx
  const side = (p: Pt, away: 'left' | 'right'): 'left' | 'right' => {
    if (away === 'right' && p.x + room > view.x + view.w) return 'left'
    if (away === 'left' && p.x - room < view.x) return 'right'
    return away
  }
  const youLeft = y.x < h.x
  return { you: side(y, youLeft ? 'left' : 'right'), home: side(h, youLeft ? 'right' : 'left') }
}

function placeLabels(svg: SVGSVGElement, h: Pt, y: Pt, view: View, k: number) {
  const sides = labelSides(h, y, view, k)
  for (const [sel, side] of [['.pin--you text', sides.you], ['.pin--home text', sides.home]] as const) {
    const t = svg.querySelector(sel)
    t?.setAttribute('x', side === 'left' ? '-10' : '10')
    t?.setAttribute('text-anchor', side === 'left' ? 'end' : 'start')
  }
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * After the distance check: drop your pin, fly the map to frame you and Gjøvik, draw the route
 * as an arc and fill in the gap and bearing readout.
 */
export function plotOnMap(
  root: Document,
  home: LatLon,
  you: LatLon,
  km: number,
  opts: { reduced?: boolean } = {},
): void {
  const svg = root.querySelector<SVGSVGElement>('#distance svg.world')
  if (!svg) return
  const h = project(home.lat, home.lon)
  const y = project(you.lat, you.lon)
  const pin = svg.querySelector<SVGGElement>('.pin--you')
  const route = svg.querySelector('.route')
  if (pin) {
    pin.dataset.x = String(y.x)
    pin.dataset.y = String(y.y)
    pin.setAttribute('visibility', 'visible')
  }
  const readout = root.querySelector<HTMLElement>('#distance .readout')
  if (readout) {
    const gap = readout.querySelector('.r-gap')
    const brg = readout.querySelector('.r-brg')
    if (gap) gap.textContent = km < 5 ? 'In Gjøvik' : gapLabel(km)
    if (brg) brg.textContent = km < 5 ? '—' : bearingLabel(bearing(you, home))
    readout.hidden = false
  }

  const box = svg.getBoundingClientRect()
  const aspect = box.width && box.height ? box.width / box.height : 360 / 138
  const mx = box.width ? Math.min(LABEL_ROOM_PX / box.width, 0.3) : 0.2
  const to = fitView(h, y, aspect, { mx, my: 0.22, minW: MIN_VIEW_W })
  placeLabels(svg, h, y, to, box.width ? to.w / box.width : 1)
  const from = parseView(svg.getAttribute('viewBox'))
  const reduced = opts.reduced ?? prefersReducedMotion()
  if (reduced || typeof requestAnimationFrame !== 'function') {
    setView(svg, to)
    route?.setAttribute('d', arcPath(y, h))
    return
  }
  const ms = 1400
  const t0 = performance.now()
  const frame = (now: number) => {
    const p = Math.min((now - t0) / ms, 1)
    const z = ease(Math.min(p / 0.75, 1))
    setView(svg, {
      x: from.x + (to.x - from.x) * z,
      y: from.y + (to.y - from.y) * z,
      w: from.w + (to.w - from.w) * z,
      h: from.h + (to.h - from.h) * z,
    })
    // The route draws in from your pin once the zoom is under way.
    route?.setAttribute('d', arcPath(y, h, ease(Math.max(0, (p - 0.3) / 0.7))))
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
