import type { CrewRole, ProjectKind, Site } from '../data/types'
import { esc } from './escape'

export const kindLabel: Record<ProjectKind, string> = { personal: 'Personal', school: 'School' }

export const tyre = (kind: ProjectKind) =>
  `<svg class="tyre tyre--${kind}" aria-hidden="true" focusable="false"><use href="#tyre"/></svg>`

/** The tyre icon definition, emitted once per page. */
export const tyreSymbol = `<symbol id="tyre" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15.6" fill="#121110"/><circle cx="16" cy="16" r="12.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="16" r="9.6" fill="#2c2b28"/><g stroke="#4b4944" stroke-width="2.2" stroke-linecap="round"><line x1="16" y1="16" x2="16" y2="7.6"/><line x1="16" y1="16" x2="24" y2="13.4"/><line x1="16" y1="16" x2="20.9" y2="22.8"/><line x1="16" y1="16" x2="11.1" y2="22.8"/><line x1="16" y1="16" x2="8" y2="13.4"/></g><circle cx="16" cy="16" r="2.6" fill="#6a6760"/></symbol>`

/** "25–27" for a range, "27" for one season. The blue tab sits on the row's right edge. */
function seasonRange(seasons: number[]): { short: string; spoken: string } {
  const first = Math.min(...seasons)
  const last = Math.max(...seasons)
  return first === last
    ? { short: `${first}`, spoken: `Season 20${first}` }
    : { short: `${first}–${last}`, spoken: `Seasons 20${first} to 20${last}` }
}

function renderCrewRole(c: CrewRole): string {
  const range = seasonRange(c.seasons)
  return `<li class="crew-role">
      <img class="logo" src="${esc(c.logo.src)}" alt="${esc(c.logo.alt)}" width="64" height="30" loading="lazy">
      <span class="who-role"><span class="org">${esc(c.org)}</span><span class="role">${esc(c.role)}</span></span>
      <span class="seasons"><span class="visually-hidden">${range.spoken}</span><span aria-hidden="true">${range.short}</span></span>
    </li>`
}

export function renderTower(site: Site): string {
  const rows = site.projects
    .map(
      (p, i) => `<li><button class="run" type="button" data-slug="${esc(p.slug)}" aria-controls="p-${esc(p.slug)}">
        <span class="pos">${i + 1}</span>${tyre(p.kind)}<span class="n">${esc(p.name)}</span><span class="yr">${p.year}</span>
      </button></li>`,
    )
    .join('')
  const legend = (Object.keys(kindLabel) as ProjectKind[])
    .map(k => `<li>${tyre(k)}${kindLabel[k]}</li>`)
    .join('')
  const crew = site.crew.map(renderCrewRole).join('')
  return `<div class="tower">
  <section id="work" class="tower-part" aria-labelledby="work-h">
    <div class="lbl"><h2 id="work-h">Projects</h2><span aria-hidden="true">Year</span></div>
    <ol class="runs">${rows}</ol>
    <ul class="legend" aria-label="Tyre colours">${legend}</ul>
  </section>
  <section id="crew" class="tower-part" aria-labelledby="crew-h">
    <div class="lbl"><h2 id="crew-h">Crew</h2><span aria-hidden="true">Seasons</span></div>
    <ul class="crew">${crew}</ul>
  </section>
</div>`
}
