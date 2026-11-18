import { esc } from './escape'

/** One picture in a carousel: Piper's photos, or a project's screenshots. */
export interface Shot {
  src: string
  alt: string
  /** The file's pixel size, so the space is kept while it loads. */
  width: number
  height: number
  /** Optional line under the picture. */
  caption?: string
  /** Optional link: clicking the picture opens it (a live site, a repo, a bigger version). */
  href?: string
}

function figure(s: Shot): string {
  const img = `<img src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async">`
  const pic = s.href ? `<a class="shot-link" href="${esc(s.href)}" rel="noopener">${img}</a>` : img
  return `<figure>${pic}${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure>`
}

/**
 * One picture is just a figure. Two or more become a carousel: a scroll-snap strip you can swipe
 * without JS, plus previous/next buttons and a count that client/carousel.ts wires up.
 */
export function renderCarousel(shots: Shot[], label: string, extraClass = ''): string {
  if (!shots.length) return ''
  if (shots.length === 1) return `<div class="single ${extraClass}">${figure(shots[0])}</div>`
  const n = shots.length
  const slides = shots
    .map((s, i) => `<li class="slide" aria-roledescription="slide" aria-label="${i + 1} of ${n}">${figure(s)}</li>`)
    .join('')
  return `<div class="carousel ${extraClass}" aria-roledescription="carousel" aria-label="${esc(label)}">
    <ul class="slides" tabindex="0" aria-label="Pictures, scroll sideways">${slides}</ul>
    <div class="carousel-nav">
      <button class="prev" type="button" aria-label="Previous picture"><span aria-hidden="true">←</span></button>
      <span class="count" aria-live="polite">1 / ${n}</span>
      <button class="next" type="button" aria-label="Next picture"><span aria-hidden="true">→</span></button>
    </div>
  </div>`
}
