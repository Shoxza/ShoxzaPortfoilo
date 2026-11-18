import type { Stop } from '../../data/about'
import { esc } from '../escape'

/** The circuit's frame, tight around the track. */
const VB = { x: 60, y: 30, w: 900, h: 340 }

/** Where each stop sits on the circuit, in SVG user units. */
export const STOP_POS: Record<Stop['id'], { x: number; y: number }> = {
  ni: { x: 140, y: 330 },
  vestnes: { x: 230, y: 110 },
  gjovik: { x: 720, y: 150 },
  berlin: { x: 885, y: 82 },
  india: { x: 860, y: 262 },
}

// Driven: Northern Ireland → Vestnes → Gjøvik, plus the Berlin detour loop back to Gjøvik.
const DRIVEN =
  'M140 330 C100 330 90 240 130 180 C160 130 190 110 230 110 L600 110 C680 110 720 120 720 150 C760 100 830 50 885 82 C930 110 900 160 850 165 C800 170 760 165 720 150'
// Not yet driven: Gjøvik → India, then the final straight home.
const NEXT = 'M720 150 C760 180 840 200 860 262 C875 310 850 330 800 330 L140 330'

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
  const g = STOP_POS.gjovik
  return `<section id="journey" class="journey-wrap" aria-labelledby="journey-h">
  <h2 id="journey-h" class="visually-hidden">The road so far</h2>
  <div class="journey-map">
    <svg class="journey" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true" focusable="false">
      <path class="limits" d="${DRIVEN}"/><path class="limits" d="${NEXT}"/>
      <path class="tarmac" d="${DRIVEN}"/><path class="tarmac" d="${NEXT}"/>
      <path class="racing-line--next" d="${NEXT}"/>
      <path class="racing-line" d="${DRIVEN}"/>
      <g class="start-line" transform="translate(${STOP_POS.ni.x + 26} 312)"><rect width="6" height="36"/><rect x="6" width="6" height="36" class="dark"/></g>
      <circle class="car" cx="${g.x}" cy="${g.y}" r="11"/>
    </svg>
    ${buttons}
  </div>
  <ol class="stop-list">${list}</ol>
</section>`
}
