// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest'
import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { initCarousel } from '../src/client/carousel'

const q = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel)!

beforeEach(() => {
  document.body.innerHTML = renderAboutPage(about, site, '<svg></svg>')
  const track = q('#piper .slides')
  Object.defineProperty(track, 'clientWidth', { value: 300 })
  // jsdom has no layout: scrollTo just moves scrollLeft, and fires scroll.
  track.scrollTo = ((o: ScrollToOptions) => {
    track.scrollLeft = o.left ?? 0
    track.dispatchEvent(new Event('scroll'))
  }) as typeof track.scrollTo
  vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => (f(0), 0))
})

test('next and previous move one photo and keep the count and end buttons in step', () => {
  initCarousel(document, { reduced: true })
  const prev = q<HTMLButtonElement>('#piper .prev')
  const next = q<HTMLButtonElement>('#piper .next')
  const count = () => q('#piper .count').textContent
  expect(count()).toBe('1 / 4')
  expect(prev.getAttribute('aria-disabled')).toBe('true')
  next.click()
  expect(count()).toBe('2 / 4')
  expect(q('#piper .slides').scrollLeft).toBe(300)
  expect(prev.getAttribute('aria-disabled')).toBe('false')
  next.click()
  next.click()
  expect(count()).toBe('4 / 4')
  expect(next.getAttribute('aria-disabled')).toBe('true')
  next.click()
  expect(count()).toBe('4 / 4')
  prev.click()
  expect(count()).toBe('3 / 4')
})

test('swiping (a plain scroll) updates the count too', () => {
  initCarousel(document, { reduced: false })
  const track = q('#piper .slides')
  track.scrollLeft = 600
  track.dispatchEvent(new Event('scroll'))
  expect(q('#piper .count').textContent).toBe('3 / 4')
})

test('quick clicks while a smooth scroll is still on its way each count', () => {
  const track = q('#piper .slides')
  // Smooth scroll: the strip has not moved yet when the next click lands.
  track.scrollTo = ((o: ScrollToOptions) => (moves.push(o.left ?? 0), undefined)) as typeof track.scrollTo
  const moves: number[] = []
  initCarousel(document, { reduced: false })
  const next = q<HTMLButtonElement>('#piper .next')
  next.click()
  next.click()
  next.click()
  expect(moves).toEqual([300, 600, 900])
})
