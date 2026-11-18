import { animate } from 'animejs'
import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { initJourney } from '../src/client/about/journey'

vi.mock('animejs', () => ({ animate: vi.fn() }))
const animateMock = vi.mocked(animate)

let visible: (() => void)[] = []
const observe = (_el: Element, onVisible: () => void) => {
  visible.push(onVisible)
}

function setup(reduced = false) {
  document.body.innerHTML = renderAboutPage(about, site, '')
  visible = []
  animateMock.mockClear()
  return initJourney(document, { reduced, observe })
}
const activeIds = (sel: string) => [...document.querySelectorAll(`${sel}[data-active]`)].map(e => e.getAttribute('data-stop'))
const btn = (id: string) => document.querySelector<HTMLButtonElement>(`.stop-btn[data-stop="${id}"]`)!
const row = (id: string) => document.querySelector<HTMLElement>(`ol.stop-list li[data-stop="${id}"]`)!

test('the latest driven turn (Dyplink, T9) is highlighted by default on map and list', () => {
  const j = setup()
  expect(j.active()).toBe('dyplink')
  expect(activeIds('.stop-btn')).toEqual(['dyplink'])
  expect(activeIds('ol.stop-list li')).toEqual(['dyplink'])
})

test('hover, focus or click on a map stop highlights it and its list row', () => {
  setup()
  btn('vestnes').dispatchEvent(new MouseEvent('mouseenter'))
  expect(activeIds('.stop-btn')).toEqual(['vestnes'])
  expect(activeIds('ol.stop-list li')).toEqual(['vestnes'])
  btn('berlin').focus()
  expect(activeIds('.stop-btn')).toEqual(['berlin'])
  btn('india').click()
  expect(activeIds('ol.stop-list li')).toEqual(['india'])
})

test('hovering a list row highlights its map stop', () => {
  setup()
  row('ni').dispatchEvent(new MouseEvent('mouseenter'))
  expect(activeIds('.stop-btn')).toEqual(['ni'])
})

test('ArrowRight/ArrowDown and ArrowLeft/ArrowUp move focus through stops in route order and wrap', () => {
  setup()
  btn('ni').focus()
  const key = (k: string) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
  key('ArrowRight')
  expect(document.activeElement).toBe(btn('vestnes'))
  key('ArrowDown')
  expect(document.activeElement).toBe(btn('apprentice'))
  key('ArrowLeft')
  key('ArrowUp')
  expect(document.activeElement).toBe(btn('ni'))
  key('ArrowLeft')
  expect(document.activeElement).toBe(btn('unknown'))
  expect(activeIds('.stop-btn')).toEqual(['unknown'])
})

test('reduced: line shown drawn, animate never called', () => {
  setup(true)
  visible.forEach(f => f())
  const line = document.querySelector<SVGPathElement>('path.racing-line')!
  expect(line.style.strokeDashoffset === '' || line.style.strokeDashoffset === '0').toBe(true)
  expect(animateMock).not.toHaveBeenCalled()
})

test('not reduced: the line draws once, when the map becomes visible', () => {
  setup(false)
  expect(animateMock).not.toHaveBeenCalled()
  expect(visible.length).toBe(1)
  visible[0]()
  expect(animateMock).toHaveBeenCalledTimes(1)
  const params = animateMock.mock.calls[0][1] as Record<string, unknown>
  expect(params).toHaveProperty('strokeDashoffset')
  expect(params.duration).toBe(1200)
  visible[0]()
  expect(animateMock).toHaveBeenCalledTimes(1)
})
