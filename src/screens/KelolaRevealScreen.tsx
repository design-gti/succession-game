import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

// ─── Mini-mockups (larger, standalone versions) ───────────────────────────────

function MiniVisibilityMap() {
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <div className="w-16 h-9 rounded-[5px] bg-white/15 border border-white/20" />
      <div className="w-px h-4 bg-white/20" />
      <div className="relative flex gap-3">
        <div className="absolute -top-[6px] left-6 right-6 h-px bg-white/20" />
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-white/20" />
          <div className="w-14 h-9 rounded-[5px] bg-green-500/25 border border-green-400/40" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-white/20" />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-14 h-9 rounded-[5px] bg-red-500/20 border border-dashed border-red-400/70 flex items-center justify-center"
          >
            <span className="text-red-400 text-xs font-black">VACANT</span>
          </motion.div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-white/20" />
          <div className="w-14 h-9 rounded-[5px] bg-amber-500/25 border border-amber-400/40" />
        </div>
      </div>
    </div>
  )
}

function MiniTDP() {
  const cards = [
    { score: 92, top: true, name: 'Nadia' },
    { score: 80, top: false, name: 'Rani' },
    { score: 68, top: false, name: 'Kevin' },
  ]
  return (
    <div className="flex items-end gap-3">
      {cards.map(({ score, top, name }, i) => (
        <div
          key={i}
          className={`w-[72px] rounded-[8px] border overflow-hidden ${top ? 'border-brand bg-brand/15' : 'border-white/15 bg-white/5'}`}
        >
          <div className={`h-10 flex items-center justify-center ${top ? 'bg-brand/20' : 'bg-white/5'}`}>
            <div className={`w-7 h-7 rounded-full ${top ? 'bg-brand' : 'bg-white/20'} flex items-center justify-center`}>
              <span className={`text-[9px] font-black ${top ? 'text-white' : 'text-white/50'}`}>{name[0]}</span>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <p className={`text-xs font-bold ${top ? 'text-white' : 'text-white/50'} truncate`}>{name}</p>
            <p className={`text-sm font-black ${top ? 'text-brand' : 'text-white/35'}`}>{score}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniIProfile() {
  const bars = [
    { label: 'LEAD', val: 82 },
    { label: 'DRIVE', val: 68 },
    { label: 'INFL', val: 90 },
    { label: 'RESIL', val: 74 },
    { label: 'COLLAB', val: 60 },
  ]
  return (
    <div className="w-[200px] rounded-[10px] border border-white/15 bg-white/5 px-4 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-brand/60 flex-shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-white font-black">N</span>
        </div>
        <div>
          <p className="text-white/80 text-xs font-bold leading-none">Nadia P.</p>
          <p className="text-white/35 text-[9px] mt-0.5">Sales Supervisor</p>
        </div>
      </div>
      {bars.map(({ label, val }, i) => (
        <div key={i} className="flex items-center gap-2">
          <p className="text-white/35 text-[8px] w-10 text-right flex-shrink-0">{label}</p>
          <div className="flex-1 h-[5px] rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${val}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="h-full rounded-full bg-brand"
            />
          </div>
          <p className="text-brand text-[9px] font-black w-6 flex-shrink-0">{val}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Beat content ─────────────────────────────────────────────────────────────

const REVEALS = [
  {
    inGame: 'The org chart with a vacant seat',
    module: 'Visibility Map',
    inKelola: 'Your real org structure with a succession-risk heatmap. Vulnerable positions surface themselves.',
    mockup: <MiniVisibilityMap />,
  },
  {
    inGame: 'Comparing candidates by fit score',
    module: 'Talent Decision Platform',
    inKelola: 'Side-by-side candidate comparison with real assessment data. Compare first, then decide.',
    mockup: <MiniTDP />,
  },
  {
    inGame: 'The 5 aspect bars on every card',
    module: 'iProfile',
    inKelola: 'A 20-page assessment report, readable in one glance.',
    mockup: <MiniIProfile />,
  },
]

const N_BEATS = 4

function KelolaBeat({ beat }: { beat: number }) {
  if (beat === 0) {
    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="w-16 h-16 rounded-3xl bg-brand/15 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#1D6FF2" strokeWidth="1.5" fill="none" opacity="0.6" />
            <circle cx="16" cy="16" r="4" fill="#1D6FF2" />
          </svg>
        </div>
        <div>
          <p className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Plot twist</p>
          <h1 className="text-4xl font-black text-[#f0f4f8] leading-tight">
            You've already<br />used <span className="text-brand">Kelola Apps</span>.
          </h1>
        </div>
        <p className="text-white/45 text-sm leading-relaxed max-w-[260px]">
          Every mechanic you just played with is a real Kelola module.
        </p>
      </div>
    )
  }

  if (beat >= 1 && beat <= 3) {
    const r = REVEALS[beat - 1]
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        <p className="text-white/35 text-xs uppercase tracking-widest">
          In the game: <span className="text-white/55 normal-case tracking-normal not-italic">{r.inGame}</span>
        </p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 220 }}
          className="py-2"
        >
          {r.mockup}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-brand/40" />
            <p className="text-brand font-black text-2xl">{r.module}</p>
            <div className="w-4 h-px bg-brand/40" />
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-[260px]">{r.inKelola}</p>
        </motion.div>
      </div>
    )
  }

  return null
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function KelolaRevealScreen() {
  const { actions } = useGame()
  const [beat, setBeat] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollRef = useRef(0)
  const touchStartY = useRef(0)
  const isFinal = beat >= N_BEATS

  function advance() {
    setScrolled(true)
    setBeat(b => Math.min(b + 1, N_BEATS))
  }

  function goBack() {
    setScrolled(true)
    setBeat(b => Math.max(b - 1, 0))
  }

  function handleWheel(e: React.WheelEvent) {
    if (isFinal) return
    const now = Date.now()
    if (now - lastScrollRef.current < 600) return
    lastScrollRef.current = now
    if (e.deltaY > 0) advance()
    else if (e.deltaY < 0) goBack()
  }

  if (isFinal) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 max-w-sm"
        >
          <p className="text-white/50 text-base leading-relaxed">
            The difference? In Kelola the data is{' '}
            <span className="text-[#f0f4f8] font-black">real</span> — and you get more than{' '}
            <span className="text-amber-400 font-black">60 seconds</span>.
          </p>
          <div className="flex gap-2 pt-2">
            {REVEALS.map((r, i) => (
              <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                <p className="text-white/50 text-[9px] font-semibold">{r.module}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <PrimaryButton onClick={() => actions.showDemoQR()}>
            See the Real Thing →
          </PrimaryButton>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col h-full items-center justify-center px-6 text-center overflow-hidden"
      onClick={() => { if (!isFinal) advance() }}
      onWheel={handleWheel}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        if (isFinal) return
        const dy = touchStartY.current - e.changedTouches[0].clientY
        if (Math.abs(dy) > 40) dy > 0 ? advance() : goBack()
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.32 }}
          className="relative"
        >
          <KelolaBeat beat={beat} />
        </motion.div>
      </AnimatePresence>

      {/* Scroll hint — beat 0, belum interaksi */}
      <AnimatePresence>
        {beat === 0 && !scrolled && (
          <motion.div
            key="scroll-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
          >
            <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-semibold">scroll</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4l5 5 5-5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots + Skip */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5">
        <div className="flex gap-1.5">
          {Array.from({ length: N_BEATS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === beat ? 'w-5 bg-brand' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); setBeat(N_BEATS) }}
          className="text-white/30 text-[10px] uppercase tracking-widest font-semibold py-1 px-3"
        >
          Skip →
        </button>
      </div>
    </div>
  )
}
