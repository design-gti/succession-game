import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react'
import { gameReducer, initialState } from './reducer'
import type { GameState, GameAction, CandidateId } from './types'
import { logEvent, submitPlay, flushQueue } from '../lib/api'
import { resolveName } from '../lib/names'
import { getCandidateById } from '../data/scenario'

interface GameContextValue {
  state: GameState
  actions: {
    startGame: () => void
    submitName: (name: string, avatarId?: number) => void
    viewOrgChart: () => void
    startSearching: () => void
    revealFit: (id: CandidateId) => void
    readyToDecide: (id: CandidateId) => void
    confirmFinal: (id: CandidateId) => void
    showResult: () => void
    showLeaderboard: () => void
    showLeadCapture: () => void
    finish: () => void
    restart: () => void
  }
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(gameReducer, initialState)
  const prevPhaseRef = useRef(state.phase.name)
  const playSubmittedRef = useRef(false)

  // Flush offline event queue when connectivity restores
  useEffect(() => {
    flushQueue(state.sessionId)
    const handler = () => flushQueue(state.sessionId)
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [])


  // Analytics: phase transitions
  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    const currPhase = state.phase.name
    const sid = state.sessionId

    if (prevPhase !== currPhase) {
      if (currPhase === 'nameEntry') logEvent('game_started', sid)
      if (currPhase === 'orgChart') logEvent('vacancy_viewed', sid)
      if (currPhase === 'jobNeeds') logEvent('job_needs_viewed', sid)

      if (currPhase === 'result' && !playSubmittedRef.current && state.score) {
        playSubmittedRef.current = true
        logEvent('final_score', sid, { score: state.score.total, persona: state.score.persona })
        if (state.score.bestMatchFound) logEvent('best_match_found', sid)
        logEvent('game_completed', sid)
        const durationSeconds = state.startedAt
          ? Math.round((Date.now() - state.startedAt) / 1000)
          : undefined
        submitPlay({
          session_id: sid,
          player_name: state.playerName,
          score: state.score.total,
          persona: state.score.persona,
          first_pick_fit: state.score.firstPickFit,
          final_fit: state.score.finalFit,
          best_match_found: state.score.bestMatchFound,
          match_checks_used: state.score.matchChecksUsed,
          duration_seconds: durationSeconds,
        })
      }
    }

    prevPhaseRef.current = currPhase
  }, [state])

  const dispatch = useCallback((action: GameAction) => {
    rawDispatch(action)
  }, [])

  const actions: GameContextValue['actions'] = {
    startGame: () => dispatch({ type: 'START_GAME' }),

    submitName: (name: string, avatarId = 0) => {
      dispatch({ type: 'SUBMIT_NAME', name: resolveName(name), avatarId })
    },

    viewOrgChart: () => dispatch({ type: 'VIEW_ORG_CHART' }),

    startSearching: () => dispatch({ type: 'START_SEARCHING' }),

    revealFit: (id: CandidateId) => {
      const candidate = getCandidateById(id)
      const isFirstPick = state.firstPickId === null
      dispatch({ type: 'REVEAL_FIT', id, fit: candidate.roleFit })
      logEvent('match_check_used', state.sessionId, {
        candidateId: id,
        checkNumber: state.matchChecksUsed + 1,
        isFirstPick,
      })
      logEvent('role_fit_viewed', state.sessionId, { candidateId: id, fit: candidate.roleFit })
      if (isFirstPick) {
        logEvent('first_pick_selected', state.sessionId, { candidateId: id })
      }
    },

    readyToDecide: (id: CandidateId) => dispatch({ type: 'READY_TO_DECIDE', id }),

    confirmFinal: (id: CandidateId) => {
      dispatch({ type: 'CONFIRM_FINAL', id })
      logEvent('final_pick_selected', state.sessionId, { candidateId: id })
    },

    showResult: () => dispatch({ type: 'SHOW_RESULT' }),
    showLeaderboard: () => dispatch({ type: 'SHOW_LEADERBOARD' }),
    showLeadCapture: () => dispatch({ type: 'SHOW_LEAD_CAPTURE' }),
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
