import { PENDING, type Project, type Visual } from '../data/types'
import { esc } from './escape'
import { kindLabel } from './tower'

const lapTrace = `<svg class="lap-trace" viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-label="Illustration: two lap speed traces compared">
  <polyline class="ref" fill="none" points="0,166 50,146 100,76 150,46 200,52 250,122 300,188 350,170 400,96 450,46 500,38 550,114 600,150"/>
  <polyline class="cur" fill="none" points="0,160 50,140 100,62 150,34 200,42 250,112 300,180 350,160 400,82 450,34 500,28 550,102 600,140"/>
</svg>`

function renderVisual(v: Visual): string {
  if (!v) return ''
  if (v.kind === 'lap-trace') return `<div class="visual">${lapTrace}</div>`
  return `<div class="visual"><img src="${esc(v.src)}" alt="${esc(v.alt)}" width="${v.width}" height="${v.height}" loading="lazy" decoding="async"></div>`
}

function renderProject(p: Project): string {
  const s = esc(p.slug)
  const band = [kindLabel[p.kind], p.stack.join(', '), String(p.year), ...(p.role ? [p.role] : [])]
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
    ? `<p class="links">${p.links.map(l => `<a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join('')}</p>`
    : ''
  return `<article class="project" id="p-${s}" data-slug="${s}" aria-labelledby="p-${s}-h">
  <header class="project-head">
    <h2 id="p-${s}-h">${esc(p.name)}</h2>
    <p class="desc">${esc(p.description)}</p>
    <p class="band">${band}</p>
  </header>
  ${radio}${renderVisual(p.visual)}${features}${links}
</article>`
}

export function renderFeed(projects: Project[]): string {
  return `<section id="feed" class="feed" aria-label="Project details">${projects.map(renderProject).join('')}</section>`
}
