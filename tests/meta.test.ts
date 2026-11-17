import { readFileSync } from 'node:fs'
import { injectPage } from '../src/build/inject'

const html = injectPage(readFileSync('index.html', 'utf8'))
const doc = new DOMParser().parseFromString(html, 'text/html')
const helmet = readFileSync('src/assets/helmet.svg', 'utf8')
const attr = (sel: string, a: string) => doc.querySelector(sel)?.getAttribute(a)

test('title is exactly "Shoxza, junior developer"', () => {
  expect(doc.title).toBe('Shoxza, junior developer')
})

test('has a meta description', () => {
  expect(attr('meta[name="description"]', 'content')?.length).toBeGreaterThan(20)
})

test('Open Graph image and title', () => {
  expect(attr('meta[property="og:image"]', 'content')).toBe('https://shoxza.no/og.png')
  expect(attr('meta[property="og:title"]', 'content')).toBeTruthy()
})

test('favicon and apple touch icon', () => {
  expect(attr('link[rel="icon"]', 'href')).toBe('/favicon.svg')
  expect(attr('link[rel="apple-touch-icon"]', 'href')).toBe('/apple-touch-icon.png')
})

test('helmet carries shoxza.no and 26, and no blur/glow filter', () => {
  expect(helmet).toContain('shoxza.no')
  expect(helmet).toMatch(/>26</)
  expect(helmet).not.toMatch(/feGaussianBlur/)
  expect(helmet).toMatch(/aria-label="Helmet number 26"/)
})

test('helmet uses the deep blue top and both sponsor logos', () => {
  expect(helmet.toLowerCase()).toContain('#2a4f8f')
  expect(helmet).toContain('/sponsors/gtr.webp')
  expect(helmet).toContain('/sponsors/darling.svg')
})
