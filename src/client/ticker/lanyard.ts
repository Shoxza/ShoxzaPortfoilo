import { toTickerState, type TickerState } from './state'

const SOCKET = 'wss://api.lanyard.rest/socket'
const REST = 'https://api.lanyard.rest/v1/users/'
const MAX_BACKOFF = 30_000

interface Deps {
  WebSocket?: typeof WebSocket
  fetch?: typeof fetch
}

/**
 * Live Discord presence via Lanyard's socket. If the socket drops, it fetches the REST
 * snapshot once and reconnects with exponential backoff. Never throws.
 * Returns a function that disconnects for good.
 */
export function connectLanyard(id: string, onState: (s: TickerState) => void, deps: Deps = {}): () => void {
  const WS = deps.WebSocket ?? globalThis.WebSocket
  const doFetch = deps.fetch ?? globalThis.fetch.bind(globalThis)
  let ws: WebSocket | null = null
  let heartbeat: ReturnType<typeof setInterval> | undefined
  let retry: ReturnType<typeof setTimeout> | undefined
  let backoff = 1000
  let stopped = false

  const snapshot = async () => {
    try {
      const res = await doFetch(`${REST}${id}`)
      const body: unknown = await res.json()
      const data = typeof body === 'object' && body !== null ? (body as { data?: unknown }).data : null
      onState(toTickerState(data))
    } catch {
      onState(toTickerState(null))
    }
  }

  const open = () => {
    if (stopped) return
    try {
      ws = new WS(SOCKET)
    } catch {
      scheduleRetry()
      return
    }
    ws.onmessage = e => {
      let msg: { op?: number; t?: string; d?: unknown }
      try {
        msg = JSON.parse(String(e.data))
      } catch {
        return
      }
      if (msg.op === 1) {
        backoff = 1000
        ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } }))
        const every = Number((msg.d as { heartbeat_interval?: number })?.heartbeat_interval) || 30_000
        clearInterval(heartbeat)
        heartbeat = setInterval(() => ws?.send(JSON.stringify({ op: 3 })), every)
      } else if (msg.op === 0 && (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE')) {
        onState(toTickerState(msg.d))
      }
    }
    ws.onclose = () => {
      clearInterval(heartbeat)
      if (stopped) return
      void snapshot()
      scheduleRetry()
    }
  }

  const scheduleRetry = () => {
    if (stopped) return
    clearTimeout(retry)
    retry = setTimeout(open, backoff)
    backoff = Math.min(backoff * 2, MAX_BACKOFF)
  }

  open()
  return () => {
    stopped = true
    clearInterval(heartbeat)
    clearTimeout(retry)
    ws?.close()
  }
}
