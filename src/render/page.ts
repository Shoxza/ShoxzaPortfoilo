import type { Site } from '../data/types'
import { renderContact } from './contact'
import { renderFeed } from './feed'
import { renderHeader } from './header'
import { renderTicker } from './ticker'
import { renderTower, tyreSymbol } from './tower'

/** Full body markup. Complete and readable without JavaScript. */
export function renderPage(site: Site, helmetSvg: string): string {
  return `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">${tyreSymbol}</svg>
${renderHeader(site.profile, helmetSvg)}
<main>
  <div class="board">
    ${renderTower(site)}
    ${renderFeed(site.projects)}
  </div>
  ${renderContact(site.profile)}
</main>
${renderTicker()}`
}
