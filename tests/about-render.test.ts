import { about } from '../src/data/about'
import { site } from '../src/data/site'
import { renderAboutPage } from '../src/render/about/page'
import { MONACO_CORNERS } from '../src/render/about/monaco'
import type { About } from '../src/data/about'

function mount(a: About = about) {
  document.body.innerHTML = renderAboutPage(a, site, '<svg id="helmet"></svg>')
  return document
}
const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

test('heading is exactly "Ben Hughes Tretnes" with "#26" and "Shoxza" beside it, intro exactly "Junior developer from Norway"', () => {
  const doc = mount()
  expect(text(doc.querySelector('#about h1'))).toBe('Ben Hughes Tretnes')
  expect(text(doc.querySelector('#about .alias .num'))).toBe('#26')
  expect(text(doc.querySelector('#about .alias .handle'))).toBe('Shoxza')
  expect(text(doc.querySelector('#about .intro'))).toBe('Junior developer from Norway')
})

test('stops in route order with exact lines', () => {
  const doc = mount()
  expect([...doc.querySelectorAll('.stop-btn')].map(b => b.getAttribute('data-stop'))).toEqual([
    'ni',
    'vestnes',
    'gjovik',
    'berlin',
    'india',
  ])
  const lines = Object.fromEntries(
    [...doc.querySelectorAll('ol.stop-list > li')].map(li => [li.getAttribute('data-stop'), text(li.querySelector('span'))]),
  )
  expect(lines).toEqual({
    ni: "Where I'm from.",
    vestnes: 'Where I grew up.',
    gjovik: 'Studying web development at NTNU. Web developer for Gjøvik Tech Racing, web committee leader at Darling.',
    berlin: 'Study visit.',
    india: 'Next corner: bachelor thesis, from January 2027.',
  })
  expect([...doc.querySelectorAll('ol.stop-list strong')].map(text)).toEqual([
    'Northern Ireland',
    'Vestnes, Møre og Romsdal',
    'Gjøvik, NTNU',
    'Berlin',
    'India',
  ])
})

test('only India is "next"; Berlin is driven', () => {
  const st = [...mount().querySelectorAll('.stop-btn')].map(b => [b.getAttribute('data-stop'), b.getAttribute('data-status')])
  expect(st).toEqual([
    ['ni', 'driven'],
    ['vestnes', 'driven'],
    ['gjovik', 'driven'],
    ['berlin', 'driven'],
    ['india', 'next'],
  ])
})

test('the map has the driven racing line, the dashed next line and the car', () => {
  const doc = mount()
  expect(doc.querySelector('#journey svg.journey path.racing-line')).not.toBeNull()
  expect(doc.querySelector('#journey svg.journey path.racing-line--next')).not.toBeNull()
  expect(doc.querySelector('#journey .car')).not.toBeNull()
})

test('every stop and every toy control is a native button', () => {
  const doc = mount()
  expect(doc.querySelectorAll('button.stop-btn').length).toBe(5)
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
