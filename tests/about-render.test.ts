import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { ageOn } from '../src/render/about/age'
import { MONACO_CORNERS } from '../src/render/about/monaco'
import { SPA_POINTS, pointAt } from '../src/render/about/spa'
import { readFileSync } from 'node:fs'
import type { About } from '../src/data/about'

function mount(a: About = about) {
  document.body.innerHTML = renderAboutPage(a, site, '<svg id="helmet"></svg>')
  return document
}
const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

test("greeting \"Hi, I'm Ben\" with the journey intro and the portrait (none when no photo is set)", () => {
  const doc = mount()
  expect(text(doc.querySelector('#about h1'))).toBe("Hi, I'm Ben")
  expect(text(doc.querySelector('#about .intro'))).toBe(about.intro)
  expect(text(doc.querySelector('#about .intro'))).toContain('lap of Spa-Francorchamps')
  const img = doc.querySelector<HTMLImageElement>('.about-head img.portrait')!
  expect([img.getAttribute('src'), img.getAttribute('width'), img.getAttribute('height')]).toEqual(['/about/ben.webp', '440', '440'])
  expect(img.getAttribute('alt')).toContain('Ben')
  const a = structuredClone(about)
  delete a.photo
  expect(mount(a).querySelector('.portrait')).toBeNull()
})

test('driver card under the map: full name, #26 and Shoxza; age only when a birth date is set', () => {
  const noAge = structuredClone(about)
  delete noAge.born
  const doc = mount(noAge)
  const map = doc.querySelector('#journey')!
  const card = doc.querySelector('.driver')!
  expect(map.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  const rows = () => [...doc.querySelectorAll('.driver dl > div')].map(d => [text(d.querySelector('dt')), text(d.querySelector('dd'))])
  expect(rows()).toEqual([
    ['Driver', 'Ben Hughes-Tretnes'],
    ['Number', '#26'],
    ['Handle', 'Shoxza'],
  ])
  mount()
  expect(rows()[3]).toEqual(['Age', String(ageOn('2003-02-19', new Date()))])
  expect(doc.querySelector('.driver [data-born]')?.getAttribute('data-born')).toBe('2003-02-19')
})

test('ageOn counts whole years, turning over on the birthday', () => {
  expect(ageOn('2003-05-04', new Date(2026, 4, 3))).toBe(22)
  expect(ageOn('2003-05-04', new Date(2026, 4, 4))).toBe(23)
  expect(ageOn('2003-12-31', new Date(2026, 10, 18))).toBe(22)
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
  for (const sel of ['button.draw', 'button.locate']) expect(doc.querySelector(sel)).not.toBeNull()
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
    'Marketer of the Year',
    'Dyplink AS',
  ])
    expect(t).toContain(fact)
})

test('no images in tickets (no logos); sport icons on each stub', () => {
  const doc = mount()
  expect(doc.querySelectorAll('#tickets img').length).toBe(0)
  expect(doc.querySelectorAll('#tickets .stub-end svg.sport[aria-hidden="true"]').length).toBe(3)
})

test('Piper is a photo gallery, and only appears once there are photos', () => {
  const none = structuredClone(about)
  none.pet.photos = []
  expect(mount(none).querySelector('#piper')).toBeNull()
  const doc = mount()
  expect(text(doc.querySelector('#piper h2'))).toBe('Piper, Jack Russell')
  const imgs = [...doc.querySelectorAll<HTMLImageElement>('#piper .gallery img')]
  // The grass one first, as the owner asked.
  expect(imgs.map(i => i.getAttribute('src'))).toEqual(['/piper/grass.webp', '/piper/puppy.webp', '/piper/garden.webp', '/piper/sofa.webp'])
  expect(imgs.every(i => i.getAttribute('alt'))).toBeTruthy()
  expect(imgs.every(i => i.getAttribute('loading') === 'lazy')).toBe(true)
  expect(doc.querySelector('#piper button')).toBeNull()
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
  for (const sel of ['#game-night .card', '#distance .distance-out'])
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
  expect(doc.querySelector('.driver b')).toBeNull()
  expect(text(doc.querySelector('.driver dd'))).toBe('<b>x</b>')
})

test('shares the compact header with About current, and the live ticker', () => {
  const doc = mount()
  expect(doc.querySelector('header.bar nav a[aria-current="page"]')?.textContent).toBe('About')
  expect(doc.querySelector('footer.ticker [data-t="time"]')).not.toBeNull()
})
