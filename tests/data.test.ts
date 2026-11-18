import { site } from '../src/data/site'
import { launchCheck } from '../src/data/launch'
import { PENDING } from '../src/data/types'
import { kindLabel } from '../src/render/tower'

test('projects have unique lowercase slugs', () => {
  const slugs = site.projects.map(p => p.slug)
  expect(new Set(slugs).size).toBe(slugs.length)
  for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/)
})

test('every project kind has a tyre and a label', () => {
  for (const p of site.projects) expect(Object.keys(kindLabel)).toContain(p.kind)
})

test('crew roles and seasons', () => {
  expect(site.crew.map(c => [c.org, c.role, c.seasons])).toEqual([
    ['Gjøvik Technology Racing', 'Web developer', [25, 26, 27]],
    ['Darling', 'Web committee leader', [26, 27]],
  ])
})

test('launchCheck lists every pending input and nothing else', () => {
  const s = structuredClone(site)
  s.profile.email = PENDING
  s.profile.linkedin = PENDING
  s.profile.discordId = PENDING
  s.projects[3].radio = PENDING
  s.projects[3].features = []
  expect(launchCheck(s)).toEqual([
    'profile.email',
    'profile.linkedin',
    'profile.discordId',
    'poker-dice.radio',
    'poker-dice.features',
  ])
})

test('launchCheck is empty when everything is filled in', () => {
  const s = structuredClone(site)
  s.profile.email = 'a@b.no'
  s.profile.linkedin = 'https://linkedin.com/in/x'
  s.profile.discordId = '1'
  s.projects.forEach(p => {
    p.radio = 'x'
    if (!p.features.length) p.features = ['x']
  })
  expect(launchCheck(s)).toEqual([])
})
