import { readFileSync } from 'node:fs'
import { injectPage } from '../src/build/inject'

const html = injectPage(readFileSync('index.html', 'utf8'))
const doc = new DOMParser().parseFromString(html, 'text/html')
const helmet = readFileSync('src/assets/helmet.svg', 'utf8')
const attr = (sel: string, a: string) => doc.querySelector(sel)?.getAttribute(a)

test('title has the full name, the handle and the role, and fits in a search result', () => {
  expect(doc.title).toBe('Ben Hughes-Tretnes (Shoxza) – Junior web developer')
  expect(doc.title.length).toBeLessThanOrEqual(60)
  expect(attr('meta[property="og:title"]', 'content')).toBe(doc.title)
})

test('has a meta description that fits in a search result', () => {
  const d = attr('meta[name="description"]', 'content') ?? ''
  expect(d.length).toBeGreaterThan(50)
  expect(d.length).toBeLessThanOrEqual(160)
  expect(d).toContain('Ben Hughes-Tretnes')
})

test('Open Graph image and title', () => {
  expect(attr('meta[property="og:image"]', 'content')).toBe('https://www.shoxza.no/og.png')
  expect(attr('meta[property="og:title"]', 'content')).toBeTruthy()
})

test('www.shoxza.no is the main address', () => {
  expect(attr('link[rel="canonical"]', 'href')).toBe('https://www.shoxza.no/')
  expect(attr('meta[property="og:url"]', 'content')).toBe('https://www.shoxza.no/')
})

test('favicon and apple touch icon', () => {
  expect(attr('link[rel="icon"]', 'href')).toBe('/favicon.svg')
  expect(attr('link[rel="apple-touch-icon"]', 'href')).toBe('/apple-touch-icon.png')
})

test('helmet is labelled with its number and domain, and has no blur/glow filter', () => {
  // The 26 and shoxza.no are drawn as shapes (Recraft artwork); the label carries them for screen readers.
  expect(helmet).toMatch(/<title>Helmet number 26, shoxza\.no<\/title>/)
  expect(helmet).toMatch(/aria-label="Helmet number 26, shoxza\.no"/)
  expect(helmet).not.toMatch(/feGaussianBlur/)
})

test('helmet has no full-canvas background (sits on the page asphalt)', () => {
  expect(helmet).not.toContain('M0 0L1024 0L1024 1024L0 1024L0 0Z')
})

test('helmet uses the deep blue top and both sponsor logos', () => {
  expect(helmet.toLowerCase()).toContain('#2a4f8f')
  expect(helmet).toContain('/sponsors/gtr.webp')
  expect(helmet).toContain('/sponsors/darling.svg')
})
