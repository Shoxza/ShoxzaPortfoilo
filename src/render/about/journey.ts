import type { Stop } from '../../data/about'
import { esc } from '../escape'
import { SPA_POINTS, SPA_VIEWBOX, pointAlong } from './spa'

/** Where turn i of n sits along the lap (evenly spread, clear of the start line). */
const turnFraction = (i: number, n: number) => 0.03 + (0.88 * i) / (n - 1)

const path = (pts: { x: number; y: number }[]) => 'M' + pts.map(p => `${p.x} ${p.y}`).join(' L')

export function renderJourney(stops: Stop[], alsoOnTheWay: string[]): string {
  const n = stops.length
  const { w, h } = SPA_VIEWBOX
  // "Now": just past the last driven turn. Driven line up to there, dashed after.
  const lastDriven = stops.map(s => s.status).lastIndexOf('driven')
  const car = pointAlong(turnFraction(lastDriven, n) + 0.035)
  const driven = [...SPA_POINTS.slice(0, car.segment + 1), car]
  const next = [car, ...SPA_POINTS.slice(car.segment + 1)]
  const start = SPA_POINTS[0]

  const buttons = stops
    .map((s, i) => {
      const p = pointAlong(turnFraction(i, n))
      return `<button class="stop-btn" type="button" data-stop="${s.id}" data-status="${s.status}" style="left:${((p.x / w) * 100).toFixed(2)}%;top:${((p.y / h) * 100).toFixed(2)}%" aria-label="Turn ${i + 1}: ${esc(s.name)}">${i + 1}</button>`
    })
    .join('')
  const list = stops
    .map(
      (s, i) => `<li data-stop="${s.id}" data-status="${s.status}">
      <span class="turn">T${i + 1}</span><strong>${esc(s.name)}</strong><span class="year">${esc(s.year)}</span><span class="line">${esc(s.line)}</span>
    </li>`,
    )
    .join('')
  const also =
    alsoOnTheWay.length > 1
      ? `${alsoOnTheWay.slice(0, -1).map(esc).join(', ')} and ${esc(alsoOnTheWay[alsoOnTheWay.length - 1])}`
      : esc(alsoOnTheWay[0] ?? '')

  return `<section id="journey" class="journey-wrap" aria-labelledby="journey-h">
  <h2 id="journey-h" class="visually-hidden">The road so far, as a lap of Spa-Francorchamps</h2>
  <div class="journey-map">
    <svg class="journey" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
      <path class="limits" d="${path(SPA_POINTS)}"/>
      <path class="tarmac" d="${path(SPA_POINTS)}"/>
      <path class="racing-line--next" d="${path(next)}"/>
      <path class="racing-line" d="${path(driven)}"/>
      <circle class="start-dot" cx="${start.x}" cy="${start.y}" r="5"/>
      <circle class="car" cx="${car.x}" cy="${car.y}" r="8"/>
    </svg>
    ${buttons}
  </div>
  <ol class="stop-list">${list}</ol>
  ${also ? `<p class="also"><b>Also on the way:</b> ${also}.</p>` : ''}
</section>`
}
