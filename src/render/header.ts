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

export function renderHeader(p: Profile, helmetSvg: string, page: Page): string {
  if (page === 'about') {
    return `<header class="top top--compact">
  <a class="skip" href="#about">Skip to content</a>
  <a class="brand" href="/" aria-label="Shoxza, home"><span class="helmet">${helmetSvg}</span><span class="brand-name">${esc(p.handle)}</span></a>
  ${renderNav('about')}
</header>`
  }
  return `<header class="top">
  <a class="skip" href="#work">Skip to projects</a>
  ${renderNav('home')}
  <div class="hero">
    <div class="id">
      <div class="helmet">${helmetSvg}</div>
      <div class="id-text">
        <p class="num">#${p.number}</p>
        <h1 id="name" class="name" style="--wdth:125">${esc(p.handle)}</h1>
      </div>
    </div>
    <p class="who"><span class="title">${esc(p.title)}</span><span class="where">${esc(p.location)}</span></p>
  </div>
</header>`
}
