export type CandidateId =
  | 'andi' | 'rani' | 'maya' | 'fajar' | 'dimas'
  | 'bintang' | 'sari' | 'rizky' | 'putri'
  | 'nadia' | 'kevin' | 'dewi' | 'aryo' | 'liana'

export type Phase =
  | { name: 'intro' }
  | { name: 'leadCapture' }
  | { name: 'exploring' }
  | { name: 'result' }
  | { name: 'kelolaReveal' }
  | { name: 'finished' }

export interface ScoreBreakdown {
  overallFit: number
  total: number
  persona: Persona
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
  playerEmail: string
  playerCompany: string
  finalPickId: CandidateId | null
  score: ScoreBreakdown | null
  startedAt: number | null
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'CONFIRM_EXPLORE'; finalPickId: CandidateId; overallFit: number }
  | { type: 'SHOW_KELOLA_REVEAL' }
  | { type: 'SUBMIT_LEAD_INFO'; name: string; email: string; company: string }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
