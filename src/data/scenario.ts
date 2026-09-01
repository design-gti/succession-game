import type { CandidateId } from '../game/types'

export interface Assessment {
  leadership: number
  drive: number
  influence: number
}

export type Readiness = 'now' | '6mo' | '1yr' | '2yr'
export type Gender = 'male' | 'female'
export type NameMap = Record<string, string>

export interface Candidate {
  id: CandidateId
  name: string          // canonical fallback; use nameMap for display
  gender: Gender
  currentRole: string
  source: 'internal' | 'external'
  tenureInCompany: string
  totalExperience: string
  highlights: [string, string, string]
  tradeoff: string
  assessment: Assessment
  roleFit: number       // fit for the Sales Manager vacancy
  naturalFit?: number   // fit in their own natural role (internal only)
  fitMessage: string
  readiness: Readiness  // readiness to take the Sales Manager vacancy now
  quote: string         // one-line peer/manager impression — may contrast with data
}

// ─── Name pools ───────────────────────────────────────────────────────────────

const MALE_NAMES = [
  'Andi', 'Bagas', 'Doni', 'Eko', 'Fariz',
  'Galih', 'Hendra', 'Ilham', 'Joko', 'Kevin',
  'Lukman', 'Miko', 'Nando', 'Omar', 'Prasetyo',
  'Rizal', 'Sigit', 'Taufik', 'Wahyu', 'Yudi',
]

const FEMALE_NAMES = [
  'Ayu', 'Citra', 'Desi', 'Fitri', 'Indah',
  'Kirana', 'Lestari', 'Melisa', 'Nita', 'Putri',
  'Ratna', 'Rina', 'Sari', 'Tiara', 'Wulan',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// reza = org-only node (commercial director), not a CandidateId but needs a name
const REZA_ID = 'reza'

export function generateNameMap(): NameMap {
  const maleIds = [REZA_ID, ...CANDIDATES.filter(c => c.gender === 'male').map(c => c.id)]
  const femaleIds = CANDIDATES.filter(c => c.gender === 'female').map(c => c.id)

  const malePool = shuffle(MALE_NAMES)
  const femalePool = shuffle(FEMALE_NAMES)

  const map: NameMap = {}
  maleIds.forEach((id, i) => { map[id] = malePool[i % malePool.length] })
  femaleIds.forEach((id, i) => { map[id] = femalePool[i % femalePool.length] })

  return map
}

export interface OrgNode {
  id: string
  name: string
  role: string
  isVacant?: boolean
  reportsTo: string | null
  candidateId?: CandidateId
}

export const RESIGNED_PERSON = {
  name: 'Budi',
  role: 'Sales Manager',
}

export const VACANCY_POSITION = 'Sales Manager'

export const JOB_NEEDS: string[] = [
  'Mengarahkan tim mencapai target penjualan',
  'Membuka dan mengembangkan peluang bisnis',
  'Mengambil keputusan dengan cepat',
  'Membangun hubungan dengan berbagai pihak',
  'Tetap konsisten saat menghadapi tekanan',
]

// Org chart: 1 atasan, vacancy + 2 peers, 3 direct reports (GDD §37)
export const ORG_NODES: OrgNode[] = [
  { id: 'commercial-dir', name: 'Reza Santoso', role: 'Commercial Director', reportsTo: null },
  { id: 'sales-mgr', name: '', role: 'Sales Manager', isVacant: true, reportsTo: 'commercial-dir' },
  { id: 'cs-mgr', name: 'Maya', role: 'Customer Success Manager', reportsTo: 'commercial-dir', candidateId: 'maya' },
  { id: 'mkt-mgr', name: 'Dimas', role: 'Marketing Manager', reportsTo: 'commercial-dir', candidateId: 'dimas' },
  { id: 'andi', name: 'Andi', role: 'Senior Account Executive', reportsTo: 'sales-mgr', candidateId: 'andi' },
  { id: 'rani', name: 'Rani', role: 'Account Executive', reportsTo: 'sales-mgr', candidateId: 'rani' },
  { id: 'fajar', name: 'Fajar', role: 'BD Executive', reportsTo: 'sales-mgr', candidateId: 'fajar' },
]

// Full candidate data (GDD §24, §12)
export const CANDIDATES: Candidate[] = [
  {
    id: 'andi',
    name: 'Andi Pratama',
    gender: 'male' as Gender,
    currentRole: 'Senior Account Executive',
    source: 'internal',
    tenureInCompany: '3 years in company',
    totalExperience: '5 years total experience',
    highlights: [
      'Consistently exceeds individual sales target',
      'Senior member of the sales team',
      'Frequently handles major accounts',
    ],
    tradeoff: 'Strong individual performance, but the role requires stronger people leadership and collaboration.',
    assessment: { leadership: 62, drive: 91, influence: 86 },
    roleFit: 74,
    naturalFit: 88,
    fitMessage: 'Strong individual performance, but the role requires stronger people leadership and collaboration.',
    readiness: '6mo',
    quote: 'Orangnya rajin dan sudah hafal semua klien besar, sales terbaik di tim.',
  },
  {
    id: 'rani',
    name: 'Rani',
    gender: 'female' as Gender,
    currentRole: 'Account Executive',
    source: 'internal',
    tenureInCompany: '2 years in company',
    totalExperience: '3 years total experience',
    highlights: [
      'High potential based on assessment profile',
      'Strong leadership and collaboration scores',
      'Exceeds targets consistently',
    ],
    tradeoff: 'Moderate experience, but her behavioral profile aligns strongly with what the role demands.',
    assessment: { leadership: 86, drive: 82, influence: 84 },
    roleFit: 86,
    naturalFit: 90,
    fitMessage: 'Strong fit profile. High leadership, resilience, and collaboration — but experience is still building.',
    readiness: '6mo',
    quote: 'Masih junior, tapi anehnya tim sering dengerin dia duluan kalau ada masalah.',
  },
  {
    id: 'maya',
    name: 'Maya',
    gender: 'female' as Gender,
    currentRole: 'Customer Success Manager',
    source: 'internal',
    tenureInCompany: '4 years in company',
    totalExperience: '6 years total experience',
    highlights: [
      'Experienced people manager',
      'Exceptional team collaboration',
      'Strong stakeholder relationships',
    ],
    tradeoff: 'Excellent people skills, but limited direct sales hunting orientation for this role.',
    assessment: { leadership: 90, drive: 68, influence: 82 },
    roleFit: 81,
    naturalFit: 91,
    fitMessage: 'Strong manager profile, but the Sales Manager role requires higher drive and new-business orientation.',
    readiness: 'now',
    quote: 'Kalau ada konflik di tim, dia yang paling diandalkan. Semua orang nyaman kerja sama dia.',
  },
  {
    id: 'fajar',
    name: 'Fajar',
    gender: 'male' as Gender,
    currentRole: 'Business Development Executive',
    source: 'internal',
    tenureInCompany: '2 years in company',
    totalExperience: '3 years total experience',
    highlights: [
      'Active in new business prospecting',
      'High energy and initiative',
      'Growing track record in BD',
    ],
    tradeoff: 'Good potential but still building leadership capability and strategic decision-making.',
    assessment: { leadership: 72, drive: 85, influence: 78 },
    roleFit: 70,
    naturalFit: 82,
    fitMessage: 'High drive and initiative, but leadership and collaboration need development for a management role.',
    readiness: '1yr',
    quote: 'Selalu yang paling duluan kalau ada peluang baru, energinya nular ke semua orang.',
  },
  {
    id: 'dimas',
    name: 'Dimas',
    gender: 'male' as Gender,
    currentRole: 'Marketing Manager',
    source: 'internal',
    tenureInCompany: '4 years in company',
    totalExperience: '5 years total experience',
    highlights: [
      'Strong brand and audience understanding',
      'Cross-functional project experience',
      'Good communication skills',
    ],
    tradeoff: 'Marketing background limits direct sales experience; drive toward revenue targets is below role expectations.',
    assessment: { leadership: 68, drive: 70, influence: 75 },
    roleFit: 65,
    naturalFit: 85,
    fitMessage: 'Different functional background limits direct relevance. Drive and influence for a sales role are below threshold.',
    readiness: '1yr',
    quote: 'Presentasinya selalu meyakinkan — klien dan internal sama-sama respek sama dia.',
  },
  {
    id: 'bintang',
    name: 'Bintang',
    gender: 'male' as Gender,
    currentRole: 'CS Representative',
    source: 'internal',
    tenureInCompany: '1.5 years in company',
    totalExperience: '2 years total experience',
    highlights: [
      'Strong customer relationship skills',
      'High collaboration and teamwork',
      'Consistent satisfaction scores',
    ],
    tradeoff: 'Early in career — leadership and commercial drive below the level needed for Sales Manager.',
    assessment: { leadership: 65, drive: 72, influence: 68 },
    roleFit: 62,
    naturalFit: 80,
    fitMessage: 'Good team player, but lacks leadership depth and sales orientation for a manager role.',
    readiness: '2yr',
    quote: 'Customer paling suka dihubungi dia, komunikasinya enak dan sabar banget.',
  },
  {
    id: 'sari',
    name: 'Sari',
    gender: 'female' as Gender,
    currentRole: 'CS Specialist',
    source: 'internal',
    tenureInCompany: '2 years in company',
    totalExperience: '3 years total experience',
    highlights: [
      'Detail-oriented and process-driven',
      'Strong in collaboration and service delivery',
      'Improving account management skills',
    ],
    tradeoff: 'Analytical strength, but leadership and revenue-drive scores are below threshold for this role.',
    assessment: { leadership: 58, drive: 65, influence: 60 },
    roleFit: 58,
    naturalFit: 82,
    fitMessage: 'Strong in collaboration but leadership and drive fall below the Sales Manager threshold.',
    readiness: '2yr',
    quote: 'Prosesnya paling rapi di tim — SOP dan dokumen dia yang bikin, semua bergantung padanya.',
  },
  {
    id: 'rizky',
    name: 'Rizky',
    gender: 'male' as Gender,
    currentRole: 'Marketing Specialist',
    source: 'internal',
    tenureInCompany: '2 years in company',
    totalExperience: '3 years total experience',
    highlights: [
      'Strong brand and campaign execution',
      'Good cross-functional communication',
      'Growing understanding of customer journeys',
    ],
    tradeoff: 'Marketing orientation limits direct sales fit. Leadership and drive need development.',
    assessment: { leadership: 60, drive: 68, influence: 72 },
    roleFit: 55,
    naturalFit: 79,
    fitMessage: 'Marketing background limits commercial fit. Leadership and sales drive need significant development.',
    readiness: '2yr',
    quote: 'Campaign terakhirnya viral — orang-orang di luar perusahaan pun notice.',
  },
  {
    id: 'putri',
    name: 'Putri',
    gender: 'female' as Gender,
    currentRole: 'Content Creator',
    source: 'internal',
    tenureInCompany: '1 year in company',
    totalExperience: '2 years total experience',
    highlights: [
      'Strong storytelling and communication',
      'Creative thinker with audience empathy',
      'Collaborative and supportive team member',
    ],
    tradeoff: 'Content specialist with limited commercial exposure — too early for a senior manager role.',
    assessment: { leadership: 52, drive: 58, influence: 62 },
    roleFit: 50,
    naturalFit: 77,
    fitMessage: 'Creative strength but limited sales orientation. Too early in career for a management role.',
    readiness: '2yr',
    quote: 'Kontennya sering jadi benchmark tim — kreatif, relatable, dan selalu on-brand.',
  },
  {
    id: 'dewi',
    name: 'Dewi Santika',
    gender: 'female' as Gender,
    currentRole: 'Regional Sales Lead',
    source: 'external',
    tenureInCompany: '',
    totalExperience: '7 years experience',
    highlights: [
      'Managed regional sales team of 12 reps',
      'Exceeded revenue targets 4 years running',
      'Strong coaching and people development record',
    ],
    tradeoff: 'Excellent leadership track, but from a different industry vertical — will need context ramp.',
    assessment: { leadership: 88, drive: 85, influence: 86 },
    roleFit: 87,
    fitMessage: 'Strong sales leadership profile. People development skills are a standout for a manager role.',
    readiness: 'now',
    quote: 'Mantan atasannya bilang: "Kalau dia pergi, target regional ikut turun."',
  },
  {
    id: 'aryo',
    name: 'Aryo Baskara',
    gender: 'male' as Gender,
    currentRole: 'Senior Sales Manager',
    source: 'external',
    tenureInCompany: '',
    totalExperience: '5 years experience',
    highlights: [
      'Led B2B sales team at mid-size tech firm',
      'Strong pipeline management discipline',
      'Experienced in target-setting and performance reviews',
    ],
    tradeoff: 'Solid commercial background, but collaboration and stakeholder influence scores are moderate.',
    assessment: { leadership: 80, drive: 88, influence: 74 },
    roleFit: 79,
    fitMessage: 'Good sales pedigree and drive, but lower influence and collaboration scores than ideal for this role.',
    readiness: 'now',
    quote: 'Pipeline-nya selalu rapi dan terukur, tipe yang jarang minta tolong tapi hasilnya ada.',
  },
  {
    id: 'liana',
    name: 'Liana Mochtar',
    gender: 'female' as Gender,
    currentRole: 'Account Director',
    source: 'external',
    tenureInCompany: '',
    totalExperience: '6 years experience',
    highlights: [
      'Managed key enterprise accounts worth $2M+ ARR',
      'Strong negotiation and client relationship skills',
      'Cross-functional project leadership experience',
    ],
    tradeoff: 'High influence and collaboration, but limited team management experience.',
    assessment: { leadership: 74, drive: 80, influence: 89 },
    roleFit: 76,
    fitMessage: 'Exceptional relationship skills but limited direct people management experience for this role.',
    readiness: '6mo',
    quote: 'Klien enterprise-nya loyal banget — katanya bukan karena produknya, tapi karena dia.',
  },
  {
    id: 'nadia',
    name: 'Nadia Putri',
    gender: 'female' as Gender,
    currentRole: 'Sales Supervisor',
    source: 'external',
    tenureInCompany: '',
    totalExperience: '5 years experience',
    highlights: [
      'Leads a small sales team with consistent results',
      'Strong new-business acquisition experience',
      'Proven performance against ambitious targets',
    ],
    tradeoff: 'External candidate — will need time to adapt to organizational culture.',
    assessment: { leadership: 91, drive: 93, influence: 90 },
    roleFit: 92,
    fitMessage: 'Strongest overall match. High across all critical dimensions for this Sales Manager role.',
    readiness: 'now',
    quote: 'Tim lamanya kompak banget — bahkan yang sudah resign pun masih minta advice ke dia.',
  },
  {
    id: 'kevin',
    name: 'Kevin Tan',
    gender: 'male' as Gender,
    currentRole: 'Business Development Manager',
    source: 'external',
    tenureInCompany: '',
    totalExperience: '6 years experience',
    highlights: [
      'Strong enterprise network and relationships',
      'Experienced in market expansion initiatives',
      'Has managed strategic accounts at scale',
    ],
    tradeoff: 'Lower collaboration fit — may prefer independent work over team development.',
    assessment: { leadership: 78, drive: 89, influence: 92 },
    roleFit: 82,
    fitMessage: 'Strong commercial capability and influence, but collaboration score below threshold for a people-manager role.',
    readiness: 'now',
    quote: 'Networknya luas banget — kayaknya dia kenal semua orang penting di industri ini.',
  },
]

export const BEST_CANDIDATE_ID: CandidateId = 'nadia'

export function getCandidateById(id: CandidateId): Candidate {
  const c = CANDIDATES.find(c => c.id === id)
  if (!c) throw new Error(`Candidate not found: ${id}`)
  return c
}

export const INTERNAL_CANDIDATES = CANDIDATES.filter(c => c.source === 'internal')
export const EXTERNAL_CANDIDATES = CANDIDATES.filter(c => c.source === 'external')

// Avatar color map for visual variety
export const AVATAR_COLORS: Record<CandidateId | string, string> = {
  andi:  '#1D6FF2',
  rani:  '#7C3AED',
  maya:  '#059669',
  fajar: '#D97706',
  dimas: '#DC2626',
  bintang: '#0D9488',
  sari:    '#DB2777',
  rizky:   '#EA580C',
  putri:   '#65A30D',
  nadia:   '#0891B2',
  kevin:   '#6D28D9',
  dewi:    '#BE185D',
  aryo:    '#0369A1',
  liana:   '#7C2D12',
}
