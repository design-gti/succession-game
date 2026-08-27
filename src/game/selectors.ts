import type { GameState, CandidateId } from './types'
import { TIMER_DURATION } from './reducer'

export function timerSecondsLeft(state: GameState): number {
  if (!state.timerStartedAt) return TIMER_DURATION
  const elapsed = (Date.now() - state.timerStartedAt) / 1000
  return Math.max(0, TIMER_DURATION - elapsed)
}

export function timerProgress(state: GameState): number {
  if (!state.timerStartedAt) return 1
  const elapsed = (Date.now() - state.timerStartedAt) / 1000
  return Math.max(0, 1 - elapsed / TIMER_DURATION)
}

export function hasRevealedFit(state: GameState, id: CandidateId): boolean {
  return state.revealedFits[id] !== undefined
}

export function getFit(state: GameState, id: CandidateId): number | undefined {
  return state.revealedFits[id]
}

export function currentBestFit(state: GameState): { id: CandidateId; fit: number } | null {
  const entries = Object.entries(state.revealedFits) as [CandidateId, number][]
  if (entries.length === 0) return null
  const best = entries.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)
  return { id: best[0], fit: best[1] }
}
