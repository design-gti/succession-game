import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react'
import { gameReducer, initialState } from './reducer'
import type { GameState, GameAction, CandidateId, TimeFillData } from './types'
import { logEvent, submitPlay, submitLead, flushQueue } from '../lib/api'

interface GameContextValue {
  state: GameState
  actions: {
    startGame: () => void
    submitLeadInfo: (name: string, phone: string, company: string) => void
    skipToReveal: (name: string, phone: string, company: string, score: import('./types').ScoreBreakdown | null) => void
    confirmExplore: (finalPickId: CandidateId, overallFit: number, timeFill: TimeFillData) => void
    showKelolaReveal: () => void
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

      if (currPhase === 'finished' && state.score && state.playerPhone) {
        submitLead({
          session_id: sid,
          name: state.playerName,
          company: state.playerCompany,
          phone: state.playerPhone,
          score: state.score.total,
          persona: state.score.persona,
        })
        logEvent('lead_submitted', sid, { phone: state.playerPhone })
      }
    }

    prevPhaseRef.current = currPhase
  }, [state])

  const dispatch = useCallback((action: GameAction) => {
    rawDispatch(action)
  }, [])

  const actions: GameContextValue['actions'] = {
    startGame: () => dispatch({ type: 'START_GAME' }),

    skipToReveal: (name: string, phone: string, company: string, score) => {
      dispatch({ type: 'SKIP_TO_REVEAL', name, phone, company, score })
    },
    submitLeadInfo: (name: string, phone: string, company: string) => {
      dispatch({ type: 'SUBMIT_LEAD_INFO', name, phone, company })
    },

    confirmExplore: (finalPickId: CandidateId, overallFit: number, timeFill: TimeFillData) => {
      dispatch({ type: 'CONFIRM_EXPLORE', finalPickId, overallFit, timeFill })
      logEvent('explore_confirmed', state.sessionId, { finalPickId, overallFit, avgTTF: timeFill.avgTTF })
    },

    showKelolaReveal: () => {
      dispatch({ type: 'SHOW_KELOLA_REVEAL' })
      logEvent('kelola_reveal_viewed', state.sessionId)
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
