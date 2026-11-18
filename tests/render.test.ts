import { site } from '../src/data/site'
import { PENDING, type Site } from '../src/data/types'
import { renderPage } from '../src/render/page'
import { kindLabel } from '../src/render/tower'
import { injectPage } from '../src/build/inject'

function mount(s: Site = site): Document {
  document.body.innerHTML = renderPage(s, '<svg id="helmet"></svg>')
  return document
}
const clone = () => structuredClone(site)
const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

test('rows follow the data order, numbered from 1, with the tyre for each kind', () => {
  const rows = [...mount().querySelectorAll('ol.runs > li > button.run')]
  expect(rows.map(r => r.getAttribute('data-slug'))).toEqual(site.projects.map(p => p.slug))
  expect(rows.map(r => text(r.querySelector('.pos')))).toEqual(site.projects.map((_, i) => String(i + 1)))
  expect(rows.map(r => r.querySelector('svg.tyre')?.getAttribute('class'))).toEqual(
    site.projects.map(p => `tyre tyre--${p.kind}`),
  )
  expect(rows.map(r => r.getAttribute('aria-controls'))).toEqual(site.projects.map(p => `p-${p.slug}`))
})

test('every project has an article with description, data band and role when set', () => {
  const doc = mount()
  for (const p of site.projects) {
    const a = doc.querySelector(`#feed > article.project#p-${p.slug}`)!
    expect(a.getAttribute('data-slug')).toBe(p.slug)
    expect(text(a.querySelector('h2'))).toBe(p.name)
    expect(text(a.querySelector('.desc'))).toBe(p.description)
    const band = [...a.querySelectorAll('.band > span')].map(text)
    expect(band).toContain(kindLabel[p.kind])
    expect(band).toContain(p.stack.join(', '))
    expect(band).toContain(String(p.year).replace('-', '–'))
    if (p.role) expect(band).toContain(p.role)
  }
  expect(text(doc.querySelector('#p-raceassistant .band'))).not.toMatch(/team project/)
})

test('RaceAssistant and Anti F1 Spoiler show screenshot carousels; Poker Dice has no visual', () => {
  const doc = mount()
  expect(doc.querySelectorAll('#p-raceassistant .visual .carousel img')).toHaveLength(3)
  expect(doc.querySelectorAll('#p-anti-f1-spoiler .visual .carousel img')).toHaveLength(3)
  expect(doc.querySelector('#p-poker-dice .visual')).toBeNull()
})

test('radio box is omitted when radio === PENDING; shown with the exact text otherwise', () => {
  const s = clone()
  s.projects[3].radio = PENDING
  const doc = mount(s)
  expect(doc.querySelector('#p-poker-dice .radio')).toBeNull()
  expect(text(doc.querySelector('#p-anti-f1-spoiler .radio q'))).toBe(site.projects[1].radio)
})

test('links section is omitted when links is empty, shown when present', () => {
  const s = clone()
  s.projects[0].links = []
  expect(mount(s).querySelector('#p-raceassistant .links')).toBeNull()
  s.projects[0].links = [{ label: 'GitHub', href: 'https://github.com/Shoxza/RaceAssistant' }]
  const a = mount(s).querySelector('#p-raceassistant .links a')!
  expect(a.getAttribute('href')).toBe('https://github.com/Shoxza/RaceAssistant')
  expect(text(a)).toBe('GitHub')
})

test('features list shows each feature, and is omitted when empty', () => {
  const s = clone()
  s.projects[3].features = []
  const doc = mount(s)
  expect([...doc.querySelectorAll('#p-raceassistant .features li')].map(text)).toEqual(site.projects[0].features)
  expect(doc.querySelector('#p-poker-dice .features')).toBeNull()
})

test('crew rows show each season range as one blue tab: GTR 25–27, Darling 26–27', () => {
  const roles = [...mount().querySelectorAll('#crew ul.crew > li.crew-role')]
  expect(roles.map(r => text(r.querySelector('.org')))).toEqual(['Gjøvik Technology Racing', 'Darling'])
  expect(roles.map(r => text(r.querySelector('.seasons [aria-hidden="true"]')))).toEqual(['25–27', '26–27'])
  expect(roles.map(r => text(r.querySelector('.seasons .visually-hidden')))).toEqual([
    'Seasons 2025 to 2027',
    'Seasons 2026 to 2027',
  ])
  expect(roles[0].querySelector('img')?.getAttribute('src')).toBe('/sponsors/gtr.webp')
})

test('a single season shows just that year', () => {
  const s = clone()
  s.crew[1].seasons = [27]
  const role = mount(s).querySelectorAll('#crew li.crew-role')[1]
  expect(text(role.querySelector('.seasons [aria-hidden="true"]'))).toBe('27')
  expect(text(role.querySelector('.seasons .visually-hidden'))).toBe('Season 2027')
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
  expect(doc.querySelectorAll('article.project').length).toBe(site.projects.length)
  const content = doc.querySelectorAll('article.project, li.crew-role, #contact, #work, #crew')
  expect(content.length).toBe(site.projects.length + site.crew.length + 3)
  for (const el of content) expect(el.closest('[hidden]')).toBeNull()
})

test('text from data is escaped: a project named "<b>&" renders as text', () => {
  const s = clone()
  s.projects[0].name = '<b>&'
  const doc = mount(s)
  expect(doc.querySelector('#p-raceassistant h2 b')).toBeNull()
  expect(text(doc.querySelector('#p-raceassistant h2'))).toBe('<b>&')
})

test('hero shows the title, location and #26 from the profile', () => {
  const doc = mount()
  expect(text(doc.querySelector('h1#name.name'))).toBe('Shoxza')
  expect(doc.querySelector('h1#name')?.hasAttribute('style')).toBe(false)
  expect(text(doc.querySelector('.who .title'))).toBe(site.profile.title)
  expect(text(doc.querySelector('.who .where'))).toBe(site.profile.location)
  expect(text(doc.querySelector('.num'))).toBe('#26')
  expect(doc.querySelector('.top #helmet')).not.toBeNull()
})

test('hero: tagline under the name, helmet after the text, scroll cue to the projects', () => {
  const doc = mount()
  const id = doc.querySelector('.hero .id')!
  expect(text(id.querySelector('.id-text .tagline'))).toBe(site.profile.tagline)
  expect([...id.children].map(c => c.className)).toEqual(['id-text', 'helmet'])
  const cue = doc.querySelector<HTMLAnchorElement>('.top a.scroll-cue')!
  expect(cue.getAttribute('href')).toBe('#work')
  expect(text(cue)).toBe('Projects')
})

test('nav has exactly Work → #work, Crew → #crew, About → /about, Contact → #contact', () => {
  const nav = [...mount().querySelectorAll('header nav a')]
  expect(nav.map(a => [text(a), a.getAttribute('href')])).toEqual([
    ['Work', '#work'],
    ['Crew', '#crew'],
    ['About', '/about'],
    ['Contact', '#contact'],
  ])
  const doc = mount()
  for (const id of ['work', 'crew', 'contact']) expect(doc.getElementById(id)).not.toBeNull()
})

test('the compound legend shows all four tyres', () => {
  expect([...mount().querySelectorAll('.legend li')].map(text)).toEqual(['Personal', 'School', 'Work', 'Volunteer'])
})

test('work and volunteer projects get the hard (white) and supersoft (purple) tyres', () => {
  const s = clone()
  s.projects[0].kind = 'work'
  s.projects[1].kind = 'volunteer'
  const doc = mount(s)
  const rows = [...doc.querySelectorAll('ol.runs > li > button.run')]
  expect(rows.slice(0, 2).map(r => r.querySelector('svg.tyre')?.getAttribute('class'))).toEqual([
    'tyre tyre--work',
    'tyre tyre--volunteer',
  ])
  expect(text(doc.querySelector('#p-raceassistant .band'))).toContain('Work')
})

test('a project year can be ongoing (2026–) or a span (2025–27), shown with a dash and read aloud in words', () => {
  const s = clone()
  s.projects[0].year = '2026-'
  s.projects[1].year = '2025–27'
  const doc = mount(s)
  const yr = (slug: string) => doc.querySelector(`button.run[data-slug="${slug}"] .yr`)!
  expect(text(yr('raceassistant').querySelector('[aria-hidden]'))).toBe('2026–')
  expect(text(yr('raceassistant').querySelector('.visually-hidden'))).toBe('2026 to now')
  expect(text(yr('anti-f1-spoiler').querySelector('[aria-hidden]'))).toBe('2025–27')
  expect(text(yr('anti-f1-spoiler').querySelector('.visually-hidden'))).toBe('2025 to 2027')
  expect(text(yr('hcai-lab'))).toBe(String(site.projects[2].year))
  expect(text(doc.querySelector('#p-raceassistant .band'))).toContain('2026–')
})

test('project links: a plain address shows its site name, an object shows its own label', () => {
  const s = clone()
  s.projects[0].links = ['https://www.gjoviktech.no', { label: 'Source', href: 'https://github.com/Shoxza' }]
  const links = [...mount(s).querySelectorAll<HTMLAnchorElement>('#p-raceassistant .links a')]
  expect(links.map(a => [text(a), a.getAttribute('href')])).toEqual([
    ['gjoviktech.no', 'https://www.gjoviktech.no'],
    ['Source', 'https://github.com/Shoxza'],
  ])
})

test('the first link also opens from the title and the screenshots; a screenshot href wins', () => {
  const s = clone()
  const hcai = s.projects.find(p => p.slug === 'hcai-lab')!
  hcai.links = ['https://example.org/hcai', { label: 'Source', href: 'https://example.org/src' }]
  hcai.visual = {
    kind: 'images',
    images: [
      { src: '/a.webp', alt: 'A', width: 10, height: 10 },
      { src: '/b.webp', alt: 'B', width: 10, height: 10, href: 'https://example.org/b' },
    ],
  }
  const doc = mount(s)
  const a = doc.querySelector<HTMLAnchorElement>('#p-hcai-lab h2 a.title-link')!
  expect(a.getAttribute('href')).toBe('https://example.org/hcai')
  expect(text(a)).toBe(hcai.name)
  expect([...doc.querySelectorAll('#p-hcai-lab .shot-link')].map(l => l.getAttribute('href'))).toEqual([
    'https://example.org/hcai',
    'https://example.org/b',
  ])
  expect(doc.querySelectorAll('#p-hcai-lab .links a')).toHaveLength(2)
  hcai.links = []
  hcai.visual = { kind: 'images', images: [{ src: '/a.webp', alt: 'A', width: 10, height: 10 }] }
  const plain = mount(s)
  expect(plain.querySelector('#p-hcai-lab h2 a')).toBeNull()
  expect(plain.querySelector('#p-hcai-lab .shot-link')).toBeNull()
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

test('HCAI lab: school team project, front-page screenshot, no link', () => {
  const doc = mount()
  const a = doc.querySelector('#p-hcai-lab')!
  expect(text(a.querySelector('h2'))).toBe('HCAI Lab website')
  expect(a.querySelector('.desc')?.textContent).toContain('HCAI lab at NTNU Gjøvik')
  expect([...a.querySelectorAll('.features li')].map(text)).toEqual([
    'Automated news feed',
    'Moderation for equipment and events',
    'Student portfolios',
    "Professors' publications and how each one works with the lab",
  ])
  expect(a.querySelector('.links')).toBeNull()
  const img = a.querySelector<HTMLImageElement>('.visual img')!
  expect(img.getAttribute('src')).toBe('/projects/hcai-lab.webp')
  expect(img.getAttribute('alt')).toContain('HCAI Lab website')
  expect([img.getAttribute('width'), img.getAttribute('height')]).toEqual(['1200', '750'])
  expect(img.getAttribute('loading')).toBe('lazy')
  expect(doc.querySelector('button.run[data-slug="hcai-lab"] .tyre--school')).not.toBeNull()
})

test('project pictures: one shows on its own; two or more make a carousel; links are optional', () => {
  const s = structuredClone(site)
  const shots = [
    { src: '/projects/a.webp', alt: 'First screen', width: 1200, height: 750, href: 'https://example.com/a' },
    { src: '/projects/b.webp', alt: 'Second screen', width: 1200, height: 750, caption: 'The admin view' },
  ]
  s.projects[1].visual = { kind: 'images', images: [shots[0]] }
  s.projects[3].visual = { kind: 'images', images: shots }
  const doc = mount(s)
  const one = doc.querySelector('#p-anti-f1-spoiler .visual')!
  expect(one.querySelector('.carousel')).toBeNull()
  expect(one.querySelector('a.shot-link')?.getAttribute('href')).toBe('https://example.com/a')
  expect(one.querySelector('a.shot-link img')?.getAttribute('alt')).toBe('First screen')
  const many = doc.querySelector('#p-poker-dice .visual .carousel')!
  expect(many.getAttribute('aria-label')).toBe('Screenshots of Megaminds Poker Dice')
  expect(many.querySelectorAll('li.slide')).toHaveLength(2)
  expect(text(many.querySelector('.count'))).toBe('1 / 2')
  expect(text(many.querySelector('figcaption'))).toBe('The admin view')
  expect(many.querySelectorAll('a.shot-link')).toHaveLength(1)
})
