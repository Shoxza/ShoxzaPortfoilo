/**
 * Picture carousels (Piper's photos, project screenshots; markup from render/carousel.ts). The
 * slides are a scroll-snap strip, so swiping, trackpads and arrow keys already work; this wires
 * the previous/next buttons and keeps the "2 / 4" count in step.
 */
export function initCarousel(root: Document | Element, opts: { reduced: boolean }): void {
  root.querySelectorAll<HTMLElement>('.carousel').forEach(c => initOne(c, opts))
}

function initOne(root: HTMLElement, opts: { reduced: boolean }): void {
  const track = root.querySelector<HTMLElement>('.slides')
  const prev = root.querySelector<HTMLButtonElement>('.prev')
  const next = root.querySelector<HTMLButtonElement>('.next')
  const count = root.querySelector<HTMLElement>('.count')
  if (!track || !prev || !next || !count) return
  const n = track.children.length
  const at = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1))
  let shown = -1
  // Where a button click is heading. Quick clicks during a smooth scroll count from here, not
  // from wherever the strip is halfway through scrolling.
  let target: number | null = null
  const update = () => {
    const i = Math.min(Math.max(at(), 0), n - 1)
    if (i === target) target = null
    if (i === shown) return
    shown = i
    count.textContent = `${i + 1} / ${n}`
    // aria-disabled rather than disabled, so focus stays on the button at either end.
    prev.setAttribute('aria-disabled', String(i === 0))
    next.setAttribute('aria-disabled', String(i === n - 1))
  }
  const go = (step: number) => {
    const i = Math.min(Math.max((target ?? at()) + step, 0), n - 1)
    target = i
    track.scrollTo({ left: i * track.clientWidth, behavior: opts.reduced ? 'auto' : 'smooth' })
    // Smooth scrolling reports the new position as it goes; update now for instant jumps.
    if (opts.reduced) update()
  }
  prev.addEventListener('click', () => go(-1))
  next.addEventListener('click', () => go(1))
  let queued = false
  track.addEventListener(
    'scroll',
    () => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        update()
      })
    },
    { passive: true },
  )
  // A swipe can interrupt a button's scroll; once the strip settles, trust where it is.
  track.addEventListener('scrollend', () => {
    target = null
    update()
  })
  update()
}
