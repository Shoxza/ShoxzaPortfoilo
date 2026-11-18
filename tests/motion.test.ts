import { animate } from 'animejs'
import { prefersReducedMotion, stepText } from '../src/client/motion'

vi.mock('animejs', () => ({ animate: vi.fn() }))
const animateMock = vi.mocked(animate)

beforeEach(() => animateMock.mockClear())

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
