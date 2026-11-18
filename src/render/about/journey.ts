import type { Stop } from '../../data/about'
import { esc } from '../escape'

/** The circuit's frame, tight around the track. */
const VB = { x: 50, y: 40, w: 880, h: 330 }

/** Where each stop sits on the circuit, in SVG user units. */
export const STOP_POS: Record<Stop['id'], { x: number; y: number }> = {
  ni: { x: 170, y: 320 },
  vestnes: { x: 205, y: 95 },
  gjovik: { x: 600, y: 95 },
  berlin: { x: 860, y: 185 },
  india: { x: 760, y: 320 },
}

/** "You are here": where the driven line ends, just past Berlin. */
const CAR = { x: 851, y: 236 }

// One smooth lap. Driven: Northern Ireland → Vestnes → Gjøvik → Berlin.
const DRIVEN =
  'M170 320 C110 320 90 280 92 220 C94 150 130 95 205 95 L600 95 C660 95 700 110 760 125 C830 142 860 160 860 185 C860 205 858 222 851 236'
// Not yet driven: on to India, then the final straight home.
const NEXT = 'M851 236 C838 270 808 312 760 320 L170 320'

export function renderJourney(stops: Stop[]): string {
  const buttons = stops
    .map(s => {
      const p = STOP_POS[s.id]
      return `<button class="stop-btn" type="button" data-stop="${s.id}" data-status="${s.status}" style="left:${(((p.x - VB.x) / VB.w) * 100).toFixed(2)}%;top:${(((p.y - VB.y) / VB.h) * 100).toFixed(2)}%" aria-describedby="stop-${s.id}">
        <span class="dot" aria-hidden="true"></span><span class="label">${esc(s.short)}</span>
      </button>`
    })
    .join('')
  const list = stops
    .map(s => `<li data-stop="${s.id}" data-status="${s.status}" id="stop-${s.id}"><strong>${esc(s.name)}</strong> <span>${esc(s.line)}</span></li>`)
    .join('')
    return `<section id="journey" class="journey-wrap" aria-labelledby="journey-h">
  <h2 id="journey-h" class="visually-hidden">The road so far</h2>
  <div class="journey-map">
    <svg class="journey" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true" focusable="false">
      <path class="limits" d="${DRIVEN}"/><path class="limits" d="${NEXT}"/>
      <path class="tarmac" d="${DRIVEN}"/><path class="tarmac" d="${NEXT}"/>
      <path class="racing-line--next" d="${NEXT}"/>
      <path class="racing-line" d="${DRIVEN}"/>
      <g class="start-line" transform="translate(${STOP_POS.ni.x + 30} 302)"><rect width="6" height="36"/><rect x="6" width="6" height="36" class="dark"/></g>
      <circle class="car" cx="${CAR.x}" cy="${CAR.y}" r="11"/>
    </svg>
    ${buttons}
  </div>
  <ol class="stop-list">${list}</ol>
</section>`
}
