/** Returns the project slug a URL hash points at, or the first project for anything else. */
export function slugFromHash(hash: string, slugs: string[]): string {
  const h = hash.replace(/^#/, '')
  return slugs.includes(h) ? h : slugs[0]
}

interface SelectionOptions {
  mobileQuery: MediaQueryList
  onChange?: (slug: string) => void
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
    // Mobile: closing a panel above the tapped row would yank the row off-screen.
    // Keep the tapped row where the finger left it.
    const mobile = opts.mobileQuery.matches
    const row = rows[slugs.indexOf(slug)]
    const before = mobile ? row.getBoundingClientRect().top : 0
    show(slug)
    if (mobile) {
      const shift = row.getBoundingClientRect().top - before
      if (shift) window.scrollBy({ top: shift, behavior: 'instant' })
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
