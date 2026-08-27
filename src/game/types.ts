export type CandidateId =
  | 'andi' | 'rani' | 'maya' | 'fajar' | 'dimas'
  | 'bintang' | 'sari' | 'rizky' | 'putri'
  | 'nadia' | 'kevin' | 'dewi' | 'aryo' | 'liana'

export type Phase =
  | { name: 'intro' }
  | { name: 'nameEntry' }
  | { name: 'orgChart' }
  | { name: 'jobNeeds' }
  | { name: 'exploring' }
  | { name: 'finalDecision' }
  | { name: 'finalReveal' }
  | { name: 'result' }
  | { name: 'leaderboard' }
  | { name: 'leadCapture' }
  | { name: 'finished' }

export interface ScoreBreakdown {
  discoveryBonus: number
  pickBonus: number
  finalRoleFitPoints: number
  searchEfficiencyPoints: number
  total: number
  persona: Persona
  firstPickFit: number
  finalFit: number
  matchChecksUsed: number
  bestMatchFound: boolean
}

export type Persona =
  | 'TALENT ARCHITECT'
  | 'TALENT STRATEGIST'
  | 'TALENT SCOUT'
  | 'GUT-FEEL MANAGER'

export interface GameState {
  phase: Phase
  sessionId: string
  playerName: string
  playerAvatar: number
  firstPickId: CandidateId | null
  revealedFits: Partial<Record<CandidateId, number>>
  revealOrder: CandidateId[]
  matchChecksUsed: number
  timerStartedAt: number | null
  timerExpired: boolean
  finalPickId: CandidateId | null
  score: ScoreBreakdown | null
  startedAt: number | null
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_NAME'; name: string; avatarId: number }
  | { type: 'VIEW_ORG_CHART' }
  | { type: 'START_SEARCHING' }
  | { type: 'REVEAL_FIT'; id: CandidateId; fit: number }
  | { type: 'READY_TO_DECIDE'; id: CandidateId }
  | { type: 'TIME_UP'; id: CandidateId | null }
  | { type: 'CONFIRM_FINAL'; id: CandidateId }
  | { type: 'COMPUTE_SCORE' }
  | { type: 'SHOW_RESULT' }
  | { type: 'SHOW_LEADERBOARD' }
  | { type: 'SHOW_LEAD_CAPTURE' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
