import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

// ─── Mini-mockups — game visual language, shaped like Kelola modules ─────────

function MiniVisibilityMap() {
  return (
    <div className="flex flex-col items-center gap-[3px] py-1">
      {/* top node */}
      <div className="w-7 h-4 rounded-[3px] bg-white/15 border border-white/20" />
      <div className="w-px h-1.5 bg-white/20" />
      {/* children row with connector */}
      <div className="relative flex gap-1.5">
        <div className="absolute -top-[3px] left-3 right-3 h-px bg-white/20" />
        <div className="flex flex-col items-center">
          <div className="w-px h-[3px] bg-white/20" />
          <div className="w-6 h-4 rounded-[3px] bg-green-500/25 border border-green-400/40" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[3px] bg-white/20" />
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-6 h-4 rounded-[3px] bg-red-500/20 border border-dashed border-red-400/70"
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[3px] bg-white/20" />
          <div className="w-6 h-4 rounded-[3px] bg-amber-500/25 border border-amber-400/40" />
        </div>
      </div>
    </div>
  )
}

function MiniTDP() {
  const cards = [
    { score: 92, top: true },
    { score: 80, top: false },
    { score: 68, top: false },
  ]
  return (
    <div className="flex items-end gap-1 py-1">
      {cards.map(({ score, top }, i) => (
        <div
          key={i}
          className={`w-[26px] rounded-[4px] border overflow-hidden ${top ? 'border-brand bg-brand/15' : 'border-white/15 bg-white/5'}`}
        >
          <div className={`h-[14px] flex items-center justify-center ${top ? 'bg-brand/20' : 'bg-white/5'}`}>
            <div className={`w-2 h-2 rounded-full ${top ? 'bg-brand' : 'bg-white/25'}`} />
          </div>
          <p className={`text-[7px] font-black text-center py-[2px] ${top ? 'text-brand' : 'text-white/40'}`}>{score}</p>
        </div>
      ))}
    </div>
  )
}

function MiniIProfile() {
  const bars = [82, 68, 90, 74, 60]
  return (
    <div className="w-[74px] rounded-[5px] border border-white/15 bg-white/5 px-1.5 py-1.5 flex flex-col gap-[3px]">
      <div className="flex items-center gap-1 mb-[2px]">
        <div className="w-3 h-3 rounded-full bg-brand/60 flex-shrink-0" />
        <div className="h-[4px] flex-1 rounded-full bg-white/20" />
      </div>
      {bars.map((w, i) => (
        <div key={i} className="h-[3px] rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${w}%` }}
            transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
            className="h-full rounded-full bg-brand"
          />
        </div>
      ))}
    </div>
  )
}

// ─── Reveal cards ─────────────────────────────────────────────────────────────

const REVEALS = [
  {
    module: 'Visibility Map',
    inGame: 'The org chart with a vacant seat',
    inKelola: 'Your real org structure with a succession-risk heatmap. Vulnerable positions surface themselves.',
    mockup: <MiniVisibilityMap />,
  },
  {
    module: 'Talent Decision Platform',
    inGame: 'Comparing candidates by fit score',
    inKelola: 'Side-by-side candidate comparison with real assessment data. Compare first, then decide.',
    mockup: <MiniTDP />,
  },
  {
    module: 'iProfile',
    inGame: 'The 5 aspect bars on every card',
    inKelola: 'A 20-page assessment report, readable in one glance.',
    mockup: <MiniIProfile />,
  },
]

export function KelolaRevealScreen() {
  const { actions } = useGame()

  return (
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto scrollable">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 flex-1"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase mb-1.5">Plot twist</p>
          <h1 className="text-2xl font-black text-[#f0f4f8] leading-tight">
            You've already used<br /><span className="text-brand">Kelola Apps</span>.
          </h1>
          <p className="text-white/45 text-xs mt-2 max-w-[280px] mx-auto leading-relaxed">
            Everything you just played with is a real Kelola module.
          </p>
        </motion.div>

        {/* Reveal cards */}
        <div className="flex flex-col gap-2.5">
          {REVEALS.map((r, i) => (
            <motion.div
              key={r.module}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.3, type: 'spring', damping: 20, stiffness: 200 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
            >
              <div className="w-[84px] flex-shrink-0 flex items-center justify-center">
                {r.mockup}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/35 text-[8px] leading-snug">{r.inGame} —</p>
                <p className="text-brand font-black text-sm leading-tight mt-0.5">{r.module}</p>
                <p className="text-white/55 text-[10px] leading-snug mt-1">{r.inKelola}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Punchline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-white/50 text-xs leading-relaxed px-4"
        >
          The difference? In Kelola the data is <span className="text-[#f0f4f8] font-bold">real</span> —
          and you get more than <span className="text-amber-400 font-bold">60 seconds</span>.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="pt-4 flex-shrink-0"
      >
        <PrimaryButton onClick={() => actions.showLeaderboard()}>
          View Leaderboard →
        </PrimaryButton>
      </motion.div>
    </div>
  )
}
