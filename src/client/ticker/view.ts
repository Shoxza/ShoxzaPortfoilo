import type { TickerState } from './state'

const oslo = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Oslo',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** HH:MM in Gjøvik (Europe/Oslo), whatever the visitor's own time zone. */
export function formatOsloTime(d: Date): string {
  return oslo.format(d)
}

const NOTHING = 'nothing right now'

export type Swap = (el: HTMLElement, text: string) => void
const plainSwap: Swap = (el, text) => {
  el.textContent = text
}

function setText(el: HTMLElement, text: string, swap: Swap) {
  if (el.textContent !== text) swap(el, text)
  el.title = text
}

/** Writes a ticker state into the footer. Text only, never HTML. */
export function renderTickerState(root: Document, s: TickerState, swap: Swap = plainSwap): void {
  const footer = root.querySelector<HTMLElement>('footer.ticker')
  if (!footer) return
  const q = (sel: string) => footer.querySelector<HTMLElement>(sel)!
  footer.dataset.status = s.status
  setText(q('[data-t="status"]'), s.status, swap)

  // Every cell always shows something, so the ticker never reflows.
  setText(q('[data-t="spotify"]'), s.spotify ? `${s.spotify.song} by ${s.spotify.artist}` : NOTHING, swap)
  setText(q('[data-t="game"]'), s.game ?? NOTHING, swap)
}
