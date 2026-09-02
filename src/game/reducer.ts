import type { GameState, GameAction } from './types'
import { computeScore } from './scoring'
import { generateNameMap } from '../data/scenario'

function makeSessionId(): string {
  return crypto.randomUUID()
}

export const initialState: GameState = {
  phase: { name: 'intro' },
  sessionId: makeSessionId(),
  playerName: '',
  playerEmail: '',
  playerCompany: '',
  finalPickId: null,
  score: null,
  startedAt: null,
  nameMap: generateNameMap(),
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const p = state.phase

  switch (action.type) {
    case 'START_GAME': {
      if (p.name !== 'intro') return state
      return { ...state, phase: { name: 'leadCapture' } }
    }

    case 'SUBMIT_LEAD_INFO': {
      return {
        ...state,
        playerName: action.name,
        playerEmail: action.email,
        playerCompany: action.company,
        phase: p.name === 'leadCapture' ? { name: 'exploring' } : state.phase,
        startedAt: p.name === 'leadCapture' ? Date.now() : state.startedAt,
      }
    }

    case 'CONFIRM_EXPLORE': {
      if (p.name !== 'exploring') return state
      const score = computeScore(action.overallFit, action.timeFill)
      return {
        ...state,
        finalPickId: action.finalPickId,
        score,
        phase: { name: 'result' },
      }
    }

    case 'SHOW_KELOLA_REVEAL': {
      if (p.name !== 'result') return state
      return { ...state, phase: { name: 'kelolaReveal' } }
    }

    case 'FINISH': {
      if (p.name !== 'kelolaReveal') return state
      return { ...state, phase: { name: 'finished' } }
    }

    case 'SKIP_TO_REVEAL': {
      if (p.name !== 'leadCapture') return state
      return {
        ...state,
        playerName: action.name,
        playerEmail: action.email,
        playerCompany: action.company,
        phase: { name: 'kelolaReveal' },
      }
    }

    case 'RESTART': {
      return { ...initialState, sessionId: makeSessionId(), nameMap: generateNameMap() }
    }

    default:
      return state
  }
}
