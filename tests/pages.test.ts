import { readFileSync } from 'node:fs'
import { renderNav } from '../src/render/header'
import { injectPage } from '../src/build/inject'

const links = (html: string) => {
  document.body.innerHTML = html
  return [...document.querySelectorAll('nav a')].map(a => [a.textContent!.trim(), a.getAttribute('href')])
}

test('about nav links back to main-page sections and marks About current', () => {
  expect(links(renderNav('about'))).toEqual([
    ['Work', '/#work'],
    ['Crew', '/#crew'],
    ['About', '/about'],
    ['Contact', '/#contact'],
  ])
  const current = [...document.querySelectorAll('nav a[aria-current="page"]')].map(a => a.textContent)
  expect(current).toEqual(['About'])
})

test('home nav marks nothing as current', () => {
  links(renderNav('home'))
  expect(document.querySelectorAll('nav a[aria-current]').length).toBe(0)
})

test('injectPage(html, "about") fills the slot with the about page, not the home page', () => {
  const html = injectPage('<html class="no-js"><head></head><body><!--app--></body></html>', 'about')
  expect(html).toContain('id="about"')
  expect(html).not.toContain('id="feed"')
  expect(html).toContain("document.documentElement.className='js'")
})

test('about.html exists, has the app slot, the about client entry and the shared stylesheet', () => {
  const html = readFileSync('about.html', 'utf8')
  expect(html).toContain('<!--app-->')
  expect(html).toContain('/src/client/about/main.ts')
  expect(html).toContain('/src/styles/index.css')
  expect(html).toContain('<meta property="og:url" content="https://www.shoxza.no/about" />')
  expect(html).toContain('<link rel="canonical" href="https://www.shoxza.no/about" />')
})

test('vercel.json enables cleanUrls', () => {
  expect(JSON.parse(readFileSync('vercel.json', 'utf8')).cleanUrls).toBe(true)
})

test('the sitemap lists every page at its canonical address, and robots.txt points to it', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const canonical = (file: string) => readFileSync(file, 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  expect(locs).toEqual([canonical('index.html'), canonical('about.html')])
  const robots = readFileSync('public/robots.txt', 'utf8')
  expect(robots).toMatch(/^Allow: \/$/m)
  expect(robots).toContain('Sitemap: https://www.shoxza.no/sitemap.xml')
})
