import { PENDING, type Link, type Project, type Visual } from '../data/types'
import { renderCarousel } from './carousel'
import { esc } from './escape'
import { kindLabel, projectYear } from './tower'

const lapTrace = `<svg class="lap-trace" viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-label="Illustration: two lap speed traces compared">
  <polyline class="ref" fill="none" points="0,166 50,146 100,76 150,46 200,52 250,122 300,188 350,170 400,96 450,46 500,38 550,114 600,150"/>
  <polyline class="cur" fill="none" points="0,160 50,140 100,62 150,34 200,42 250,112 300,180 350,160 400,82 450,34 500,28 550,102 600,140"/>
</svg>`

/** Screenshots open the project's main link, unless a screenshot has its own href. */
function renderVisual(v: Visual, name: string, href?: string): string {
  if (!v) return ''
  if (v.kind === 'lap-trace') return `<div class="visual">${lapTrace}</div>`
  const shots = v.images.map(s => ({ ...s, href: s.href ?? href }))
  return `<div class="visual visual--shots">${renderCarousel(shots, `Screenshots of ${name}`)}</div>`
}

const arrow = `<svg class="title-arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/** A link's address and text: a plain address shows as its site name ("gjoviktech.no"). */
export function linkParts(l: Link): { label: string; href: string } {
  if (typeof l !== 'string') return l
  let label = l
  try {
    label = new URL(l).hostname.replace(/^www\./, '')
  } catch {
    // Not a full address (no https://): show it as written.
  }
  return { label, href: l }
}

function renderProject(p: Project): string {
  const s = esc(p.slug)
  // The first link is the project's main one: the title and screenshots open it too.
  const main = p.links.length ? linkParts(p.links[0]).href : undefined
  const title = main
    ? `<a class="title-link" href="${esc(main)}" rel="noopener">${esc(p.name)}${arrow}</a>`
    : esc(p.name)
  const band = [kindLabel[p.kind], p.stack.join(', '), projectYear(p.year).short, ...(p.role ? [p.role] : [])]
    .map((b, i) => `<span${i === 2 ? ' data-step' : ''}>${esc(b)}</span>`)
    .join('')
  const radio =
    p.radio && p.radio !== PENDING
      ? `<figure class="radio"><figcaption>Team radio</figcaption><blockquote><q>${esc(p.radio)}</q></blockquote></figure>`
      : ''
  const features = p.features.length
    ? `<ul class="features">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`
    : ''
  const links = p.links.length
    ? `<p class="links">${p.links.map(linkParts).map(l => `<a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join('')}</p>`
    : ''
  return `<article class="project" id="p-${s}" data-slug="${s}" aria-labelledby="p-${s}-h">
  <header class="project-head">
    <h2 id="p-${s}-h">${title}</h2>
    <p class="desc">${esc(p.description)}</p>
    <p class="band">${band}</p>
  </header>
  ${radio}${renderVisual(p.visual, p.name, main)}${features}${links}
</article>`
}

export function renderFeed(projects: Project[]): string {
  return `<section id="feed" class="feed" aria-label="Project details">${projects.map(renderProject).join('')}</section>`
}
