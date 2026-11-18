import type { Profile } from '../data/types'
import { esc } from './escape'

export type Page = 'home' | 'about'

/** Same four links on both pages; on About they point back to the main page's sections. */
export function renderNav(page: Page): string {
  const base = page === 'home' ? '' : '/'
  const links: [string, string][] = [
    ['Work', `${base}#work`],
    ['Crew', `${base}#crew`],
    ['About', '/about'],
    ['Contact', `${base}#contact`],
  ]
  return `<nav class="nav" aria-label="Sections">${links
    .map(([label, href]) => `<a href="${href}"${page === 'about' && label === 'About' ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('')}</nav>`
}

/**
 * The bar at the top of both pages: brand and nav. It sticks to the top; bar.ts hides it while
 * you scroll down and brings it back as soon as you scroll up.
 */
function renderBar(p: Profile, helmetSvg: string, page: Page): string {
  // Home already has the full helmet inline in the hero, so the bar reuses it with <use>
  // instead of shipping it twice. The home brand only shows once you've scrolled.
  const helmet =
    page === 'home' ? '<svg viewBox="0 0 705 568" aria-hidden="true" focusable="false"><use href="#helmet"/></svg>' : helmetSvg
  const brand =
    page === 'home'
      ? `<a class="brand brand--home" href="#top" aria-label="Shoxza, back to top">`
      : `<a class="brand" href="/" aria-label="Shoxza, home">`
  return `<header class="bar" data-bar>
  <div class="bar-in">
    ${brand}<span class="helmet">${helmet}</span><span class="brand-name">${esc(p.handle)}</span></a>
    ${renderNav(page)}
  </div>
</header>`
}

export function renderHeader(p: Profile, helmetSvg: string, page: Page): string {
  if (page === 'about') {
    return `<a class="skip" href="#about">Skip to content</a>
${renderBar(p, helmetSvg, 'about')}`
  }
  return `<a class="skip" href="#work">Skip to projects</a>
${renderBar(p, helmetSvg, 'home')}
<div class="top" id="top">
  <div class="hero">
    <div class="id">
      <div class="id-text">
        <p class="num">#${p.number}</p>
        <h1 id="name" class="name">${esc(p.handle)}</h1>
        <p class="tagline">${esc(p.tagline)}</p>
      </div>
      <div class="helmet">${helmetSvg}</div>
    </div>
    <p class="who"><span class="title">${esc(p.title)}</span><span class="where">${esc(p.location)}</span></p>
  </div>
  <a class="scroll-cue" href="#work"><span>Projects</span><span class="cue-track" aria-hidden="true"></span></a>
</div>`
}
