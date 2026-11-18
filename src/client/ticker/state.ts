export interface TickerState {
  status: 'online' | 'offline'
  spotify: { song: string; artist: string } | null
  game: string | null
}

const OFFLINE: TickerState = { status: 'offline', spotify: null, game: null }
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null)

/**
 * Maps Lanyard presence to what the ticker may show:
 * games only (activity type 0), Spotify song + artist, idle/dnd count as online.
 * Anything malformed falls back to offline.
 */
export function toTickerState(presence: unknown): TickerState {
  if (!isObj(presence)) return OFFLINE
  const s = presence.discord_status
  if (s !== 'online' && s !== 'idle' && s !== 'dnd') return OFFLINE

  const activities = Array.isArray(presence.activities) ? presence.activities : []
  const playing = activities.find(a => isObj(a) && a.type === 0 && str(a.name))
  const game = isObj(playing) ? str(playing.name) : null

  let spotify: TickerState['spotify'] = null
  const sp = presence.spotify
  if (presence.listening_to_spotify === true && isObj(sp)) {
    const song = str(sp.song)
    const artist = str(sp.artist)
    if (song && artist) spotify = { song, artist }
  }
  return { status: 'online', spotify, game }
}
