import type { GameState, GameAction } from './types'
import { computeScore } from './scoring'

export const TIMER_DURATION = 60 // seconds

function makeSessionId(): string {
  return crypto.randomUUID()
}

export const initialState: GameState = {
  phase: { name: 'intro' },
  sessionId: makeSessionId(),
  playerName: '',
  playerEmail: '',
  playerCompany: '',
  playerAvatar: 0,
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
      return {
        ...state,
        playerName: action.name,
        playerEmail: action.email,
        playerCompany: action.company,
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
      return { ...state, phase: { name: 'exploring' }, timerStartedAt: Date.now() }
    }

    case 'CONFIRM_EXPLORE': {
      if (p.name !== 'exploring') return state
      const score = computeScore(action.overallFit, action.timeLeft)
      return {
        ...state,
        finalPickId: action.finalPickId,
        score,
        phase: { name: 'finalReveal' },
      }
    }

    case 'TIME_UP': {
      if (p.name !== 'exploring') return state
      if (state.timerExpired) return state
      const score = computeScore(action.overallFit, 0)
      return {
        ...state,
        timerExpired: true,
        finalPickId: action.finalPickId ?? null,
        score,
        phase: { name: action.finalPickId ? 'finalReveal' : 'result' },
      }
    }

    case 'CONFIRM_FINAL': {
      if (p.name !== 'finalDecision') return state
      return { ...state, finalPickId: action.id, phase: { name: 'finalReveal' } }
    }

    case 'SHOW_RESULT': {
      if (p.name !== 'finalReveal') return state
      return { ...state, phase: { name: 'result' } }
    }

    case 'SHOW_KELOLA_REVEAL': {
      if (p.name !== 'result') return state
      return { ...state, phase: { name: 'kelolaReveal' } }
    }

    case 'SHOW_DEMO_QR': {
      if (p.name !== 'kelolaReveal' && p.name !== 'leaderboard') return state
      return { ...state, phase: { name: 'demoQR' } }
    }

    case 'SHOW_LEADERBOARD': {
      if (p.name !== 'result' && p.name !== 'kelolaReveal' && p.name !== 'demoQR') return state
      return { ...state, phase: { name: 'leaderboard' } }
    }

    case 'SHOW_LEAD_CAPTURE': {
      if (p.name !== 'leaderboard') return state
      return { ...state, phase: { name: 'leadCapture' } }
    }

    case 'FINISH': {
      if (p.name !== 'leaderboard' && p.name !== 'leadCapture') return state
      return { ...state, phase: { name: 'finished' } }
    }

    case 'RESTART': {
      return { ...initialState, sessionId: makeSessionId() }
    }

    default:
      return state
  }
}
