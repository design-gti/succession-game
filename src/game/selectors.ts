import type { GameState } from './types'
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
