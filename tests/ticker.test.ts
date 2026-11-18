import { site } from '../src/data/site'
import { renderPage } from '../src/render/page'
import { toTickerState, type TickerState } from '../src/client/ticker/state'
import { formatOsloTime, renderTickerState } from '../src/client/ticker/view'
import { connectLanyard } from '../src/client/ticker/lanyard'

const OFFLINE: TickerState = { status: 'offline', spotify: null, game: null }

describe('toTickerState', () => {
  test("discord_status 'online' | 'idle' | 'dnd' → 'online'; 'offline' or missing → 'offline'", () => {
    for (const s of ['online', 'idle', 'dnd']) expect(toTickerState({ discord_status: s }).status).toBe('online')
    expect(toTickerState({ discord_status: 'offline' }).status).toBe('offline')
    expect(toTickerState({}).status).toBe('offline')
  })

  test('game is the name of the first activity with type 0 only; Spotify, custom status and others are ignored', () => {
    const s = toTickerState({
      discord_status: 'online',
      activities: [
        { type: 4, name: 'Custom Status', state: 'grinding' },
        { type: 2, name: 'Spotify' },
        { type: 3, name: 'Watching something' },
        { type: 0, name: 'Le Mans Ultimate' },
        { type: 0, name: 'Visual Studio Code' },
      ],
    })
    expect(s.game).toBe('Le Mans Ultimate')
    expect(toTickerState({ discord_status: 'online', activities: [{ type: 4, name: 'Custom Status' }] }).game).toBeNull()
  })

  test('spotify maps {song, artist} when listening_to_spotify is true, else null', () => {
    const spotify = { song: 'Daylight', artist: 'Moto Bandit', album: 'x' }
    expect(toTickerState({ discord_status: 'online', listening_to_spotify: true, spotify }).spotify).toEqual({
      song: 'Daylight',
      artist: 'Moto Bandit',
    })
    expect(toTickerState({ discord_status: 'online', listening_to_spotify: false, spotify }).spotify).toBeNull()
  })

  test('garbage input → offline with nothing else', () => {
    for (const g of [null, undefined, {}, 'nope', 42, { activities: 'x', spotify: 3 }, { discord_status: 'online', activities: [null, { type: 0 }] }]) {
      const s = toTickerState(g)
      expect(s.spotify).toBeNull()
      expect(s.game).toBeNull()
    }
    expect(toTickerState(null)).toEqual(OFFLINE)
  })

  test('an offline user never shows a game or song, even if Discord sends one', () => {
    const s = toTickerState({ discord_status: 'offline', listening_to_spotify: true, spotify: { song: 'a', artist: 'b' }, activities: [{ type: 0, name: 'g' }] })
    expect(s).toEqual(OFFLINE)
  })
})

describe('formatOsloTime', () => {
  test("winter: 2026-11-18T23:24:00Z → '00:24'", () => {
    expect(formatOsloTime(new Date('2026-11-18T23:24:00Z'))).toBe('00:24')
  })
  test("summer time: 2026-07-01T10:05:00Z → '12:05'", () => {
    expect(formatOsloTime(new Date('2026-07-01T10:05:00Z'))).toBe('12:05')
  })
})

describe('renderTickerState', () => {
  beforeEach(() => {
    document.body.innerHTML = renderPage(site, '')
  })
  const cell = (k: string) => document.querySelector<HTMLElement>(`[data-t="${k}"]`)!
  const box = (k: string) => document.querySelector<HTMLElement>(`[data-cell="${k}"]`)!

  test('a song "<b>&" is rendered as text, not HTML, with the full text in title and the truncation class', () => {
    renderTickerState(document, { status: 'online', spotify: { song: '<b>&', artist: 'x' }, game: null })
    expect(cell('spotify').querySelector('b')).toBeNull()
    expect(cell('spotify').textContent).toBe('<b>& by x')
    expect(cell('spotify').title).toBe('<b>& by x')
    expect(cell('spotify').classList.contains('trunc')).toBe(true)
    expect(box('spotify').hidden).toBe(false)
  })

  test('online with a game shows it and marks the footer online', () => {
    renderTickerState(document, { status: 'online', spotify: null, game: 'Le Mans Ultimate' })
    expect(cell('status').textContent).toBe('online')
    expect(cell('game').textContent).toBe('Le Mans Ultimate')
    expect(box('game').hidden).toBe(false)
    expect(box('spotify').hidden).toBe(true)
    expect(document.querySelector('footer.ticker')!.getAttribute('data-status')).toBe('online')
  })

  test('offline renders status "offline", hides spotify and game cells, keeps time', () => {
    cell('time').textContent = '12:00'
    renderTickerState(document, { status: 'online', spotify: { song: 's', artist: 'a' }, game: 'g' })
    renderTickerState(document, OFFLINE)
    expect(cell('status').textContent).toBe('offline')
    expect(box('spotify').hidden).toBe(true)
    expect(box('game').hidden).toBe(true)
    expect(cell('time').textContent).toBe('12:00')
    expect(document.querySelector('footer.ticker')!.getAttribute('data-status')).toBe('offline')
  })
})

describe('connectLanyard', () => {
  class FakeWS {
    static all: FakeWS[] = []
    sent: unknown[] = []
    onmessage: ((e: { data: string }) => void) | null = null
    onclose: (() => void) | null = null
    onerror: (() => void) | null = null
    closed = false
    constructor(public url: string) {
      FakeWS.all.push(this)
    }
    send(d: string) {
      this.sent.push(JSON.parse(d))
    }
    close() {
      this.closed = true
    }
    recv(msg: unknown) {
      this.onmessage?.({ data: JSON.stringify(msg) })
    }
    drop() {
      this.onclose?.()
    }
  }
  const presence = { discord_status: 'online', activities: [{ type: 0, name: 'F1 26' }] }

  beforeEach(() => {
    FakeWS.all = []
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  const fetchOk = () =>
    vi.fn(async () => ({ ok: true, json: async () => ({ success: true, data: presence }) }) as unknown as Response)

  test('sends {op:2, d:{subscribe_to_id:id}} after op 1 Hello and heartbeats {op:3} every heartbeat_interval', () => {
    connectLanyard('123', () => {}, { WebSocket: FakeWS as unknown as typeof WebSocket, fetch: fetchOk() })
    const ws = FakeWS.all[0]
    expect(ws.url).toBe('wss://api.lanyard.rest/socket')
    ws.recv({ op: 1, d: { heartbeat_interval: 30000 } })
    expect(ws.sent).toEqual([{ op: 2, d: { subscribe_to_id: '123' } }])
    vi.advanceTimersByTime(30000)
    vi.advanceTimersByTime(30000)
    expect(ws.sent.slice(1)).toEqual([{ op: 3 }, { op: 3 }])
  })

  test('INIT_STATE and PRESENCE_UPDATE events call onState(toTickerState(d))', () => {
    const states: TickerState[] = []
    connectLanyard('123', s => states.push(s), { WebSocket: FakeWS as unknown as typeof WebSocket, fetch: fetchOk() })
    const ws = FakeWS.all[0]
    ws.recv({ op: 1, d: { heartbeat_interval: 30000 } })
    ws.recv({ op: 0, t: 'INIT_STATE', d: presence })
    ws.recv({ op: 0, t: 'PRESENCE_UPDATE', d: { discord_status: 'offline' } })
    ws.recv({ op: 0, t: 'SOMETHING_ELSE', d: presence })
    expect(states).toEqual([toTickerState(presence), OFFLINE])
  })

  test('on socket close it falls back to GET /v1/users/<id> and retries the socket with backoff (1s, 2s, 4s… max 30s)', async () => {
    const f = fetchOk()
    const states: TickerState[] = []
    connectLanyard('123', s => states.push(s), { WebSocket: FakeWS as unknown as typeof WebSocket, fetch: f })
    FakeWS.all[0].drop()
    expect(f).toHaveBeenCalledWith('https://api.lanyard.rest/v1/users/123')
    await vi.advanceTimersByTimeAsync(0)
    expect(states.at(-1)).toEqual(toTickerState(presence))
    await vi.advanceTimersByTimeAsync(999)
    expect(FakeWS.all.length).toBe(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(FakeWS.all.length).toBe(2)
    FakeWS.all[1].drop()
    await vi.advanceTimersByTimeAsync(1999)
    expect(FakeWS.all.length).toBe(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(FakeWS.all.length).toBe(3)
    for (let i = 0; i < 10; i++) {
      FakeWS.all.at(-1)!.drop()
      await vi.advanceTimersByTimeAsync(30000)
    }
    expect(FakeWS.all.length).toBe(13)
  })

  test('a failing fetch calls onState with offline and never throws', async () => {
    const states: TickerState[] = []
    const bad = vi.fn(async () => {
      throw new Error('network')
    })
    connectLanyard('123', s => states.push(s), { WebSocket: FakeWS as unknown as typeof WebSocket, fetch: bad as unknown as typeof fetch })
    FakeWS.all[0].drop()
    await vi.advanceTimersByTimeAsync(0)
    expect(states).toEqual([OFFLINE])
  })

  test('the disconnect function stops reconnecting and closes the socket', async () => {
    const stop = connectLanyard('123', () => {}, { WebSocket: FakeWS as unknown as typeof WebSocket, fetch: fetchOk() })
    const ws = FakeWS.all[0]
    stop()
    expect(ws.closed).toBe(true)
    ws.drop()
    await vi.advanceTimersByTimeAsync(60000)
    expect(FakeWS.all.length).toBe(1)
  })
})
