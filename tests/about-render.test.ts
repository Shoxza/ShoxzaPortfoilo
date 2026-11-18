import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { MONACO_CORNERS } from '../src/render/about/monaco'
import { SPA_POINTS, pointAt } from '../src/render/about/spa'
import { readFileSync } from 'node:fs'
import type { About } from '../src/data/about'

function mount(a: About = about) {
  document.body.innerHTML = renderAboutPage(a, site, '<svg id="helmet"></svg>')
  return document
}
const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

test('heading is exactly "Ben Hughes-Tretnes" with "#26" and "Shoxza" beside it, intro exactly "Junior developer from Norway"', () => {
  const doc = mount()
  expect(text(doc.querySelector('#about h1'))).toBe('Ben Hughes-Tretnes')
  expect(text(doc.querySelector('#about .alias .num'))).toBe('#26')
  expect(text(doc.querySelector('#about .alias .handle'))).toBe('Shoxza')
  expect(text(doc.querySelector('#about .intro'))).toBe('Junior developer from Norway')
})

const IDS = ['ni', 'vestnes', 'ntnu', 'gtr', 'berlin', 'assistant', 'award', 'dyplink', 'darling', 'india']

test('ten turns in lap order with exact names, lines and years', () => {
  const doc = mount()
  expect([...doc.querySelectorAll('.stop-btn')].map(b => b.getAttribute('data-stop'))).toEqual(IDS)
  const rows = [...doc.querySelectorAll('ol.stop-list > li')]
  expect(rows.map(li => li.getAttribute('data-stop'))).toEqual(IDS)
  expect(rows.map(li => text(li.querySelector('.turn')))).toEqual(IDS.map((_, i) => `T${i + 1}`))
  expect(rows.map(li => text(li.querySelector('strong')))).toEqual([
    'Ireland',
    'Vestnes',
    'NTNU Gjøvik',
    'Gjøvik Technology Racing',
    'Berlin',
    'NTNU',
    'Marketer of the Year',
    'Dyplink AS',
    'Darling',
    'India',
  ])
  expect(rows.map(li => text(li.querySelector('.line')))).toEqual([
    'Where it started.',
    'Moved to Norway, grew up.',
    'Bachelor in web development.',
    'Web developer.',
    'Study visit.',
    'Student assistant in web coding and interactive design.',
    'Gjøvik Technology Racing.',
    'Full-stack internship: from planning to MVP.',
    'WebKom leader.',
    'Next corner: bachelor thesis.',
  ])
  expect(rows.map(li => text(li.querySelector('.year')))).toEqual([
    '',
    '',
    '2024–27',
    '2025–',
    '2025',
    '2026',
    '2026',
    'Aug–Sep 2026',
    '2026–',
    'Jan 2027',
  ])
})

test('map turns show their number and are labelled with their stop', () => {
  const btns = [...mount().querySelectorAll('.stop-btn')]
  expect(btns.map(b => text(b))).toEqual(IDS.map((_, i) => String(i + 1)))
  expect(btns[3].getAttribute('aria-label')).toBe('Turn 4: Gjøvik Technology Racing')
})

test('school years sit in one "Also on the way" line, no middle dots', () => {
  const t = text(mount().querySelector('#journey .also'))
  expect(t).toContain('XL-Dale Malo')
  expect(t).toContain('Romsdal VGS')
  expect(t).toContain('Molde VGS')
  expect(t).not.toContain('·')
})

test('Spa track data: real outline with the MIT notice, and pointAt walks it', () => {
  expect(SPA_POINTS.length).toBeGreaterThan(100)
  expect(readFileSync('src/render/about/spa.ts', 'utf8')).toContain('Copyright (c) 2019-2025 Tomislav Bacinger')
  expect(pointAt(0)).toEqual(SPA_POINTS[0])
  expect(pointAt(1)).toEqual(SPA_POINTS[SPA_POINTS.length - 1])
  const mid = pointAt(0.5)
  expect(mid.x).toBeGreaterThan(0)
  expect(mid.y).toBeGreaterThan(0)
})

test('the map has the driven racing line, the dashed next line and the car', () => {
  const doc = mount()
  expect(doc.querySelector('#journey svg.journey path.racing-line')).not.toBeNull()
  expect(doc.querySelector('#journey svg.journey path.racing-line--next')).not.toBeNull()
  expect(doc.querySelector('#journey .car')).not.toBeNull()
})

test('every stop and every toy control is a native button', () => {
  const doc = mount()
  expect(doc.querySelectorAll('button.stop-btn').length).toBe(10)
  expect(doc.querySelectorAll('button.ticket').length).toBe(3)
  for (const sel of ['button.draw', 'button.throw', 'button.locate']) expect(doc.querySelector(sel)).not.toBeNull()
  for (const b of doc.querySelectorAll('#about button')) expect((b as HTMLButtonElement).type).toBe('button')
})

test('all facts are in the static text', () => {
  const t = text(mount().querySelector('#about'))
  for (const fact of [
    'Logitech G29',
    'on a desk',
    'F1',
    'Assetto Corsa Competizione',
    'Le Mans Ultimate',
    'Monaco',
    "I've been to a Padres game.",
    'My NBA team.',
    'Local hockey in Gjøvik.',
    'Gjøvik Hockey',
    'OKC Thunder',
    'San Diego Padres',
    'Every couple of weeks with friends.',
    'Exploding Kittens',
    'Horrible Therapist',
    'Piper',
    'Jack Russell',
    'Marketer of the Year',
    'Dyplink AS',
  ])
    expect(t).toContain(fact)
})

test('no images in tickets (no logos) and no image on Piper without a photo; one img with alt when photo is set', () => {
  let doc = mount()
  expect(doc.querySelectorAll('#tickets img').length).toBe(0)
  expect(doc.querySelectorAll('#piper img').length).toBe(0)
  const withPhoto = structuredClone(about)
  withPhoto.pet.photo = { src: '/piper.jpg', alt: 'Piper the Jack Russell' }
  doc = mount(withPhoto)
  const img = doc.querySelectorAll('#piper img')
  expect(img.length).toBe(1)
  expect(img[0].getAttribute('alt')).toBe('Piper the Jack Russell')
})

test('Monaco has 13 corners from Sainte Dévote to Anthony Noghès', () => {
  expect(MONACO_CORNERS.length).toBe(13)
  expect(MONACO_CORNERS[0].name).toBe('Sainte Dévote')
  expect(MONACO_CORNERS[12].name).toBe('Anthony Noghès')
  expect(mount().querySelector('#setup svg.monaco')).not.toBeNull()
  expect(mount().querySelector('#setup p.corner-name[aria-live="polite"]')).not.toBeNull()
})

test('toy live regions exist for screen readers', () => {
  const doc = mount()
  for (const sel of ['#game-night .card', '#piper .fetch-msg', '#distance .distance-out'])
    expect(doc.querySelector(sel)?.getAttribute('aria-live')).toBe('polite')
})

test('ticket backs show the league, and stubs carry their team colours', () => {
  const tickets = [...mount().querySelectorAll('button.ticket')]
  expect(tickets.map(t => text(t.querySelector('.back')))).toEqual(['Hockey', 'NBA', 'MLB'])
  for (const t of tickets) {
    expect(t.getAttribute('aria-pressed')).toBe('false')
    expect(t.getAttribute('style')).toMatch(/--c1:#[0-9a-fA-F]{6};--c2:#[0-9a-fA-F]{6}/)
  }
})

test('data text is escaped', () => {
  const a = structuredClone(about)
  a.name = '<b>x</b>'
  const doc = mount(a)
  expect(doc.querySelector('#about h1 b')).toBeNull()
  expect(text(doc.querySelector('#about h1'))).toBe('<b>x</b>')
})

test('shares the compact header with About current, and the live ticker', () => {
  const doc = mount()
  expect(doc.querySelector('header.top--compact nav a[aria-current="page"]')?.textContent).toBe('About')
  expect(doc.querySelector('footer.ticker [data-t="time"]')).not.toBeNull()
})
