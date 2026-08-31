import { describe, it, expect } from 'vitest'
import { computeScore, computeHiringSpeed, personaFor2D } from './scoring'
import type { TimeFillData } from './types'

const FAST_TTF: TimeFillData = { currentDay: 3, placements: [], avgTTF: 3, totalDays: 3 }
const SLOW_TTF: TimeFillData = { currentDay: 30, placements: [], avgTTF: 30, totalDays: 30 }
const MID_TTF: TimeFillData = { currentDay: 16, placements: [], avgTTF: 16, totalDays: 16 }

describe('computeHiringSpeed', () => {
  it('3 days = 100', () => expect(computeHiringSpeed(3)).toBe(100))
  it('30 days = 0', () => expect(computeHiringSpeed(30)).toBe(0))
  it('clamps below min', () => expect(computeHiringSpeed(1)).toBe(100))
  it('clamps above max', () => expect(computeHiringSpeed(60)).toBe(0))
})

describe('personaFor2D', () => {
  it('high quality + high speed = TALENT STRATEGIST', () => {
    expect(personaFor2D(80, 80)).toBe('TALENT STRATEGIST')
  })
  it('high quality + low speed = QUALITY ARCHITECT', () => {
    expect(personaFor2D(80, 50)).toBe('QUALITY ARCHITECT')
  })
  it('low quality + high speed = RAPID RECRUITER', () => {
    expect(personaFor2D(60, 80)).toBe('RAPID RECRUITER')
  })
  it('low quality + low speed = TALENT EXPLORER', () => {
    expect(personaFor2D(60, 50)).toBe('TALENT EXPLORER')
  })
})

describe('computeScore', () => {
  it('total = 70% orgFit + 30% hiringSpeed', () => {
    const s = computeScore(80, FAST_TTF)  // hiringSpeed=100, total=0.7*80+0.3*100=86
    expect(s.total).toBe(86)
    expect(s.overallFit).toBe(80)
    expect(s.hiringSpeed).toBe(100)
  })

  it('slow hire reduces total', () => {
    const s = computeScore(80, SLOW_TTF)  // hiringSpeed=0, total=0.7*80+0=56
    expect(s.total).toBe(56)
  })

  it('persona assigned', () => {
    expect(computeScore(80, FAST_TTF).persona).toBe('TALENT STRATEGIST')
    expect(computeScore(80, SLOW_TTF).persona).toBe('QUALITY ARCHITECT')
  })
})
