import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { MONACO_CORNERS, MONACO_POINTS, MONACO_VIEWBOX, monacoSvg } from '../src/render/about/monaco'
import { DENIED_MESSAGE, distanceMessage, haversineKm } from '../src/client/about/distance'
import { readFileSync } from 'node:fs'
import { clientToViewBox, initDistance, initGameNight, initMonaco, initTickets, nearestCorner, plotOnMap } from '../src/client/about/toys'
import { fitView, project } from '../src/render/about/project'

const GJOVIK = about.gjovik
const mount = () => {
  document.body.innerHTML = renderAboutPage(about, site, '')
}
const q = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!

describe('distance', () => {
  test('haversineKm Oslo→Gjøvik ≈ 98 km and London→Gjøvik ≈ 1228 km', () => {
    expect(Math.abs(haversineKm({ lat: 59.9139, lon: 10.7522 }, GJOVIK) - 98.1)).toBeLessThan(1)
    expect(Math.abs(haversineKm({ lat: 51.5074, lon: -0.1278 }, GJOVIK) - 1227.7)).toBeLessThan(1)
  })

  test('distanceMessage formats km with a no-break thousands space', () => {
    expect(distanceMessage(1284.4)).toBe("You're about 1 284 km from Gjøvik.")
    expect(distanceMessage(98.1)).toBe("You're about 98 km from Gjøvik.")
  })

  test('distanceMessage under 5 km', () => {
    expect(distanceMessage(3)).toBe("You're basically in Gjøvik.")
  })

  test('locate: success, denied, timeout and missing geolocation; button re-enabled after each (Review Focus 1)', () => {
    const run = (geo: Geolocation | undefined) => {
      mount()
      initDistance(document, GJOVIK, geo)
      q<HTMLButtonElement>('button.locate').click()
      const b = q<HTMLButtonElement>('button.locate')
      return { out: q('.distance-out').textContent, disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' }
    }
    const fake = (outcome: 'ok' | 'denied' | 'timeout') =>
      ({
        getCurrentPosition: (ok: PositionCallback, err?: PositionErrorCallback | null) => {
          if (outcome === 'ok') ok({ coords: { latitude: 59.9139, longitude: 10.7522 } } as GeolocationPosition)
          else err?.({ code: outcome === 'denied' ? 1 : 3, message: outcome } as GeolocationPositionError)
        },
      }) as unknown as Geolocation

    expect(run(fake('ok'))).toEqual({ out: "You're about 98 km from Gjøvik.", disabled: false })
    expect(run(fake('denied'))).toEqual({ out: DENIED_MESSAGE, disabled: false })
    expect(run(fake('timeout'))).toEqual({ out: DENIED_MESSAGE, disabled: false })
    expect(run(undefined)).toEqual({ out: DENIED_MESSAGE, disabled: false })
    expect(DENIED_MESSAGE).toBe('No worries. Gjøvik is at 60.8° N, 10.7° E.')
  })

  test('a getCurrentPosition that throws still ends with the fallback message', () => {
    mount()
    const geo = {
      getCurrentPosition: () => {
        throw new Error('blocked')
      },
    } as unknown as Geolocation
    initDistance(document, GJOVIK, geo)
    q<HTMLButtonElement>('button.locate').click()
    expect(q('.distance-out').textContent).toBe(DENIED_MESSAGE)
    expect(q<HTMLButtonElement>('button.locate').disabled).toBe(false)
  })

  test('a permission prompt that is never answered falls back after 15 s and frees the button (Review Focus 1)', () => {
    vi.useFakeTimers()
    try {
      mount()
      let late: PositionCallback | undefined
      const geo = { getCurrentPosition: (ok: PositionCallback) => (late = ok) } as unknown as Geolocation
      initDistance(document, GJOVIK, geo)
      const b = q<HTMLButtonElement>('button.locate')
      b.click()
      expect(b.getAttribute('aria-disabled')).toBe('true')
      vi.advanceTimersByTime(14_999)
      expect(q('.distance-out').textContent).toBe('Checking…')
      vi.advanceTimersByTime(1)
      expect(q('.distance-out').textContent).toBe(DENIED_MESSAGE)
      expect(b.getAttribute('aria-disabled')).toBe('false')
      // a late answer still gives the real distance
      late?.({ coords: { latitude: 59.9139, longitude: 10.7522 } } as GeolocationPosition)
      expect(q('.distance-out').textContent).toBe("You're about 98 km from Gjøvik.")
    } finally {
      vi.useRealTimers()
    }
  })

  test('locate never uses the disabled property, so keyboard focus stays on the button (Review Focus 5)', () => {
    mount()
    const geo = { getCurrentPosition: () => {} } as unknown as Geolocation
    initDistance(document, GJOVIK, geo)
    const b = q<HTMLButtonElement>('button.locate')
    b.focus()
    b.click()
    expect(b.disabled).toBe(false)
    expect(document.activeElement).toBe(b)
  })
})

describe('tickets', () => {
  test('tickets: click toggles aria-pressed and .flipped; front text stays in the DOM', () => {
    mount()
    initTickets(document)
    const t = q<HTMLButtonElement>('button.ticket')
    t.click()
    expect(t.getAttribute('aria-pressed')).toBe('true')
    expect(t.classList.contains('flipped')).toBe(true)
    expect(t.querySelector('.front')?.textContent).toContain('Local hockey in Gjøvik.')
    t.click()
    expect(t.getAttribute('aria-pressed')).toBe('false')
    expect(t.classList.contains('flipped')).toBe(false)
  })
})

describe('game night', () => {
  test('draw alternates games, one per click, even when clicked rapidly (Review Focus 2)', () => {
    mount()
    initGameNight(document, about.gameNight.games, { reduced: false })
    const draw = q<HTMLButtonElement>('button.draw')
    const face = () => q('.card .card-face').textContent
    draw.click()
    expect(face()).toBe('Exploding Kittens')
    draw.click()
    expect(face()).toBe('Horrible Therapist')
    draw.click()
    expect(face()).toBe('Exploding Kittens')
    expect(q('.card').classList.contains('shown')).toBe(true)
  })

  test('reduced: draw shows the card face without flip classes (Review Focus 4)', () => {
    mount()
    initGameNight(document, about.gameNight.games, { reduced: true })
    q<HTMLButtonElement>('button.draw').click()
    expect(q('.card .card-face').textContent).toBe('Exploding Kittens')
    expect(q('.card').classList.contains('flipping')).toBe(false)
  })
})

describe('Monaco', () => {
  test('the map is the real circuit outline, and every named corner sits on it', () => {
    expect(MONACO_POINTS.length).toBeGreaterThan(100)
    for (const c of MONACO_CORNERS) {
      expect(MONACO_POINTS.some(p => p.x === c.x && p.y === c.y)).toBe(true)
    }
    const svg = new DOMParser().parseFromString(monacoSvg(), 'image/svg+xml').documentElement
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${MONACO_VIEWBOX.w} ${MONACO_VIEWBOX.h}`)
    expect(svg.getAttribute('aria-label')).toBe('Map of the Monaco circuit')
  })

  test('nearestCorner returns the corner at its own coordinates', () => {
    for (const i of [0, 5, 12]) {
      const c = MONACO_CORNERS[i]
      expect(nearestCorner(c.x, c.y)).toBe(c.name)
    }
    expect(nearestCorner(MONACO_CORNERS[0].x, MONACO_CORNERS[0].y + 1)).toBe('Sainte Dévote')
  })

  test('clientToViewBox accounts for a letterboxed (meet) drawing', () => {
    // 325x220 box around a 100x84 viewBox starting at y=8: drawing is ~262 px wide, centred.
    const rect = { left: 0, top: 0, width: 325, height: 220 }
    const vb = { x: 0, y: 8, width: 100, height: 84 }
    const scale = Math.min(325 / 100, 220 / 84)
    const off = (325 - 100 * scale) / 2
    const fair = MONACO_CORNERS[5]
    const p = clientToViewBox(rect, vb, off + fair.x * scale, (fair.y - 8) * scale)
    expect(p.x).toBeCloseTo(fair.x, 5)
    expect(p.y).toBeCloseTo(fair.y, 5)
    expect(nearestCorner(p.x, p.y)).toBe('Fairmont Hairpin')
  })

  test('keyboard: "Next corner" lights the line and steps through corners; arrows go both ways (Review Focus 5)', () => {
    mount()
    initMonaco(document)
    const b = q<HTMLButtonElement>('#setup button.corner-step')
    const name = () => q('#setup .corner-name').textContent
    b.click()
    expect(name()).toBe('Sainte Dévote')
    expect(q('#setup svg.monaco').classList.contains('lit')).toBe(true)
    b.click()
    expect(name()).toBe('Beau Rivage')
    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(name()).toBe('Sainte Dévote')
    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(name()).toBe('Anthony Noghès')
    expect([...document.querySelectorAll('#setup .corner.on')].length).toBe(1)
  })
})

describe('reduced motion tickets', () => {
  test('the stylesheet shows the stub back under the front instead of flipping (Review Focus 4)', () => {
    const css = readFileSync('src/styles/about.css', 'utf8')
    const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/\.ticket \.front,\s*\.ticket \.back\s*\{[^}]*position:\s*static/)
    expect(reduced).toMatch(/\.ticket\.flipped \.front\s*\{[^}]*transform:\s*none/)
    expect(reduced).toMatch(/\.ticket:not\(\.flipped\) \.back\s*\{[^}]*display:\s*none/)
  })
})

describe('distance map', () => {
  test('project and fitView: both points stay in a view shaped to the box', () => {
    expect(project(60.7957, 10.6915)).toEqual({ x: 190.69, y: 19.2 })
    const a = project(60.7957, 10.6915)
    const b = project(40.7, -74) // New York
    const v = fitView(a, b, 2)
    expect(v.w / v.h).toBeCloseTo(2)
    for (const p of [a, b]) {
      expect(p.x).toBeGreaterThan(v.x)
      expect(p.x).toBeLessThan(v.x + v.w)
      expect(p.y).toBeGreaterThan(v.y)
      expect(p.y).toBeLessThan(v.y + v.h)
    }
  })

  test('plotOnMap shows your dot and the route, and zooms the map', () => {
    mount()
    plotOnMap(document, { lat: 60.7957, lon: 10.6915 }, { lat: 59.9139, lon: 10.7522 })
    const svg = q('#distance svg.world')
    expect(svg.querySelector('.you')?.getAttribute('visibility')).toBe('visible')
    expect(svg.querySelector('.route')?.getAttribute('visibility')).toBe('visible')
    expect(svg.querySelector('.you')?.getAttribute('cx')).toBe('190.75')
    expect(svg.getAttribute('viewBox')).not.toBe('0 0 360 138')
  })

  test('fitView never shows the empty band above the top of the map', () => {
    const v = fitView(project(60.7957, 10.6915), project(40.7, -74), 1.5)
    expect(v.y).toBeGreaterThanOrEqual(0)
    expect(v.y + v.h).toBeLessThanOrEqual(138)
  })
})
