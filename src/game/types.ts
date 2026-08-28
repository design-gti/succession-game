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
  | { name: 'kelolaReveal' }
  | { name: 'demoQR' }
  | { name: 'leaderboard' }
  | { name: 'leadCapture' }
  | { name: 'finished' }

export interface ScoreBreakdown {
  fitnessPoints: number   // 0-80, from overall team fit
  speedPoints: number     // 0-20, from time remaining
  overallFit: number      // raw team fitness %
  timeLeft: number        // seconds remaining when confirmed
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
  playerAvatar: number
  timerStartedAt: number | null
  timerExpired: boolean
  finalPickId: CandidateId | null
  score: ScoreBreakdown | null
  startedAt: number | null
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_NAME'; name: string; avatarId: number; email: string; company: string }
  | { type: 'VIEW_ORG_CHART' }
  | { type: 'START_SEARCHING' }
  | { type: 'CONFIRM_EXPLORE'; finalPickId: CandidateId; overallFit: number; timeLeft: number }
  | { type: 'TIME_UP'; finalPickId: CandidateId | null; overallFit: number }
  | { type: 'CONFIRM_FINAL'; id: CandidateId }
  | { type: 'SHOW_RESULT' }
  | { type: 'SHOW_KELOLA_REVEAL' }
  | { type: 'SHOW_DEMO_QR' }
  | { type: 'SHOW_LEADERBOARD' }
  | { type: 'SHOW_LEAD_CAPTURE' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
