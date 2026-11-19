// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { initBar } from '../src/client/bar'
import { renderHeader } from '../src/render/header'
import { site } from '../src/data/site'

function setup() {
  document.body.innerHTML = '<header class="bar" data-bar></header>'
  const bar = document.querySelector<HTMLElement>('[data-bar]')!
  Object.defineProperty(bar, 'offsetHeight', { value: 72 })
  const frames: FrameRequestCallback[] = []
  const win = {
    scrollY: 0,
    addEventListener: (_: string, fn: () => void) => (win.onscroll = fn),
    onscroll: () => {},
    requestAnimationFrame: (fn: FrameRequestCallback) => frames.push(fn),
  }
  initBar(win as unknown as Window, bar)
  const scrollTo = (y: number) => {
    win.scrollY = y
    win.onscroll()
    frames.splice(0).forEach(f => f(0))
  }
  return { bar, scrollTo }
}

test("the page's own scroll correction does not bring the bar back", () => {
  const { bar, scrollTo } = setup()
  scrollTo(1400)
  expect(bar.classList.contains('bar--hidden')).toBe(true)
  document.documentElement.dataset.scrollJump = ''
  scrollTo(500)
  delete document.documentElement.dataset.scrollJump
  expect(bar.classList.contains('bar--hidden')).toBe(true)
  // A real scroll up afterwards still shows it, measured from where the jump left off.
  scrollTo(450)
  expect(bar.classList.contains('bar--hidden')).toBe(false)
})

test('bar hides while scrolling down and comes back on scroll up', () => {
  const { bar, scrollTo } = setup()
  expect(bar.className).toBe('bar')
  scrollTo(400)
  expect(bar.classList.contains('bar--scrolled')).toBe(true)
  expect(bar.classList.contains('bar--hidden')).toBe(true)
  scrollTo(300)
  expect(bar.classList.contains('bar--hidden')).toBe(false)
  expect(bar.classList.contains('bar--scrolled')).toBe(true)
  scrollTo(0)
  expect(bar.classList.contains('bar--scrolled')).toBe(false)
})

test('home bar reuses the hero helmet; About bar has its own and links home', () => {
  document.body.innerHTML = renderHeader(site.profile, '<svg id="helmet"></svg>', 'home')
  expect(document.querySelectorAll('#helmet')).toHaveLength(1)
  expect(document.querySelector('header.bar .brand use')?.getAttribute('href')).toBe('#helmet')
  expect(document.querySelector('header.bar .brand')?.getAttribute('href')).toBe('#top')
  expect(document.querySelectorAll('header')).toHaveLength(1)
  document.body.innerHTML = renderHeader(site.profile, '<svg id="helmet"></svg>', 'about')
  expect(document.querySelector('header.bar .brand #helmet')).not.toBeNull()
  expect(document.querySelector('header.bar .brand')?.getAttribute('href')).toBe('/')
})
