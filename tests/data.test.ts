import { site } from '../src/data/site'
import { launchCheck } from '../src/data/launch'
import { PENDING } from '../src/data/types'

test('projects are in display order with unique lowercase slugs', () => {
  expect(site.projects.map(p => p.slug)).toEqual(['raceassistant', 'anti-f1-spoiler', 'poker-dice'])
})

test('kinds match the spec', () => {
  expect(site.projects.map(p => p.kind)).toEqual(['personal', 'personal', 'school'])
})

test('doomscroll-assist is never listed', () => {
  expect(JSON.stringify(site)).not.toMatch(/doomscroll/i)
})

test('crew seasons match the spec', () => {
  expect(site.crew.map(c => [c.org, c.role, c.seasons])).toEqual([
    ['Gjøvik Technology Racing', 'Web developer', [25, 26, 27]],
    ['Darling', 'Web committee leader', [26, 27]],
  ])
  expect(site.seasonsShown).toEqual([25, 26, 27])
})

test('launchCheck lists every pending input and nothing else', () => {
  const s = structuredClone(site)
  s.profile.email = PENDING
  s.profile.linkedin = PENDING
  s.profile.discordId = PENDING
  s.projects[2].radio = PENDING
  s.projects[2].features = []
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
