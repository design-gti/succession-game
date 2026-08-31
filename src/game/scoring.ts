import type { ScoreBreakdown, Persona, TimeFillData } from './types'

// 2D persona matrix: quality (orgFit) vs speed (hiringSpeed)
export function personaFor2D(orgFit: number, hiringSpeed: number): Persona {
  const highQuality = orgFit >= 75
  const highSpeed = hiringSpeed >= 70
  if (highQuality && highSpeed) return 'TALENT STRATEGIST'
  if (highQuality && !highSpeed) return 'QUALITY ARCHITECT'
  if (!highQuality && highSpeed) return 'RAPID RECRUITER'
  return 'TALENT EXPLORER'
}

// hiringSpeed: 100 = filled in 3 days, 0 = filled in 30+ days
// avgTTF of 3 days → 100, 30+ days → 0 (linear clamp)
export function computeHiringSpeed(avgTTF: number): number {
  const MIN_DAYS = 3
  const MAX_DAYS = 30
  const clamped = Math.max(MIN_DAYS, Math.min(MAX_DAYS, avgTTF))
  return Math.round(100 - ((clamped - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100)
}

export function computeScore(overallFit: number, timeFill: TimeFillData): ScoreBreakdown {
  const hiringSpeed = computeHiringSpeed(timeFill.avgTTF)
  const total = Math.round(overallFit * 0.7 + hiringSpeed * 0.3)
  const persona = personaFor2D(overallFit, hiringSpeed)
  return { overallFit, hiringSpeed, total, persona, timeFill }
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
