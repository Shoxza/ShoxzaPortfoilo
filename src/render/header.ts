import type { Profile } from '../data/types'
import { esc } from './escape'

export function renderHeader(p: Profile, helmetSvg: string): string {
  return `<header class="top">
  <a class="skip" href="#work">Skip to projects</a>
  <nav class="nav" aria-label="Sections"><a href="#work">Work</a><a href="#crew">Crew</a><a href="#contact">Contact</a></nav>
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
