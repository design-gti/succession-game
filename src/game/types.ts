export type CandidateId =
  | 'andi' | 'rani' | 'maya' | 'fajar' | 'dimas'
  | 'bintang' | 'sari' | 'rizky' | 'putri'
  | 'nadia' | 'kevin' | 'dewi' | 'aryo' | 'liana'

export type Phase =
  | { name: 'intro' }
  | { name: 'exploring' }
  | { name: 'finalReveal' }
  | { name: 'result' }
  | { name: 'kelolaReveal' }
  | { name: 'demoQR' }
  | { name: 'leadCapture' }
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
  | { type: 'SHOW_RESULT' }
  | { type: 'SHOW_KELOLA_REVEAL' }
  | { type: 'SHOW_DEMO_QR' }
  | { type: 'SHOW_LEAD_CAPTURE' }
  | { type: 'SUBMIT_LEAD_INFO'; name: string; email: string; company: string }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
