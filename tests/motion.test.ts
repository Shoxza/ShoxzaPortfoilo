import { animate } from 'animejs'
import { launchName, prefersReducedMotion, stepText } from '../src/client/motion'

vi.mock('animejs', () => ({ animate: vi.fn() }))
const animateMock = vi.mocked(animate)

beforeEach(() => animateMock.mockClear())

test('reduced: launchName sets --wdth to 125 and never calls animate', () => {
  const el = document.createElement('h1')
  launchName(el, { reduced: true })
  expect(el.style.getPropertyValue('--wdth')).toBe('125')
  expect(animateMock).not.toHaveBeenCalled()
})

test('not reduced: launchName calls animate once targeting --wdth 62→125, 1200ms', () => {
  const el = document.createElement('h1')
  launchName(el, { reduced: false })
  expect(animateMock).toHaveBeenCalledTimes(1)
  const [target, params] = animateMock.mock.calls[0] as [unknown, Record<string, unknown>]
  expect(target).toBe(el)
  expect(params['--wdth']).toEqual([62, 125])
  expect(params.duration).toBe(1200)
})

test('stepText ends with el.textContent === next in both modes', () => {
  for (const reduced of [true, false]) {
    const el = document.createElement('b')
    el.textContent = 'old'
    stepText(el, 'new', { reduced })
    expect(el.textContent).toBe('new')
  }
})

test('stepText reduced never calls animate', () => {
  const el = document.createElement('b')
  stepText(el, 'x', { reduced: true })
  expect(animateMock).not.toHaveBeenCalled()
})

test('stepText animates once with an overshoot ease when not reduced', () => {
  const el = document.createElement('b')
  stepText(el, 'x', { reduced: false })
  expect(animateMock).toHaveBeenCalledTimes(1)
  const params = animateMock.mock.calls[0][1] as Record<string, unknown>
  expect(params.ease).toBe('outBack(1.4)')
  expect(params.duration).toBe(380)
})

test('stepText does nothing when the text is unchanged', () => {
  const el = document.createElement('b')
  el.textContent = 'same'
  stepText(el, 'same', { reduced: false })
  expect(animateMock).not.toHaveBeenCalled()
})

test('prefersReducedMotion reads the media query', () => {
  const win = { matchMedia: (q: string) => ({ matches: q === '(prefers-reduced-motion: reduce)' }) } as unknown as Window
  expect(prefersReducedMotion(win)).toBe(true)
  expect(prefersReducedMotion({} as Window)).toBe(false)
})
