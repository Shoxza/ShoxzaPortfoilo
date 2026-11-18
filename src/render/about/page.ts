import type { About } from '../../data/about'
import type { Site } from '../../data/types'
import { esc } from '../escape'
import { renderHeader } from '../header'
import { renderTicker } from '../ticker'
import { renderJourney } from './journey'
import { renderToys } from './toys'

/** About page body. Complete and readable without JavaScript. */
export function renderAboutPage(a: About, site: Site, helmetSvg: string): string {
  return `${renderHeader(site.profile, helmetSvg, 'about')}
<main id="about">
  <section class="about-head">
    <h1>${esc(a.name)}</h1>
    <p class="alias"><span class="num">#${site.profile.number}</span><span class="handle">${esc(site.profile.handle)}</span></p>
    <p class="intro">${esc(a.intro)}</p>
  </section>
  ${renderJourney(a.stops)}
  ${renderToys(a)}
</main>
${renderTicker()}`
}
