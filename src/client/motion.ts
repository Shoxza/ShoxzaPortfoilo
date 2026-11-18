import { animate } from 'animejs'

export function prefersReducedMotion(win: Window = window): boolean {
  return typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface MotionOpts {
  reduced?: boolean
}

/** Swaps a readout's text and steps it in from below with one small overshoot. */
export function stepText(el: HTMLElement, next: string, opts: MotionOpts = {}): void {
  if (el.textContent === next) return
  el.textContent = next
  el.title = next
  const reduced = opts.reduced ?? prefersReducedMotion()
  if (reduced) return
  animate(el, { translateY: ['0.7em', '0em'], opacity: [0, 1], duration: 380, ease: 'outBack(1.4)' })
}
