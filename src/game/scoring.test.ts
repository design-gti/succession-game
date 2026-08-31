import { describe, it, expect } from 'vitest'
import { computeScore } from './scoring'

describe('computeScore', () => {
  it('perfect fitness = 100', () => {
    const s = computeScore(100)
    expect(s.total).toBe(100)
    expect(s.persona).toBe('TALENT ARCHITECT')
  })

  it('87+ = TALENT ARCHITECT', () => {
    expect(computeScore(87).persona).toBe('TALENT ARCHITECT')
  })

  it('75–86 = TALENT STRATEGIST', () => {
    expect(computeScore(75).persona).toBe('TALENT STRATEGIST')
    expect(computeScore(86).persona).toBe('TALENT STRATEGIST')
  })

  it('60–74 = TALENT SCOUT', () => {
    expect(computeScore(60).persona).toBe('TALENT SCOUT')
    expect(computeScore(74).persona).toBe('TALENT SCOUT')
  })

  it('below 60 = GUT-FEEL MANAGER', () => {
    expect(computeScore(59).persona).toBe('GUT-FEEL MANAGER')
    expect(computeScore(0).persona).toBe('GUT-FEEL MANAGER')
  })

  it('total = overallFit', () => {
    const s = computeScore(72)
    expect(s.total).toBe(72)
    expect(s.overallFit).toBe(72)
  })
})
