/** Returns the project slug a URL hash points at, or the first project for anything else. */
export function slugFromHash(hash: string, slugs: string[]): string {
  const h = hash.replace(/^#/, '')
  return slugs.includes(h) ? h : slugs[0]
}

interface SelectionOptions {
  mobileQuery: MediaQueryList
  onChange?: (slug: string) => void
  /** prefers-reduced-motion: no drawer animation, and jumps instead of glides. */
  reduced?: boolean
}

/** Set on <html> while the page makes its own scroll correction, so the top bar ignores it. */
export const SCROLL_JUMP = 'scrollJump'

/**
 * Scroll by dy at once. The page has scroll-behavior: smooth, and browsers that don't know
 * behavior: 'instant' fall back to it, which turned the correction into a visible shoot-up.
 * Turning smooth scrolling off for this one call works everywhere.
 */
function jumpBy(win: Window, dy: number) {
  const html = win.document.documentElement
  const was = html.style.scrollBehavior
  html.dataset[SCROLL_JUMP] = ''
  html.style.scrollBehavior = 'auto'
  win.scrollTo(0, win.scrollY + dy)
  html.style.scrollBehavior = was
  // The bar reads the flag on its next frame; clear it after that even if no scroll event came.
  win.requestAnimationFrame(() => win.requestAnimationFrame(() => delete html.dataset[SCROLL_JUMP]))
}

/** The drawer slides open: height from 0 and a fade, then back to its natural size. */
function expand(el: HTMLElement) {
  if (typeof el.animate !== 'function') return
  const cs = getComputedStyle(el)
  // border-box: the height includes the padding, which also starts at 0.
  const h = el.getBoundingClientRect().height
  el.style.overflow = 'clip'
  const a = el.animate(
    [
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
      { height: `${h}px`, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 },
    ],
    { duration: 340, easing: 'cubic-bezier(.2,.7,.1,1)' },
  )
  const done = () => el.style.removeProperty('overflow')
  a.addEventListener('finish', done)
  a.addEventListener('cancel', done)
}

/**
 * Timing-tower selection: one project shown at a time. Desktop shows it in #feed;
 * on mobile the article moves into its own row (accordion).
 */
export function initSelection(root: Document, opts: SelectionOptions) {
  const rows = [...root.querySelectorAll<HTMLButtonElement>('button.run')]
  const slugs = rows.map(r => r.dataset.slug!)
  const feed = root.getElementById('feed')!
  // Captured once: the articles move around the DOM, but these references stay valid.
  const articles = new Map(slugs.map(s => [s, root.getElementById(`p-${s}`)!]))
  const article = (s: string) => articles.get(s)!
  let current = ''

  const place = () => {
    if (opts.mobileQuery.matches) {
      const r = rows[slugs.indexOf(current)]
      r.parentElement!.append(article(current))
    } else {
      for (const s of slugs) feed.append(article(s))
    }
  }

  const show = (slug: string) => {
    current = slug
    for (const r of rows) {
      if (r.dataset.slug === slug) r.setAttribute('aria-current', 'true')
      else r.removeAttribute('aria-current')
    }
    for (const s of slugs) article(s).hidden = s !== slug
    place()
  }

  const select = (slug: string) => {
    if (slug === current) return
    const mobile = opts.mobileQuery.matches
    const row = rows[slugs.indexOf(slug)]
    const before = mobile ? row.getBoundingClientRect().top : 0
    show(slug)
    if (mobile) {
      // Closing a panel above the tapped row would yank the row off-screen:
      // keep it where the finger left it, then open the drawer under it.
      const top = row.getBoundingClientRect().top
      if (top !== before) jumpBy(window, top - before)
      if (!opts.reduced) expand(article(slug))
      // A row tapped low on the screen glides up so the drawer can be seen.
      const now = row.getBoundingClientRect().top
      if (now > window.innerHeight * 0.4) {
        window.scrollTo({ top: window.scrollY + now - 12, behavior: opts.reduced ? 'auto' : 'smooth' })
      }
    }
    history.replaceState(null, '', `#${slug}`)
    opts.onChange?.(slug)
  }

  rows.forEach((r, i) => {
    r.addEventListener('click', () => select(r.dataset.slug!))
    r.addEventListener('keydown', e => {
      const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
      if (!step) return
      e.preventDefault()
      rows[(i + step + rows.length) % rows.length].focus()
    })
  })

  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1)
    if (slugs.includes(h) && h !== current) {
      show(h)
      opts.onChange?.(h)
    }
  })
  opts.mobileQuery.addEventListener('change', place)

  show(slugFromHash(location.hash, slugs))
  return { select, current: () => current }
}
