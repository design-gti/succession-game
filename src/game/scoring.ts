import { getCandidateById, BEST_CANDIDATE_ID } from '../data/scenario'
import type { CandidateId, GameState, ScoreBreakdown, Persona } from './types'

export function personaFor(total: number): Persona {
  if (total >= 90) return 'TALENT ARCHITECT'
  if (total >= 75) return 'TALENT STRATEGIST'
  if (total >= 60) return 'TALENT SCOUT'
  return 'GUT-FEEL MANAGER'
}

// Scoring model (adapted from GDD §29-30 for timer mechanic):
// - discoveryBonus: +30 if user revealed Nadia's fit (found the best candidate)
// - pickBonus:      +30 if user's final pick is Nadia (chose the best candidate)
// - finalRoleFit:   0-30 proportional to final pick's Role Fit %
// - searchEfficiency: 0-10 based on how early Nadia was revealed
export function computeScore(
  finalPickId: CandidateId,
  firstPickId: CandidateId,
  revealOrder: CandidateId[],
  matchChecksUsed: number,
): ScoreBreakdown {
  const finalCandidate = getCandidateById(finalPickId)
  const firstCandidate = getCandidateById(firstPickId)

  const nadiaRevealed = revealOrder.includes(BEST_CANDIDATE_ID)
  const bestMatchFound = finalPickId === BEST_CANDIDATE_ID

  const discoveryBonus = nadiaRevealed ? 30 : 0
  const pickBonus = bestMatchFound ? 30 : 0

  const finalRoleFitPoints = Math.round((finalCandidate.roleFit / 100) * 30)

  const nadiaRevealIndex = revealOrder.indexOf(BEST_CANDIDATE_ID)
  let searchEfficiencyPoints = 0
  if (nadiaRevealIndex === 0) searchEfficiencyPoints = 10
  else if (nadiaRevealIndex === 1) searchEfficiencyPoints = 7
  else if (nadiaRevealIndex === 2) searchEfficiencyPoints = 4

  const total = Math.min(100, discoveryBonus + pickBonus + finalRoleFitPoints + searchEfficiencyPoints)

  return {
    discoveryBonus,
    pickBonus,
    finalRoleFitPoints,
    searchEfficiencyPoints,
    total,
    persona: personaFor(total),
    firstPickFit: firstCandidate.roleFit,
    finalFit: finalCandidate.roleFit,
    matchChecksUsed,
    bestMatchFound,
  }
}

export function computeScoreFromState(state: GameState): ScoreBreakdown {
  if (!state.finalPickId || !state.firstPickId) {
    throw new Error('Cannot compute score without final and first picks')
  }
  return computeScore(
    state.finalPickId,
    state.firstPickId,
    state.revealOrder,
    state.matchChecksUsed,
  )
}

export function fitColor(fit: number): string {
  if (fit >= 85) return '#22c55e'
  if (fit >= 75) return '#f59e0b'
  return '#ef4444'
}

export function fitLabel(fit: number): string {
  if (fit >= 90) return 'Excellent Match'
  if (fit >= 80) return 'Strong Match'
  if (fit >= 70) return 'Moderate Match'
  return 'Weak Match'
}
