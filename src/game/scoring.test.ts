import { describe, it, expect } from 'vitest'
import { computeScore } from './scoring'

describe('computeScore', () => {
  it('perfect fitness + full time = 100', () => {
    const s = computeScore(100, 60)
    expect(s.fitnessPoints).toBe(80)
    expect(s.speedPoints).toBe(20)
    expect(s.total).toBe(100)
  })

  it('perfect fitness + no time = 80', () => {
    const s = computeScore(100, 0)
    expect(s.fitnessPoints).toBe(80)
    expect(s.speedPoints).toBe(0)
    expect(s.total).toBe(80)
  })

  it('zero fitness + full time = 20', () => {
    const s = computeScore(0, 60)
    expect(s.fitnessPoints).toBe(0)
    expect(s.speedPoints).toBe(20)
    expect(s.total).toBe(20)
  })

  it('75% fitness + 30s remaining = 60 + 10 = 70', () => {
    const s = computeScore(75, 30)
    expect(s.fitnessPoints).toBe(60)
    expect(s.speedPoints).toBe(10)
    expect(s.total).toBe(70)
  })

  it('persona thresholds', () => {
    expect(computeScore(100, 60).persona).toBe('TALENT ARCHITECT')
    expect(computeScore(90, 5).persona).toBe('TALENT STRATEGIST')
    expect(computeScore(60, 20).persona).toBe('TALENT SCOUT')
    expect(computeScore(40, 0).persona).toBe('GUT-FEEL MANAGER')
  })
})
