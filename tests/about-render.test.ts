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

const IDS = ['ni', 'vestnes', 'ntnu', 'gtr', 'berlin', 'darling', 'award', 'assistant', 'dyplink', 'india']

test('ten turns in lap order, each showing its name, line and year from the data', () => {
  const doc = mount()
  expect([...doc.querySelectorAll('.stop-btn')].map(b => b.getAttribute('data-stop'))).toEqual(IDS)
  const rows = [...doc.querySelectorAll('ol.stop-list > li')]
  expect(rows.map(li => li.getAttribute('data-stop'))).toEqual(IDS)
  expect(rows.map(li => text(li.querySelector('.turn')))).toEqual(IDS.map((_, i) => `T${i + 1}`))
  // The wording is the owner's to edit, so it is checked against the data, not pinned here.
  expect(rows.map(li => text(li.querySelector('strong')))).toEqual(about.stops.map(s => s.name))
  expect(rows.map(li => text(li.querySelector('.line')))).toEqual(about.stops.map(s => s.line))
  expect(rows.map(li => text(li.querySelector('.year')))).toEqual(about.stops.map(s => s.year))
  // Lap order stays: from Ireland, through Gjøvik, to India next.
  expect(about.stops[0].name).toMatch(/Ireland/)
  expect(about.stops[2].name).toMatch(/NTNU Gjøvik/)
  expect(about.stops[9].name).toMatch(/India/)
  expect(about.stops[9].status).toBe('next')
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
  expect(doc.querySelectorAll('button.ticket').length).toBe(about.tickets.length)
  for (const sel of ['button.draw', 'button.locate', '#piper button.prev', '#piper button.next']) expect(doc.querySelector(sel)).not.toBeNull()
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
    'Gjøvik Hockey',
    'OKC Thunder',
    'San Diego Padres',
    'Every couple of weeks with friends.',
    'Exploding Kittens',
    'Horrible Therapist',
    'Marketer of the Year',
    'Dyplink AS',
    // The stubs' lines are the owner's own words, so check whatever is in the data now.
    ...about.tickets.map(tk => tk.fact).filter(Boolean),
  ])
    expect(t).toContain(fact)
})

test('stubs: "Teams I follow", logo (decorative, before the tear line) and a sport icon each', () => {
  const doc = mount()
  expect(text(doc.querySelector('#tickets-h'))).toBe('Teams I follow')
  const logos = [...doc.querySelectorAll<HTMLImageElement>('#tickets .front > img.team-logo')]
  expect(logos.map(i => i.getAttribute('src'))).toEqual(about.tickets.flatMap(t => (t.logo ? [t.logo.src] : [])))
  expect(about.tickets.find(t => t.league === 'F1')?.logo?.src).toBe('/sports/red-bull-racing.webp')
  // The team name is right beside it as text, so the logo itself is decorative.
  expect(logos.every(i => i.getAttribute('alt') === '' && i.getAttribute('width') && i.getAttribute('height'))).toBe(true)
  for (const logo of logos) expect(logo.nextElementSibling?.classList.contains('stub-end')).toBe(true)
  expect(doc.querySelectorAll('#tickets .stub-end svg.sport[aria-hidden="true"]').length).toBe(about.tickets.length)
})

test('a football team can be added, logo optional', () => {
  const a = structuredClone(about)
  a.tickets.push({ team: 'Test FC', league: 'Football', fact: '', colors: ['#000000', '#ffffff'] })
  const stub = [...mount(a).querySelectorAll('button.ticket')].at(-1)!
  expect(text(stub.querySelector('strong'))).toBe('Test FC')
  expect(stub.querySelector('img')).toBeNull()
  expect(stub.querySelector('svg.sport circle')).not.toBeNull()
  expect(text(stub.querySelector('.back'))).toBe('Football')
})

test('distance card: dot-matrix world map with Gjøvik pinned; your pin, route and readout wait for the check', () => {
  const doc = mount()
  const svg = doc.querySelector('#distance svg.world[role="img"]')!
  expect(svg.querySelector('#land')?.getAttribute('d')?.length).toBeGreaterThan(1000)
  expect(svg.querySelector('use.land-dots')?.getAttribute('fill')).toBe('url(#land-dots)')
  const home = svg.querySelector('.pin--home')!
  expect([home.getAttribute('data-x'), home.getAttribute('data-y')]).toEqual(['190.69', '19.2'])
  expect(home.textContent).toContain('GJØVIK')
  expect(svg.querySelector('.pin--you')?.getAttribute('visibility')).toBe('hidden')
  expect(svg.querySelector('.route')?.getAttribute('d')).toBe('')
  const readout = doc.querySelector<HTMLElement>('#distance .readout')!
  expect(readout.hidden).toBe(true)
  expect(readout.getAttribute('aria-hidden')).toBe('true')
})

test('Piper is a photo carousel (grass photo first), only shown once there are photos', () => {
  const none = structuredClone(about)
  none.pet.photos = []
  expect(mount(none).querySelector('#piper')).toBeNull()
  const doc = mount()
  expect(text(doc.querySelector('#piper h2'))).toBe('Piper, the best dog ever!')
  const carousel = doc.querySelector('#piper .carousel[aria-roledescription="carousel"]')!
  const slides = [...carousel.querySelectorAll('li.slide')]
  expect(slides.map(l => l.getAttribute('aria-label'))).toEqual(['1 of 4', '2 of 4', '3 of 4', '4 of 4'])
  const imgs = [...carousel.querySelectorAll<HTMLImageElement>('figure img')]
  expect(imgs.map(i => i.getAttribute('src'))).toEqual(['/piper/grass.webp', '/piper/puppy.webp', '/piper/garden.webp', '/piper/sofa.webp'])
  expect(imgs.every(i => i.getAttribute('alt') && i.getAttribute('loading') === 'lazy')).toBe(true)
  expect(text(carousel.querySelector('.count'))).toBe('1 / 4')
  for (const sel of ['button.prev', 'button.next']) expect(carousel.querySelector(sel)?.getAttribute('aria-label')).toMatch(/picture/)
})

test('carousel captions render as figcaptions, escaped, and only when given', () => {
  expect(mount().querySelectorAll('#piper figcaption')).toHaveLength(4)
  const a = structuredClone(about)
  for (const ph of a.pet.photos) delete ph.caption
  a.pet.photos[0].caption = 'Zoomies <3'
  const cap = mount(a).querySelectorAll('#piper figcaption')
  expect(cap).toHaveLength(1)
  expect(cap[0].textContent).toBe('Zoomies <3')
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
  expect(tickets.map(t => text(t.querySelector('.back')))).toEqual(about.tickets.map(t => t.league))
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

test('Marketer of the Year is marked as an award: trophy on the map marker and in the list', () => {
  const doc = mount()
  const btn = doc.querySelector('button.stop-btn[data-stop="award"]')!
  expect(btn.querySelector('.award-badge svg.trophy[aria-hidden="true"]')).not.toBeNull()
  expect(btn.getAttribute('aria-label')).toContain('an award')
  expect(doc.querySelector('li[data-stop="award"] strong svg.trophy')).not.toBeNull()
  expect(doc.querySelectorAll('svg.trophy')).toHaveLength(2)
})
