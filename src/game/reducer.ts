import type { GameState, GameAction, CandidateId } from './types'
import { computeScoreFromState } from './scoring'

export const TIMER_DURATION = 60 // seconds

function makeSessionId(): string {
  return crypto.randomUUID()
}

export const initialState: GameState = {
  phase: { name: 'intro' },
  sessionId: makeSessionId(),
  playerName: '',
  playerAvatar: 0,
  firstPickId: null,
  revealedFits: {},
  revealOrder: [],
  matchChecksUsed: 0,
  timerStartedAt: null,
  timerExpired: false,
  finalPickId: null,
  score: null,
  startedAt: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const p = state.phase

  switch (action.type) {
    case 'START_GAME': {
      if (p.name !== 'intro') return state
      return { ...state, phase: { name: 'nameEntry' }, startedAt: Date.now() }
    }

    case 'SUBMIT_NAME': {
      if (p.name !== 'nameEntry') return state
      // Straight into the game — the cinematic intro already covers the resignation story
      return {
        ...state,
        playerName: action.name,
        playerAvatar: action.avatarId,
        phase: { name: 'exploring' },
        timerStartedAt: Date.now(),
      }
    }

    case 'VIEW_ORG_CHART': {
      if (p.name !== 'orgChart') return state
      return { ...state, phase: { name: 'jobNeeds' } }
    }

    case 'START_SEARCHING': {
      if (p.name !== 'jobNeeds') return state
      return {
        ...state,
        phase: { name: 'exploring' },
        timerStartedAt: Date.now(),
      }
    }

    case 'REVEAL_FIT': {
      if (p.name !== 'exploring') return state
      // Ignore if already revealed
      if (state.revealedFits[action.id] !== undefined) return state

      const newRevealedFits = { ...state.revealedFits, [action.id]: action.fit }
      const newRevealOrder = [...state.revealOrder, action.id]
      const newMatchChecksUsed = state.matchChecksUsed + 1
      const newFirstPickId = state.firstPickId ?? (action.id as CandidateId)

      return {
        ...state,
        revealedFits: newRevealedFits,
        revealOrder: newRevealOrder,
        matchChecksUsed: newMatchChecksUsed,
        firstPickId: newFirstPickId,
      }
    }

    case 'READY_TO_DECIDE': {
      if (p.name !== 'exploring') return state
      const pickId = action.id ?? state.firstPickId
      if (!pickId) return state
      const firstId = state.firstPickId ?? pickId
      const base = { ...state, finalPickId: pickId, firstPickId: firstId }
      try {
        const score = computeScoreFromState(base)
        return { ...base, score, phase: { name: 'finalReveal' } }
      } catch {
        return { ...base, phase: { name: 'finalReveal' } }
      }
    }

    case 'TIME_UP': {
      if (p.name !== 'exploring') return state
      if (state.timerExpired) return state
      const pickId = action.id ?? state.firstPickId
      if (!pickId) return { ...state, timerExpired: true, phase: { name: 'finalReveal' } }
      const firstId = state.firstPickId ?? pickId
      const base = { ...state, timerExpired: true, finalPickId: pickId, firstPickId: firstId }
      try {
        const score = computeScoreFromState(base)
        return { ...base, score, phase: { name: 'finalReveal' } }
      } catch {
        return { ...base, phase: { name: 'finalReveal' } }
      }
    }

    case 'CONFIRM_FINAL': {
      if (p.name !== 'finalDecision') return state
      const newState = { ...state, finalPickId: action.id }
      try {
        const score = computeScoreFromState(newState)
        return { ...newState, score, phase: { name: 'finalReveal' } }
      } catch {
        return newState
      }
    }

    case 'SHOW_RESULT': {
      if (p.name !== 'finalReveal') return state
      return { ...state, phase: { name: 'result' } }
    }

    case 'SHOW_LEADERBOARD': {
      if (p.name !== 'result') return state
      return { ...state, phase: { name: 'leaderboard' } }
    }

    case 'SHOW_LEAD_CAPTURE': {
      if (p.name !== 'leaderboard') return state
      return { ...state, phase: { name: 'leadCapture' } }
    }

    case 'FINISH': {
      if (p.name !== 'leadCapture' && p.name !== 'leaderboard') return state
      return { ...state, phase: { name: 'finished' } }
    }

    case 'RESTART': {
      return { ...initialState, sessionId: makeSessionId() }
    }

    default:
      return state
  }
}
