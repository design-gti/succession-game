import type { ScoreBreakdown, Persona } from './types'

export function personaFor(total: number): Persona {
  if (total >= 87) return 'TALENT ARCHITECT'
  if (total >= 75) return 'TALENT STRATEGIST'
  if (total >= 60) return 'TALENT SCOUT'
  return 'GUT-FEEL MANAGER'
}

export function computeScore(overallFit: number): ScoreBreakdown {
  const total = overallFit
  return { overallFit, total, persona: personaFor(total) }
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
