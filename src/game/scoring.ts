import type { ScoreBreakdown, Persona } from './types'

export function personaFor(total: number): Persona {
  if (total >= 90) return 'TALENT ARCHITECT'
  if (total >= 75) return 'TALENT STRATEGIST'
  if (total >= 60) return 'TALENT SCOUT'
  return 'GUT-FEEL MANAGER'
}

// Scoring model:
// - fitnessPoints: 0-80, proportional to overall team fitness %
// - speedPoints:   0-20, proportional to time remaining out of 60s
export function computeScore(overallFit: number, timeLeft: number): ScoreBreakdown {
  const fitnessPoints = Math.round(overallFit * 0.8)
  const speedPoints = Math.round((Math.max(0, timeLeft) / 60) * 20)
  const total = Math.min(100, fitnessPoints + speedPoints)

  return {
    fitnessPoints,
    speedPoints,
    overallFit,
    timeLeft,
    total,
    persona: personaFor(total),
  }
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
