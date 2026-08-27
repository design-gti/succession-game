import { supabase } from './supabase'
import { enqueueEvent, dequeueAll } from './queue'
import type { Persona } from '../game/types'

export type GameEventName =
  | 'game_started'
  | 'vacancy_viewed'
  | 'job_needs_viewed'
  | 'employee_profile_opened'
  | 'external_profile_opened'
  | 'explore_confirmed'
  | 'final_pick_selected'
  | 'final_score'
  | 'game_completed'
  | 'lead_submitted'

export async function logEvent(
  name: GameEventName,
  sessionId: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const entry = { event: name, payload, session_id: sessionId, ts: Date.now() }
  if (!supabase) { enqueueEvent(entry); return }
  const { error } = await supabase.from('events').insert({
    session_id: sessionId,
    event: name,
    payload,
  })
  if (error) enqueueEvent(entry)
}

export async function flushQueue(sessionId: string): Promise<void> {
  if (!supabase) return
  const queued = dequeueAll()
  if (queued.length === 0) return
  await supabase.from('events').insert(
    queued.map(e => ({ session_id: e.session_id || sessionId, event: e.event, payload: e.payload })),
  )
}

export interface PlayRow {
  session_id: string
  player_name: string
  score: number
  persona: Persona
  overall_fit: number
  time_left: number
  duration_seconds?: number
}

export async function submitPlay(row: PlayRow): Promise<{ rank: number | null }> {
  if (!supabase) return { rank: null }
  try {
    await supabase.from('plays').insert(row)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .gt('score', row.score)

    return { rank: count != null ? count + 1 : null }
  } catch {
    return { rank: null }
  }
}

export interface LeaderboardRow {
  id: string
  player_name: string
  score: number
  persona: Persona
  created_at: string
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[] | null> {
  if (!supabase) return null
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('plays')
      .select('id, player_name, score, persona, created_at')
      .gte('created_at', today.toISOString())
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10)
    if (error) return null
    return data as LeaderboardRow[]
  } catch {
    return null
  }
}

export interface LeadRow {
  session_id?: string
  name: string
  company: string
  email: string
  score?: number
  persona?: Persona
}

export async function submitLead(lead: LeadRow): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('leads').insert(lead)
    if (error) {
      await new Promise(r => setTimeout(r, 1000))
      const { error: e2 } = await supabase.from('leads').insert(lead)
      return !e2
    }
    return true
  } catch {
    return false
  }
}
