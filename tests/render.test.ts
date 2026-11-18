import { site } from '../src/data/site'
import { PENDING, type Site } from '../src/data/types'
import { renderPage } from '../src/render/page'
import { injectPage } from '../src/build/inject'

function mount(s: Site = site): Document {
  document.body.innerHTML = renderPage(s, '<svg id="helmet"></svg>')
  return document
}
const clone = () => structuredClone(site)
const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

test('rows in order with positions 1..3 and tyre class tyre--personal|tyre--school', () => {
  const rows = [...mount().querySelectorAll('ol.runs > li > button.run')]
  expect(rows.map(r => r.getAttribute('data-slug'))).toEqual(['raceassistant', 'anti-f1-spoiler', 'poker-dice'])
  expect(rows.map(r => text(r.querySelector('.pos')))).toEqual(['1', '2', '3'])
  expect(rows.map(r => r.querySelector('svg.tyre')?.getAttribute('class'))).toEqual([
    'tyre tyre--personal',
    'tyre tyre--personal',
    'tyre tyre--school',
  ])
  expect(rows.map(r => r.getAttribute('aria-controls'))).toEqual(['p-raceassistant', 'p-anti-f1-spoiler', 'p-poker-dice'])
})

test('every project has an article with description, data band and role when set', () => {
  const doc = mount()
  for (const p of site.projects) {
    const a = doc.querySelector(`#feed > article.project#p-${p.slug}`)!
    expect(a.getAttribute('data-slug')).toBe(p.slug)
    expect(text(a.querySelector('h2'))).toBe(p.name)
    expect(text(a.querySelector('.desc'))).toBe(p.description)
    const band = [...a.querySelectorAll('.band > span')].map(text)
    expect(band).toContain(p.kind === 'personal' ? 'Personal' : 'School')
    expect(band).toContain(p.stack.join(', '))
    expect(band).toContain(String(p.year))
    if (p.role) expect(band).toContain(p.role)
  }
  expect(text(doc.querySelector('#p-raceassistant .band'))).not.toMatch(/team project/)
})

test('RaceAssistant article contains svg.lap-trace; others contain no visual element', () => {
  const doc = mount()
  expect(doc.querySelector('#p-raceassistant svg.lap-trace')).not.toBeNull()
  expect(doc.querySelector('#p-anti-f1-spoiler .visual')).toBeNull()
  expect(doc.querySelector('#p-poker-dice .visual')).toBeNull()
})

test('radio box is omitted when radio === PENDING; shown with the exact text otherwise', () => {
  const s = clone()
  s.projects[2].radio = PENDING
  const doc = mount(s)
  expect(doc.querySelector('#p-poker-dice .radio')).toBeNull()
  expect(text(doc.querySelector('#p-anti-f1-spoiler .radio q'))).toBe(site.projects[1].radio)
})

test('links section is omitted when links is empty, shown when present', () => {
  expect(mount().querySelector('.project .links')).toBeNull()
  const s = clone()
  s.projects[0].links = [{ label: 'GitHub', href: 'https://github.com/Shoxza/RaceAssistant' }]
  const a = mount(s).querySelector('#p-raceassistant .links a')!
  expect(a.getAttribute('href')).toBe('https://github.com/Shoxza/RaceAssistant')
  expect(text(a)).toBe('GitHub')
})

test('features list shows each feature, and is omitted when empty', () => {
  const s = clone()
  s.projects[2].features = []
  const doc = mount(s)
  expect([...doc.querySelectorAll('#p-raceassistant .features li')].map(text)).toEqual(site.projects[0].features)
  expect(doc.querySelector('#p-poker-dice .features')).toBeNull()
})

test('crew rows: GTR seasons on=[25,26,27]; Darling 25 off, 26 and 27 on', () => {
  const roles = [...mount().querySelectorAll('#crew ul.crew > li.crew-role')]
  expect(roles.map(r => text(r.querySelector('.org')))).toEqual(['Gjøvik Tech Racing', 'Darling'])
  const seasons = roles.map(r =>
    [...r.querySelectorAll('ol.seasons > li')].map(li => [text(li), li.getAttribute('data-on')]),
  )
  expect(seasons[0]).toEqual([['25', 'true'], ['26', 'true'], ['27', 'true']])
  expect(seasons[1]).toEqual([['25', 'false'], ['26', 'true'], ['27', 'true']])
  expect(roles[0].querySelector('img')?.getAttribute('src')).toBe('/sponsors/gtr.webp')
})

test('contact omits email/LinkedIn while PENDING and always shows GitHub', () => {
  const pending = clone()
  pending.profile.email = PENDING
  pending.profile.linkedin = PENDING
  let links = [...mount(pending).querySelectorAll('#contact a')]
  expect(links.map(a => a.getAttribute('href'))).toEqual(['https://github.com/Shoxza'])
  const s = clone()
  s.profile.email = 'hi@shoxza.no'
  s.profile.linkedin = 'https://www.linkedin.com/in/shoxza'
  links = [...mount(s).querySelectorAll('#contact a')]
  expect(links.map(a => a.getAttribute('href'))).toEqual([
    'mailto:hi@shoxza.no',
    'https://github.com/Shoxza',
    'https://www.linkedin.com/in/shoxza',
  ])
})

test('no article or crew row carries the hidden attribute (readable without JS)', () => {
  const doc = mount()
  expect(doc.querySelectorAll('article.project').length).toBe(3)
  const content = doc.querySelectorAll('article.project, li.crew-role, #contact, #work, #crew')
  expect(content.length).toBe(8)
  for (const el of content) expect(el.closest('[hidden]')).toBeNull()
})

test('text from data is escaped: a project named "<b>&" renders as text', () => {
  const s = clone()
  s.projects[0].name = '<b>&'
  const doc = mount(s)
  expect(doc.querySelector('#p-raceassistant h2 b')).toBeNull()
  expect(text(doc.querySelector('#p-raceassistant h2'))).toBe('<b>&')
})

test('hero contains exactly "Junior developer", "Gjøvik, Norway" and "#26"', () => {
  const doc = mount()
  expect(text(doc.querySelector('h1#name.name'))).toBe('Shoxza')
  expect(doc.querySelector('h1#name')?.getAttribute('style')).toBe('--wdth:125')
  expect(text(doc.querySelector('.who .title'))).toBe('Junior developer')
  expect(text(doc.querySelector('.who .where'))).toBe('Gjøvik, Norway')
  expect(text(doc.querySelector('.num'))).toBe('#26')
  expect(doc.querySelector('header #helmet')).not.toBeNull()
})

test('nav has exactly Work → #work, Crew → #crew, Contact → #contact', () => {
  const nav = [...mount().querySelectorAll('header nav a')]
  expect(nav.map(a => [text(a), a.getAttribute('href')])).toEqual([
    ['Work', '#work'],
    ['Crew', '#crew'],
    ['Contact', '#contact'],
  ])
  const doc = mount()
  for (const id of ['work', 'crew', 'contact']) expect(doc.getElementById(id)).not.toBeNull()
})

test('the compound legend shows "Personal" and "School"', () => {
  expect([...mount().querySelectorAll('.legend li')].map(text)).toEqual(['Personal', 'School'])
})

test('ticker shell has the four data cells', () => {
  const t = mount().querySelector('footer.ticker')!
  for (const k of ['status', 'spotify', 'game', 'time']) expect(t.querySelector(`[data-t="${k}"]`)).not.toBeNull()
})

test('injectPage swaps <!--app--> for the page and adds the no-js swap script', () => {
  const html = injectPage('<html class="no-js"><head></head><body><!--app--></body></html>')
  expect(html).not.toContain('<!--app-->')
  expect(html).toContain('id="feed"')
  expect(html).toContain("document.documentElement.className='js'")
})

test('PENDING never leaks into the page', () => {
  expect(document.body.innerHTML.includes(PENDING)).toBe(false)
  expect(renderPage(site, '')).not.toContain(PENDING)
})
