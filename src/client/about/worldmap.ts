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

const MAP_W = 360
const MAP_H = 138
/** Closest a visitor can zoom in by hand, in degrees across. */
const MIN_ZOOM_W = 8

/** Keeps a view inside the map; a view bigger than the map is centred on it. */
export function clampView(v: View): View {
  const x = v.w >= MAP_W ? (MAP_W - v.w) / 2 : Math.min(Math.max(v.x, 0), MAP_W - v.w)
  const y = v.h >= MAP_H ? (MAP_H - v.h) / 2 : Math.min(Math.max(v.y, 0), MAP_H - v.h)
  return { x, y, w: v.w, h: v.h }
}

/** Zooms by factor (above 1 zooms out) keeping the map point `at` where it is on screen. */
export function zoomView(v: View, factor: number, at: Pt = { x: v.x + v.w / 2, y: v.y + v.h / 2 }): View {
  const w = Math.min(Math.max(v.w * factor, MIN_ZOOM_W), MAP_W)
  const s = w / v.w
  return clampView({ x: at.x - (at.x - v.x) * s, y: at.y - (at.y - v.y) * s, w, h: v.h * s })
}

/** Per-map state: where "reset" goes, and a token that cancels the fly-in when someone grabs it. */
interface MapState {
  home: View
  token: number
  finish?: () => void
}
const state = new WeakMap<SVGSVGElement, MapState>()
const stateOf = (svg: SVGSVGElement): MapState => {
  let s = state.get(svg)
  if (!s) {
    s = { home: parseView(svg.getAttribute('viewBox')), token: 0 }
    state.set(svg, s)
  }
  return s
}

/** Stops a fly-in that's under way (the route jumps to fully drawn). */
function interrupt(svg: SVGSVGElement) {
  const s = stateOf(svg)
  s.token++
  s.finish?.()
  s.finish = undefined
}

/** Client (screen) point to map units, through the svg's own transform. */
function toMap(svg: SVGSVGElement, clientX: number, clientY: number): Pt | undefined {
  const m = svg.getScreenCTM?.()
  if (!m || typeof DOMPoint !== 'function') return undefined
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

/**
 * Sizes the dots and pins for the map as drawn (again whenever the card resizes), and makes it
 * explorable: drag to pan, wheel or pinch to zoom, the zoom buttons, and arrow keys, + - and 0
 * when the map has focus.
 */
export function initWorldMap(root: Document): void {
  const svg = root.querySelector<SVGSVGElement>('#distance svg.world')
  const wrap = root.querySelector<HTMLElement>('#distance .world-wrap')
  if (!svg || !wrap) return
  const view = () => parseView(svg.getAttribute('viewBox'))
  const apply = () => rescale(svg, view())
  apply()
  if (typeof ResizeObserver === 'function') new ResizeObserver(apply).observe(svg)
  stateOf(svg)
  const go = (v: View) => {
    interrupt(svg)
    setView(svg, clampView(v))
  }

  // Drag to pan; two fingers pinch to zoom.
  const pointers = new Map<number, { x: number; y: number }>()
  svg.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    svg.setPointerCapture?.(e.pointerId)
    wrap.classList.add('dragging')
  })
  svg.addEventListener('pointermove', e => {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    const v = view()
    const k = unitsPerPx(svg, v)
    if (pointers.size === 1) {
      go({ ...v, x: v.x - (e.clientX - prev.x) * k, y: v.y - (e.clientY - prev.y) * k })
    } else if (pointers.size === 2) {
      const other = [...pointers].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
      const at = toMap(svg, (e.clientX + other.x) / 2, (e.clientY + other.y) / 2)
      if (before > 0 && after > 0) go(zoomView(v, before / after, at))
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  })
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (!pointers.size) wrap.classList.remove('dragging')
  }
  svg.addEventListener('pointerup', up)
  svg.addEventListener('pointercancel', up)

  // Wheel or trackpad zooms around the pointer.
  svg.addEventListener(
    'wheel',
    e => {
      e.preventDefault()
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      go(zoomView(view(), Math.exp(dy * 0.0015), toMap(svg, e.clientX, e.clientY)))
    },
    { passive: false },
  )

  // Buttons and keys.
  const zoomBy = (f: number) => go(zoomView(view(), f))
  const reset = () => go(stateOf(svg).home)
  wrap.querySelector('.zoom-in')?.addEventListener('click', () => zoomBy(0.7))
  wrap.querySelector('.zoom-out')?.addEventListener('click', () => zoomBy(1 / 0.7))
  wrap.querySelector('.zoom-reset')?.addEventListener('click', reset)
  wrap.tabIndex = 0
  wrap.addEventListener('keydown', e => {
    if (e.target !== wrap) return
    const v = view()
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-0.15, 0],
      ArrowRight: [0.15, 0],
      ArrowUp: [0, -0.15],
      ArrowDown: [0, 0.15],
    }
    const step = steps[e.key]
    if (step) go({ ...v, x: v.x + step[0] * v.w, y: v.y + step[1] * v.h })
    else if (e.key === '+' || e.key === '=') zoomBy(0.7)
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 0.7)
    else if (e.key === '0') reset()
    else return
    e.preventDefault()
  })
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
  // Where the zoom buttons cover a strip on the right of the map (not on phones, where they sit
  // above it), frame the two points in the space left of it.
  const ctrl = root.querySelector<HTMLElement>('#distance .map-ctrl')?.getBoundingClientRect()
  const ctrlW = ctrl && box.width && ctrl.bottom > box.top ? box.right - ctrl.left : 0
  const side = box.width ? Math.min(Math.max(ctrlW, 0) / box.width, 0.25) : 0
  const mx = (box.width ? Math.min(LABEL_ROOM_PX / box.width, 0.3) : 0.2) + side / 2
  const fit = fitView(h, y, aspect, { mx, my: 0.22, minW: MIN_VIEW_W })
  const to = side ? clampView({ ...fit, x: fit.x + (fit.w * side) / 2 }) : fit
  // Labels treat the buttons' strip as the edge, so a label never runs under them.
  placeLabels(svg, h, y, { ...to, w: to.w * (1 - side) }, box.width ? to.w / box.width : 1)
  const from = parseView(svg.getAttribute('viewBox'))
  // "Reset" now goes back to this framing of you and Gjøvik.
  const st = stateOf(svg)
  interrupt(svg)
  st.home = to
  const reduced = opts.reduced ?? prefersReducedMotion()
  if (reduced || typeof requestAnimationFrame !== 'function') {
    setView(svg, to)
    route?.setAttribute('d', arcPath(y, h))
    return
  }
  const token = st.token
  // If someone grabs the map mid-flight, the route snaps to fully drawn and the map stays put.
  st.finish = () => route?.setAttribute('d', arcPath(y, h))
  const ms = 1400
  const t0 = performance.now()
  const frame = (now: number) => {
    if (st.token !== token) return
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
    else st.finish = undefined
  }
  requestAnimationFrame(frame)
}
