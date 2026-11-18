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

function setText(el: HTMLElement, text: string) {
  if (el.textContent !== text) el.textContent = text
  el.title = text
}

/** Writes a ticker state into the footer. Text only, never HTML. */
export function renderTickerState(root: Document, s: TickerState): void {
  const footer = root.querySelector<HTMLElement>('footer.ticker')
  if (!footer) return
  const q = (sel: string) => footer.querySelector<HTMLElement>(sel)!
  footer.dataset.status = s.status
  setText(q('[data-t="status"]'), s.status)

  const spotifyText = s.spotify ? `${s.spotify.song} by ${s.spotify.artist}` : ''
  q('[data-cell="spotify"]').hidden = !s.spotify
  if (s.spotify) setText(q('[data-t="spotify"]'), spotifyText)

  q('[data-cell="game"]').hidden = !s.game
  if (s.game) setText(q('[data-t="game"]'), s.game)
}
