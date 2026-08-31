import type { GameState, GameAction } from './types'
import { computeScore } from './scoring'

function makeSessionId(): string {
  return crypto.randomUUID()
}

export const initialState: GameState = {
  phase: { name: 'leadCapture' },
  sessionId: makeSessionId(),
  playerName: '',
  playerEmail: '',
  playerCompany: '',
  finalPickId: null,
  score: null,
  startedAt: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const p = state.phase

  switch (action.type) {
    case 'START_GAME': {
      if (p.name !== 'intro') return state
      return { ...state, phase: { name: 'exploring' }, startedAt: Date.now() }
    }

    case 'CONFIRM_EXPLORE': {
      if (p.name !== 'exploring') return state
      const score = computeScore(action.overallFit)
      return {
        ...state,
        finalPickId: action.finalPickId,
        score,
        phase: { name: 'finalReveal' },
      }
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
      if (p.name !== 'kelolaReveal') return state
      return { ...state, phase: { name: 'demoQR' } }
    }

    case 'SHOW_LEAD_CAPTURE': {
      if (p.name !== 'demoQR' && p.name !== 'result' && p.name !== 'kelolaReveal') return state
      return { ...state, phase: { name: 'leadCapture' } }
    }

    case 'SUBMIT_LEAD_INFO': {
      return {
        ...state,
        playerName: action.name,
        playerEmail: action.email,
        playerCompany: action.company,
        // if coming from leadCapture (pre-game), advance to intro
        phase: p.name === 'leadCapture' ? { name: 'intro' } : state.phase,
      }
    }

    case 'FINISH': {
      if (p.name !== 'demoQR') return state
      return { ...state, phase: { name: 'finished' } }
    }

    case 'RESTART': {
      return { ...initialState, sessionId: makeSessionId() }
    }

    default:
      return state
  }
}
