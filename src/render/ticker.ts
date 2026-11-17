/** Static shell of the live ticker. The client fills it in (see client/ticker). */
export function renderTicker(): string {
  return `<footer class="ticker" aria-label="Live status">
  <p class="cell"><span class="dot" aria-hidden="true"></span><span class="k">Discord</span> <b data-t="status" data-step>offline</b></p>
  <p class="cell" data-cell="spotify" hidden><span class="k">Spotify</span> <b data-t="spotify" data-step></b></p>
  <p class="cell" data-cell="game" hidden><span class="k">Playing</span> <b data-t="game" data-step></b></p>
  <p class="cell"><span class="k">Gjøvik</span> <b data-t="time">--:--</b></p>
</footer>`
}
