import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react'
import { gameReducer, initialState } from './reducer'
import type { GameState, GameAction, CandidateId } from './types'
import { logEvent, submitPlay, submitLead, flushQueue } from '../lib/api'

interface GameContextValue {
  state: GameState
  actions: {
    startGame: () => void
    confirmExplore: (finalPickId: CandidateId, overallFit: number) => void
    showResult: () => void
    showKelolaReveal: () => void
    showDemoQR: () => void
    showLeadCapture: () => void
    submitLeadInfo: (name: string, email: string, company: string) => void
    finish: () => void
    restart: () => void
  }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(gameReducer, initialState)
  const prevPhaseRef = useRef(state.phase.name)
  const playSubmittedRef = useRef(false)

  useEffect(() => {
    flushQueue(state.sessionId)
    const handler = () => flushQueue(state.sessionId)
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [])

  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    const currPhase = state.phase.name
    const sid = state.sessionId

    if (prevPhase !== currPhase) {
      if (currPhase === 'exploring') logEvent('game_started', sid)

      if (currPhase === 'result' && !playSubmittedRef.current && state.score) {
        playSubmittedRef.current = true
        logEvent('final_score', sid, { score: state.score.total, persona: state.score.persona })
        logEvent('game_completed', sid)
        const durationSeconds = state.startedAt
          ? Math.round((Date.now() - state.startedAt) / 1000)
          : undefined
        submitPlay({
          session_id: sid,
          player_name: state.playerName || 'Anonymous',
          score: state.score.total,
          persona: state.score.persona,
          overall_fit: state.score.overallFit,
          time_left: 0,
          duration_seconds: durationSeconds,
        })
      }

      if (currPhase === 'demoQR' && state.score && state.playerEmail) {
        submitLead({
          session_id: sid,
          name: state.playerName,
          company: state.playerCompany,
          email: state.playerEmail,
          score: state.score.total,
          persona: state.score.persona,
        })
        logEvent('lead_submitted', sid, { email_domain: state.playerEmail.split('@')[1] })
      }
    }

    prevPhaseRef.current = currPhase
  }, [state])

  const dispatch = useCallback((action: GameAction) => {
    rawDispatch(action)
  }, [])

  const actions: GameContextValue['actions'] = {
    startGame: () => dispatch({ type: 'START_GAME' }),

    confirmExplore: (finalPickId: CandidateId, overallFit: number) => {
      dispatch({ type: 'CONFIRM_EXPLORE', finalPickId, overallFit })
      logEvent('explore_confirmed', state.sessionId, { finalPickId, overallFit })
    },

    showResult: () => dispatch({ type: 'SHOW_RESULT' }),

    showKelolaReveal: () => {
      dispatch({ type: 'SHOW_KELOLA_REVEAL' })
      logEvent('kelola_reveal_viewed', state.sessionId)
    },

    showDemoQR: () => {
      dispatch({ type: 'SHOW_DEMO_QR' })
      logEvent('demo_qr_shown', state.sessionId)
    },

    showLeadCapture: () => dispatch({ type: 'SHOW_LEAD_CAPTURE' }),

    submitLeadInfo: (name: string, email: string, company: string) => {
      dispatch({ type: 'SUBMIT_LEAD_INFO', name, email, company })
    },

    finish: () => dispatch({ type: 'FINISH' }),

    restart: () => {
      playSubmittedRef.current = false
      dispatch({ type: 'RESTART' })
    },
  }

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
