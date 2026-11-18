/**
 * The top bar sticks (CSS). This adds:
 *   .bar--scrolled once the page has left the top (solid background, brand shows on home),
 *   .bar--hidden while scrolling down, removed the moment you scroll up.
 */
export function initBar(win: Window, bar: HTMLElement | null): void {
  if (!bar) return
  let last = win.scrollY
  let queued = false
  const update = () => {
    queued = false
    const y = Math.max(0, win.scrollY)
    bar.classList.toggle('bar--scrolled', y > 8)
    if (y > last + 4 && y > bar.offsetHeight) bar.classList.add('bar--hidden')
    else if (y < last - 4 || y <= bar.offsetHeight) bar.classList.remove('bar--hidden')
    if (Math.abs(y - last) > 4) last = y
  }
  win.addEventListener(
    'scroll',
    () => {
      if (queued) return
      queued = true
      win.requestAnimationFrame(update)
    },
    { passive: true },
  )
  update()
}
