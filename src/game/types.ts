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

export interface PlacementEntry {
  posId: string
  candidateId: CandidateId
  dayFilled: number
  vacancyAge: number  // days position was vacant before being filled
}

export interface TimeFillData {
  currentDay: number
  placements: PlacementEntry[]
  avgTTF: number       // average days to fill
  totalDays: number    // total simulated days elapsed
}

export interface ScoreBreakdown {
  overallFit: number
  hiringSpeed: number
  total: number        // Talent Decision Score = 70% orgFit + 30% hiringSpeed
  persona: Persona
  timeFill: TimeFillData
}

export type Persona =
  | 'TALENT STRATEGIST'
  | 'QUALITY ARCHITECT'
  | 'RAPID RECRUITER'
  | 'TALENT EXPLORER'

export interface GameState {
  phase: Phase
  sessionId: string
  playerName: string
  playerEmail: string
  playerCompany: string
  finalPickId: CandidateId | null
  score: ScoreBreakdown | null
  startedAt: number | null
  nameMap: Record<string, string>
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'CONFIRM_EXPLORE'; finalPickId: CandidateId; overallFit: number; timeFill: TimeFillData }
  | { type: 'SHOW_KELOLA_REVEAL' }
  | { type: 'SUBMIT_LEAD_INFO'; name: string; email: string; company: string }
  | { type: 'FINISH' }
  | { type: 'RESTART' }
  | { type: 'SKIP_TO_REVEAL'; name: string; email: string; company: string }
