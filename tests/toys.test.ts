import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { MONACO_CORNERS } from '../src/render/about/monaco'
import { DENIED_MESSAGE, distanceMessage, haversineKm } from '../src/client/about/distance'
import { initDistance, initGameNight, initPiper, initTickets, nearestCorner } from '../src/client/about/toys'

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
      return { out: q('.distance-out').textContent, disabled: q<HTMLButtonElement>('button.locate').disabled }
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

describe('Piper', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('throw: disabled while out, returns after returnMs, extra clicks ignored (Review Focus 2)', () => {
    mount()
    initPiper(document, { reduced: false, returnMs: 1200 })
    const btn = q<HTMLButtonElement>('button.throw')
    btn.click()
    expect(btn.disabled).toBe(true)
    expect(q('.ball').classList.contains('thrown')).toBe(true)
    expect(q('.fetch-msg').textContent).toBe('')
    btn.dispatchEvent(new MouseEvent('click'))
    vi.advanceTimersByTime(1199)
    expect(q('.fetch-msg').textContent).toBe('')
    vi.advanceTimersByTime(1)
    expect(q('.fetch-msg').textContent).toBe('Piper brought it back.')
    expect(btn.disabled).toBe(false)
    expect(q('.ball').classList.contains('thrown')).toBe(false)
  })

  test('reduced: throw shows the message immediately (Review Focus 4)', () => {
    mount()
    initPiper(document, { reduced: true })
    q<HTMLButtonElement>('button.throw').click()
    expect(q('.fetch-msg').textContent).toBe('Piper brought it back.')
    expect(q('.ball').classList.contains('thrown')).toBe(false)
  })
})

describe('Monaco', () => {
  test('nearestCorner returns the corner at its own coordinates', () => {
    for (const i of [0, 5, 12]) {
      const c = MONACO_CORNERS[i]
      expect(nearestCorner(c.x, c.y)).toBe(c.name)
    }
    expect(nearestCorner(c0x(), c0y() + 1)).toBe('Sainte Dévote')
  })
})

function c0x() {
  return MONACO_CORNERS[0].x
}
function c0y() {
  return MONACO_CORNERS[0].y
}
