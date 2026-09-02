import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { Avatar } from '../components/Avatar'
import { getCandidateById } from '../data/scenario'
import type { Persona } from '../game/types'

// ── Inline SVG icons ────────────────────────────────────────────────────────
function IconTarget({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IconLightning({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}
function IconShield({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconCompass({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} stroke="none" />
    </svg>
  )
}
function IconStar({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconCheck({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconBuilding({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 22V12h6v10" /><path d="M9 7h1m5 0h1M9 11h1m5 0h1" />
    </svg>
  )
}
function IconLink({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
function IconCalendar({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// ── Persona icon per type ────────────────────────────────────────────────────
function PersonaIcon({ persona, size = 22, color = 'currentColor' }: { persona: Persona; size?: number; color?: string }) {
  if (persona === 'TALENT STRATEGIST') return <IconTarget size={size} color={color} />
  if (persona === 'QUALITY ARCHITECT') return <IconShield size={size} color={color} />
  if (persona === 'RAPID RECRUITER')   return <IconLightning size={size} color={color} />
  return <IconCompass size={size} color={color} />
}

const PERSONA_CONFIG: Record<Persona, {
  subtitle: string
  color: string
  accentColor: string
  qualityLabel: string
  speedLabel: string
  description: string
  qualityHigh: boolean
  speedHigh: boolean
}> = {
  'TALENT STRATEGIST': {
    subtitle: 'Kualitas tinggi, proses efisien.',
    color: '#1D6FF2',
    accentColor: '#60a5fa',
    qualityLabel: 'Kualitas Tinggi',
    speedLabel: 'Kecepatan Tinggi',
    description: 'Kamu memilih kandidat yang kuat tanpa membuang waktu. Kombinasi langka dari ketajaman penilaian dan efisiensi.',
    qualityHigh: true,
    speedHigh: true,
  },
  'QUALITY ARCHITECT': {
    subtitle: 'Kualitas adalah prioritas utama.',
    color: '#16a34a',
    accentColor: '#4ade80',
    qualityLabel: 'Kualitas Tinggi',
    speedLabel: 'Kecepatan Rendah',
    description: 'Kamu sangat selektif. Pilihan yang solid — tapi posisi kosong cukup lama. Pertimbangkan dampak jangka pendeknya.',
    qualityHigh: true,
    speedHigh: false,
  },
  'RAPID RECRUITER': {
    subtitle: 'Cepat, tapi kualitas bisa dikuatkan.',
    color: '#d97706',
    accentColor: '#fbbf24',
    qualityLabel: 'Kualitas Sedang',
    speedLabel: 'Kecepatan Tinggi',
    description: 'Kamu bergerak cepat mengisi posisi. Efisien di operasional, tapi ada ruang untuk meningkatkan kualitas keputusan.',
    qualityHigh: false,
    speedHigh: true,
  },
  'TALENT EXPLORER': {
    subtitle: 'Masih menemukan gaya decision-making kamu.',
    color: '#6366f1',
    accentColor: '#a5b4fc',
    qualityLabel: 'Kualitas Sedang',
    speedLabel: 'Kecepatan Sedang',
    description: 'Ada potensi yang besar. Dengan data yang lebih sistematis, kamu bisa membuat keputusan yang lebih tajam dan lebih cepat.',
    qualityHigh: false,
    speedHigh: false,
  },
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// Radial ring SVG
function ScoreRing({ value, color, size = 160 }: { value: number; color: string; size?: number }) {
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
      {/* track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      {/* progress */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  )
}

// Floating bubble particle
function Bubble({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: '50%',
        background: color, pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0.6, 0], scale: [0.4, 1, 1.1, 0.9], y: [0, -24, -48] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: Math.random() * 2 + 1 }}
    />
  )
}

// Confetti dot
function Confetti({ x, delay, color }: { x: string; delay: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, top: '30%',
        width: 5, height: 5, borderRadius: 2,
        background: color, pointerEvents: 'none',
      }}
      initial={{ opacity: 0, y: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -80, -160], rotate: [0, 180, 360] }}
      transition={{ duration: 2, delay, ease: 'easeOut' }}
    />
  )
}

const CONFETTI_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#38bdf8']
const BUBBLE_COLORS = [
  'rgba(96,165,250,0.18)', 'rgba(167,139,250,0.14)',
  'rgba(52,211,153,0.10)', 'rgba(251,191,36,0.10)',
]

export function ResultScreen() {
  const { state, actions } = useGame()
  const score = state.score!
  const finalPick = state.finalPickId ? getCandidateById(state.finalPickId) : null
  const finalPickDisplayName = state.finalPickId ? (state.nameMap[state.finalPickId] || finalPick?.name || '') : ''
  const persona = PERSONA_CONFIG[score.persona] ?? PERSONA_CONFIG['TALENT EXPLORER']

  const [scoreStarted, setScoreStarted] = useState(false)
  const [phase, setPhase] = useState<'score' | 'stats' | 'achievement' | 'cards' | 'cta'>('score')
  const animCount = useCountUp(score.total, 1600, scoreStarted)
  const hasSentRef = useRef(false)

  useEffect(() => {
    if (hasSentRef.current) return
    hasSentRef.current = true

    const ttf = score.timeFill
    if (!ttf) return  // skip save for replayed sessions (email dedup)
    fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId:    state.sessionId,
        playerName:   state.playerName,
        playerEmail:  state.playerEmail,
        playerCompany: state.playerCompany,
        startedAt:    state.startedAt,
        finalPickId:  state.finalPickId,
        overallFit:   score.overallFit,
        hiringSpeed:  score.hiringSpeed,
        total:        score.total,
        persona:      score.persona,
        avgTTF:       ttf.avgTTF,
        currentDay:   ttf.currentDay,
        placements:   ttf.placements,
      }),
    })
      .then(res => res.json().then(body => console.log('[save-session]', res.status, body)))
      .catch(err => console.error('[save-session] fetch failed:', err))
  }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setScoreStarted(true), 200),
      setTimeout(() => setPhase('stats'), 1800),
      setTimeout(() => setPhase('achievement'), 2600),
      setTimeout(() => setPhase('cards'), 3400),
      setTimeout(() => setPhase('cta'), 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const ttf = score.timeFill ?? null
  const bestFit = finalPick?.roleFit ?? score.overallFit

  const showStats = ['stats','achievement','cards','cta'].includes(phase)
  const showAchievement = ['achievement','cards','cta'].includes(phase)
  const showCards = ['cards','cta'].includes(phase)
  const showCta = phase === 'cta'

  const confettiItems = Array.from({ length: 14 }, (_, i) => ({
    x: `${8 + i * 6.5}%`,
    delay: 0.1 + i * 0.07,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))

  const bubbleItems = [
    { x: '5%',  y: '10%', size: 28, delay: 0,   color: BUBBLE_COLORS[0] },
    { x: '80%', y: '8%',  size: 20, delay: 0.5, color: BUBBLE_COLORS[1] },
    { x: '15%', y: '55%', size: 16, delay: 1.2, color: BUBBLE_COLORS[2] },
    { x: '85%', y: '45%', size: 22, delay: 0.8, color: BUBBLE_COLORS[3] },
    { x: '70%', y: '70%', size: 14, delay: 1.5, color: BUBBLE_COLORS[0] },
    { x: '8%',  y: '78%', size: 18, delay: 0.3, color: BUBBLE_COLORS[1] },
  ]

  return (
    <div
      className="relative flex flex-col h-full overflow-y-auto scrollable"
      style={{
        background: 'linear-gradient(160deg, #eef4ff 0%, #f5f0ff 40%, #f0f9ff 100%)',
      }}
    >
      {/* Dot grid overlay */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(29,111,242,0.10) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Floating bubbles */}
      {bubbleItems.map((b, i) => <Bubble key={i} {...b} />)}

      {/* Confetti burst */}
      {confettiItems.map((c, i) => <Confetti key={i} {...c} />)}

      {/* Hero glow blob */}
      <div style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, ${persona.color}22 0%, transparent 70%)`,
      }} />

      <div className="relative z-10 flex flex-col items-center px-4 pb-8 gap-4 pt-6">

        {/* ── 1. HERO SCORE ── */}
        <div className="flex flex-col items-center gap-1">
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 9, letterSpacing: '0.22em', color: persona.color, fontWeight: 800, textTransform: 'uppercase' }}
          >
            Talent Decision Score
          </motion.p>

          {/* Ring + score */}
          <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                background: `radial-gradient(circle, ${persona.color}28 0%, transparent 72%)`,
              }}
            />
            <ScoreRing value={score.total} color={persona.color} size={160} />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}
            >
              <span style={{ fontSize: 52, fontWeight: 900, color: persona.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {animCount}
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: persona.color, marginTop: -2 }}>%</span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showStats ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}
          >
            70% Org Fit · 30% Hiring Speed
          </motion.p>
        </div>

        {/* ── 2. STAT TILES ── */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 w-full"
            >
              {/* Org Fit tile */}
              <div style={{
                flex: 1, borderRadius: 18,
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #bfdbfe',
                padding: '14px 12px',
                boxShadow: '0 4px 20px rgba(29,111,242,0.10)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ lineHeight: 1 }}><IconTarget size={18} color="#1D6FF2" /></div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#1D6FF2', lineHeight: 1 }}>{score.overallFit}%</div>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3b82f6', textAlign: 'center', lineHeight: 1.3 }}>Organization{'\n'}Fit</div>
                <div style={{
                  marginTop: 2, fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: '#1D6FF2', color: 'white', borderRadius: 20, padding: '2px 8px',
                }}>
                  {score.overallFit >= 80 ? 'Excellent Fit' : score.overallFit >= 60 ? 'Good Fit' : 'Needs Work'}
                </div>
              </div>

              {/* Hiring Speed tile */}
              <div style={{
                flex: 1, borderRadius: 18,
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1.5px solid #c4b5fd',
                padding: '14px 12px',
                boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ lineHeight: 1 }}><IconLightning size={18} color="#6366f1" /></div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{score.hiringSpeed}%</div>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8b5cf6', textAlign: 'center', lineHeight: 1.3 }}>Hiring{'\n'}Speed</div>
                <div style={{
                  marginTop: 2, fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: '#6366f1', color: 'white', borderRadius: 20, padding: '2px 8px',
                }}>
                  {score.hiringSpeed >= 90 ? 'Perfect Speed' : score.hiringSpeed >= 70 ? 'Fast' : 'Could Be Faster'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3. ACHIEVEMENT CARD ── */}
        <AnimatePresence>
          {showAchievement && (
            <motion.div
              key="achievement"
              initial={{ scale: 0.82, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ width: '100%' }}
            >
              <div style={{
                borderRadius: 20, padding: '18px 16px',
                background: `linear-gradient(135deg, ${persona.color}12 0%, ${persona.accentColor}08 100%)`,
                border: `2px solid ${persona.color}30`,
                boxShadow: `0 8px 32px ${persona.color}18, 0 2px 8px rgba(0,0,0,0.06)`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Corner shimmer */}
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                  borderRadius: '50%', background: `${persona.color}14`, pointerEvents: 'none',
                }} />

                {/* Achievement unlocked label */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: `${persona.color}18`, borderRadius: 20,
                  padding: '3px 10px', marginBottom: 10,
                }}>
                  <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: persona.color }}>
                    Achievement Unlocked
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                    background: `${persona.color}15`,
                    border: `2px solid ${persona.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PersonaIcon persona={score.persona} size={22} color={persona.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 18, fontWeight: 900, textTransform: 'uppercase',
                      letterSpacing: '0.04em', color: persona.color, lineHeight: 1.1,
                    }}>
                      {score.persona}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontStyle: 'italic' }}>
                      {persona.subtitle}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                        background: `${persona.color}18`, color: persona.color,
                        borderRadius: 20, padding: '3px 9px', border: `1px solid ${persona.color}25`,
                      }}>
                        {persona.qualityLabel}
                      </span>
                      <span style={{
                        fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                        background: `${persona.color}18`, color: persona.color,
                        borderRadius: 20, padding: '3px 9px', border: `1px solid ${persona.color}25`,
                      }}>
                        {persona.speedLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 10, color: '#64748b', marginTop: 10, lineHeight: 1.6 }}>
                  {persona.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4. BEST MOVE CARD ── */}
        <AnimatePresence>
          {showCards && finalPick && (
            <motion.div
              key="bestmove"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <div style={{
                borderRadius: 18, padding: '14px 14px',
                background: 'white',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'visible',
              }}>
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em',
                    color: '#f59e0b', background: '#fef3c7', borderRadius: 20, padding: '2px 8px',
                  }}>
                    <IconStar size={10} color="#f59e0b" /> Best Placement
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar — slightly oversized */}
                  <div style={{ position: 'relative', flexShrink: 0, marginTop: -4 }}>
                    <Avatar id={state.finalPickId!} name={finalPickDisplayName} size="md"
                      ringColor={finalPick.source === 'external' ? '#f59e0b' : undefined} />
                    {finalPick.source === 'external' && (
                      <div style={{
                        position: 'absolute', bottom: -3, right: -3, width: 14, height: 14,
                        borderRadius: '50%', background: '#f59e0b', border: '2px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'white', fontWeight: 900,
                      }}>E</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                      {finalPickDisplayName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500 }}>{finalPick.currentRole}</span>
                      <span style={{ fontSize: 9, color: '#cbd5e1' }}>→</span>
                      <span style={{ fontSize: 9, color: '#475569', fontWeight: 700 }}>Sales Manager</span>
                    </div>
                  </div>

                  {/* Role fit badge */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    borderRadius: 12, padding: '6px 10px', border: '1px solid #bfdbfe', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#1D6FF2', lineHeight: 1 }}>{bestFit}%</span>
                    <span style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3b82f6' }}>Role Fit</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 5. CTA ── */}
        <AnimatePresence>
          {showCta && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <span style={{
                  fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
                  color: '#94a3b8',
                }}>
                  Next Chapter
                </span>
              </div>

              <button
                onClick={() => actions.showKelolaReveal()}
                style={{
                  width: '100%', padding: '15px 24px', borderRadius: 16,
                  background: `linear-gradient(135deg, #1D6FF2 0%, #6366f1 100%)`,
                  color: 'white', fontWeight: 900, fontSize: 15,
                  border: 'none', cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 8px 28px rgba(29,111,242,0.32), 0 2px 8px rgba(99,102,241,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  style={{
                    position: 'absolute', top: 0, left: '-100%', bottom: 0, width: '60%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                    pointerEvents: 'none',
                  }}
                  animate={{ left: ['−100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'linear' }}
                />
                <span>Lihat Plot Twist</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 16 }}
                >
                  →
                </motion.span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
