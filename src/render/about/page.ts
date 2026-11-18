import type { About } from '../../data/about'
import type { Profile, Site } from '../../data/types'
import { esc } from '../escape'
import { renderHeader } from '../header'
import { renderTicker } from '../ticker'
import { renderJourney } from './journey'
import { ageOn } from './age'
import { renderToys } from './toys'

/** Under the map, like the driver line on a timing screen: name, number, handle and age. */
function renderDriverCard(a: About, p: Profile, today = new Date()): string {
  const rows: [string, string][] = [
    ['Driver', a.name],
    ['Number', `#${p.number}`],
    ['Handle', p.handle],
    ...(a.born ? ([['Age', String(ageOn(a.born, today))]] as [string, string][]) : []),
  ]
  return `<section class="driver" aria-label="Driver">
  <dl>${rows
    .map(([k, v]) => `<div><dt>${k}</dt><dd${k === 'Age' && a.born ? ` data-born="${esc(a.born)}"` : ''}>${esc(v)}</dd></div>`)
    .join('')}</dl>
</section>`
}

/** About page body. Complete and readable without JavaScript. */
export function renderAboutPage(a: About, site: Site, helmetSvg: string): string {
  return `${renderHeader(site.profile, helmetSvg, 'about')}
<main id="about">
  <section class="about-head${a.photo ? ' about-head--photo' : ''}">
    <div class="about-hello">
      <h1>${esc(a.greeting)}</h1>
      <p class="intro">${esc(a.intro)}</p>
    </div>
    ${a.photo ? `<img class="portrait" src="${esc(a.photo.src)}" alt="${esc(a.photo.alt)}" width="${a.photo.width}" height="${a.photo.height}">` : ''}
  </section>
  ${renderJourney(a.stops, a.alsoOnTheWay)}
  ${renderDriverCard(a, site.profile)}
  ${renderToys(a)}
</main>
${renderTicker()}`
}
