const QUEUE_KEY = 'fts_event_queue'
const MAX_QUEUE = 200

export interface QueuedEvent {
  event: string
  payload: Record<string, unknown>
  session_id: string
  ts: number
}

export function enqueueEvent(e: QueuedEvent): void {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    const q: QueuedEvent[] = raw ? JSON.parse(raw) : []
    q.push(e)
    if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  } catch {
    // localStorage unavailable — drop silently
  }
}

export function dequeueAll(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    localStorage.removeItem(QUEUE_KEY)
    return JSON.parse(raw) as QueuedEvent[]
  } catch {
    return []
  }
}
