import { describe, it, expect } from 'vitest'
import { computeScore, personaFor } from './scoring'
import type { CandidateId } from './types'

const N: CandidateId = 'nadia'   // best match, 92% fit
const R: CandidateId = 'rani'    // 86% fit
const M: CandidateId = 'maya'    // 81% fit
const A: CandidateId = 'andi'    // 74% fit

describe('personaFor', () => {
  it('returns TALENT ARCHITECT for 90+', () => {
    expect(personaFor(90)).toBe('TALENT ARCHITECT')
    expect(personaFor(100)).toBe('TALENT ARCHITECT')
  })
  it('returns TALENT STRATEGIST for 75-89', () => {
    expect(personaFor(75)).toBe('TALENT STRATEGIST')
    expect(personaFor(89)).toBe('TALENT STRATEGIST')
  })
  it('returns TALENT SCOUT for 60-74', () => {
    expect(personaFor(60)).toBe('TALENT SCOUT')
    expect(personaFor(74)).toBe('TALENT SCOUT')
  })
  it('returns GUT-FEEL MANAGER below 60', () => {
    expect(personaFor(59)).toBe('GUT-FEEL MANAGER')
    expect(personaFor(0)).toBe('GUT-FEEL MANAGER')
  })
})

describe('computeScore — found and picked Nadia', () => {
  it('1st check: discoveryBonus 30 + pickBonus 30 + fitPoints 28 + efficiency 10 = 98', () => {
    const s = computeScore(N, N, [N], 1)
    expect(s.discoveryBonus).toBe(30)
    expect(s.pickBonus).toBe(30)
    expect(s.finalRoleFitPoints).toBe(28)   // round(92/100*30)
    expect(s.searchEfficiencyPoints).toBe(10)
    expect(s.total).toBe(98)
    expect(s.persona).toBe('TALENT ARCHITECT')
    expect(s.bestMatchFound).toBe(true)
  })

  it('2nd check: efficiency 7 → total 95', () => {
    const s = computeScore(N, A, [A, N], 2)
    expect(s.searchEfficiencyPoints).toBe(7)
    expect(s.total).toBe(95)
    expect(s.persona).toBe('TALENT ARCHITECT')
  })

  it('3rd check: efficiency 4 → total 92', () => {
    const s = computeScore(N, A, [A, R, N], 3)
    expect(s.searchEfficiencyPoints).toBe(4)
    expect(s.total).toBe(92)
    expect(s.persona).toBe('TALENT ARCHITECT')
  })

  it('4th+ check: efficiency 0 → total 88', () => {
    const s = computeScore(N, A, [A, R, M, N], 4)
    expect(s.searchEfficiencyPoints).toBe(0)
    expect(s.total).toBe(88)
    expect(s.persona).toBe('TALENT STRATEGIST')
  })
})

describe('computeScore — found Nadia but picked someone else', () => {
  it('found Nadia (2nd check), picked Rani → TALENT SCOUT range', () => {
    const s = computeScore(R, R, [R, N], 2)
    // discoveryBonus 30 (found Nadia) + pickBonus 0 + fitPoints round(86/100*30)=26 + efficiency 7 = 63
    expect(s.discoveryBonus).toBe(30)
    expect(s.pickBonus).toBe(0)
    expect(s.finalRoleFitPoints).toBe(26)
    expect(s.searchEfficiencyPoints).toBe(7)
    expect(s.total).toBe(63)
    expect(s.persona).toBe('TALENT SCOUT')
    expect(s.bestMatchFound).toBe(false)
  })

  it('found Nadia (1st check), picked Rani → TALENT SCOUT', () => {
    const s = computeScore(R, N, [N, R], 2)
    // discovery 30 + pick 0 + 26 + efficiency 10 = 66
    expect(s.searchEfficiencyPoints).toBe(10)
    expect(s.total).toBe(66)
    expect(s.persona).toBe('TALENT SCOUT')
  })
})

describe('computeScore — never found Nadia (gut-feel)', () => {
  it('picked Rani, never revealed Nadia → GUT-FEEL MANAGER', () => {
    const s = computeScore(R, R, [R], 1)
    expect(s.discoveryBonus).toBe(0)
    expect(s.pickBonus).toBe(0)
    expect(s.searchEfficiencyPoints).toBe(0)
    // 0 + 0 + 26 + 0 = 26
    expect(s.total).toBe(26)
    expect(s.persona).toBe('GUT-FEEL MANAGER')
  })

  it('picked Andi (74%), never revealed Nadia → GUT-FEEL MANAGER', () => {
    const s = computeScore(A, A, [A], 1)
    // 0 + 0 + round(74/100*30)=22 + 0 = 22
    expect(s.total).toBe(22)
    expect(s.persona).toBe('GUT-FEEL MANAGER')
  })
})
