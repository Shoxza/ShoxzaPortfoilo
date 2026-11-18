import { site } from '../src/data/site'
import { renderPage } from '../src/render/page'
import { initSelection, slugFromHash } from '../src/client/selection'

const slugs = site.projects.map(p => p.slug)

function fakeQuery(matches = false) {
  const listeners = new Set<(e: { matches: boolean }) => void>()
  return {
    matches,
    media: '(max-width: 859px)',
    addEventListener: (_: string, f: (e: { matches: boolean }) => void) => listeners.add(f),
    removeEventListener: (_: string, f: (e: { matches: boolean }) => void) => listeners.delete(f),
    set(v: boolean) {
      this.matches = v
      listeners.forEach(f => f({ matches: v }))
    },
  }
}

function setup(hash = '', mobile = false, onChange?: (s: string) => void) {
  document.body.innerHTML = renderPage(site, '')
  history.replaceState(null, '', hash ? `/${hash}` : '/')
  const mq = fakeQuery(mobile)
  const sel = initSelection(document, { mobileQuery: mq as unknown as MediaQueryList, onChange })
  return { sel, mq }
}
const visible = () => [...document.querySelectorAll<HTMLElement>('article.project')].filter(a => !a.hidden).map(a => a.dataset.slug)
const row = (slug: string) => document.querySelector<HTMLButtonElement>(`button.run[data-slug="${slug}"]`)!

test('initial selection is the first project when hash is empty', () => {
  const { sel } = setup()
  expect(sel.current()).toBe('raceassistant')
  expect(visible()).toEqual(['raceassistant'])
  expect(row('raceassistant').getAttribute('aria-current')).toBe('true')
})

test("slugFromHash('#nope') → 'raceassistant'; slugFromHash('#RaceAssistant') → 'raceassistant'", () => {
  expect(slugFromHash('#nope', slugs)).toBe('raceassistant')
  expect(slugFromHash('#RaceAssistant', slugs)).toBe('raceassistant')
  expect(slugFromHash('', slugs)).toBe('raceassistant')
  expect(slugFromHash('#', slugs)).toBe('raceassistant')
})

test("slugFromHash('#poker-dice') → 'poker-dice'", () => {
  expect(slugFromHash('#poker-dice', slugs)).toBe('poker-dice')
})

test('a deep link selects that project on load', () => {
  const { sel } = setup('#anti-f1-spoiler')
  expect(sel.current()).toBe('anti-f1-spoiler')
  expect(visible()).toEqual(['anti-f1-spoiler'])
})

test('a hash that is not a project selects the first and leaves the hash alone', () => {
  const { sel } = setup('#contact')
  expect(sel.current()).toBe('raceassistant')
  expect(location.hash).toBe('#contact')
})

test('clicking a row shows only its article, sets aria-current on that row, updates location.hash', () => {
  setup()
  row('poker-dice').click()
  expect(visible()).toEqual(['poker-dice'])
  expect(row('poker-dice').getAttribute('aria-current')).toBe('true')
  expect(row('raceassistant').hasAttribute('aria-current')).toBe(false)
  expect(location.hash).toBe('#poker-dice')
})

test('hashchange to a project selects it', () => {
  const { sel } = setup()
  history.replaceState(null, '', '/#poker-dice')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  expect(sel.current()).toBe('poker-dice')
})

test('ArrowDown/ArrowUp move focus between rows and wrap', () => {
  setup()
  row('raceassistant').focus()
  const key = (k: string) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
  key('ArrowDown')
  expect(document.activeElement).toBe(row(slugs[1]))
  for (let i = 1; i < slugs.length; i++) key('ArrowDown')
  expect(document.activeElement).toBe(row(slugs[0]))
  key('ArrowUp')
  expect(document.activeElement).toBe(row(slugs[slugs.length - 1]))
})

test('rows are native buttons, so Enter and Space activate them', () => {
  setup()
  for (const s of slugs) expect(row(s).type).toBe('button')
})

test('mobile: the selected article sits inside its row li; desktop: it lives in #feed', () => {
  setup('', true)
  const art = document.getElementById('p-raceassistant')!
  expect(art.parentElement).toBe(row('raceassistant').parentElement)
  row('anti-f1-spoiler').click()
  expect(document.getElementById('p-anti-f1-spoiler')!.parentElement).toBe(row('anti-f1-spoiler').parentElement)
  setup('', false)
  expect(document.getElementById('p-raceassistant')!.parentElement!.id).toBe('feed')
})

test('toggling the media query keeps the same project selected and moves the article', () => {
  const { sel, mq } = setup('#poker-dice', false)
  mq.set(true)
  expect(sel.current()).toBe('poker-dice')
  expect(document.getElementById('p-poker-dice')!.parentElement).toBe(row('poker-dice').parentElement)
  mq.set(false)
  expect(sel.current()).toBe('poker-dice')
  expect(document.getElementById('p-poker-dice')!.parentElement!.id).toBe('feed')
  expect(visible()).toEqual(['poker-dice'])
})

test('onChange is called with the new slug', () => {
  const seen: string[] = []
  setup('', false, s => seen.push(s))
  row('anti-f1-spoiler').click()
  expect(seen).toEqual(['anti-f1-spoiler'])
})

test('mobile: tapping a lower row keeps that row where it was on screen (Review Focus: accordion jump)', () => {
  setup('', true)
  const r2 = row('anti-f1-spoiler')
  const tops = [407, -335]
  r2.getBoundingClientRect = () => ({ top: tops.shift() ?? -335 }) as DOMRect
  const scrollBy = vi.fn()
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy
  r2.click()
  expect(scrollBy).toHaveBeenCalledWith({ top: -742, behavior: 'instant' })
})

test('desktop: selecting never scrolls the page', () => {
  setup('', false)
  const scrollBy = vi.fn()
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy
  row('poker-dice').click()
  expect(scrollBy).not.toHaveBeenCalled()
})
