import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById, BEST_CANDIDATE_ID, CANDIDATES } from '../data/scenario'
import { fitColor } from '../game/scoring'

function FitArc({ fit, size = 88 }: { fit: number; size?: number }) {
  const r = (size - 10) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const stroke = circumference * (1 - fit / 100)
  const color = fitColor(fit)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: stroke }}
        transition={{ delay: 0.5, duration: 1.1, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function FinalRevealScreen() {
  const { state, actions } = useGame()
  const fired = useRef(false)

  if (!state.finalPickId || !state.score) return null

  const finalPick = getCandidateById(state.finalPickId)
  const bestCandidate = getCandidateById(BEST_CANDIDATE_ID)
  const isBestMatch = state.finalPickId === BEST_CANDIDATE_ID
  const bestAvailableFit = Math.max(...CANDIDATES.map(c => c.roleFit))
  const diff = bestAvailableFit - finalPick.roleFit
  const fitCol = fitColor(finalPick.roleFit)

  useEffect(() => {
    if (isBestMatch && !fired.current) {
      fired.current = true
      setTimeout(() => {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.35 }, colors: ['#1D6FF2', '#22c55e', '#f59e0b', '#a78bfa'] })
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 110, origin: { y: 0.5, x: 0.1 }, colors: ['#22c55e', '#f59e0b'] })
          confetti({ particleCount: 50, spread: 110, origin: { y: 0.5, x: 0.9 }, colors: ['#1D6FF2', '#a78bfa'] })
        }, 300)
      }, 600)
    }
  }, [])

  return (
    <div className="flex flex-col h-full px-5 py-5 gap-4 overflow-y-auto scrollable bg-[#f4f7fb]">

      {/* Header label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] text-center"
      >
        The seat goes to…
      </motion.p>

      {/* Winner card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
        className="bg-white border border-slate-200 rounded-2xl px-5 py-5 flex items-center gap-4 shadow-sm"
      >
        {/* Avatar + glow */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ backgroundColor: fitCol, filter: 'blur(14px)', opacity: 0.3, transform: 'scale(1.35)' }} />
          <Avatar id={state.finalPickId} name={finalPick.name} size="lg" className="relative" />
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[#0f172a] text-lg font-black leading-tight truncate">{finalPick.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{finalPick.currentRole}</p>
          {finalPick.source === 'external' && (
            <span className="inline-block mt-1 text-amber-600 text-[9px] font-bold uppercase tracking-widest border border-amber-400/60 bg-amber-50 rounded-full px-2 py-0.5">
              External
            </span>
          )}
        </div>

        {/* Arc ring */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <FitArc fit={finalPick.roleFit} size={80} />
          <motion.div
            className="absolute flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-lg font-black leading-none" style={{ color: fitCol }}>
              {finalPick.roleFit}%
            </span>
            <span className="text-slate-400 text-[7px] uppercase tracking-wider">Fit</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Best match OR VS comparison */}
      {isBestMatch ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-green-50 border border-green-300 rounded-2xl px-5 py-4 flex items-center gap-3"
        >
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-green-700 font-black text-sm leading-tight">Kamu menemukan kandidat terkuat!</p>
            <p className="text-green-600/70 text-xs mt-0.5 leading-relaxed">
              {finalPick.source === 'internal'
                ? 'The right successor was inside your org all along.'
                : 'Sometimes the strongest match comes from outside.'}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3"
        >
          {/* VS cards */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm">
              <p className="text-slate-400 text-[8px] uppercase tracking-widest font-bold">Your Pick</p>
              <Avatar id={state.finalPickId} name={finalPick.name} size="sm" />
              <p className="text-[#0f172a] text-xs font-bold text-center leading-tight">{finalPick.name}</p>
              <span className="text-base font-black" style={{ color: fitColor(finalPick.roleFit) }}>
                {finalPick.roleFit}%
              </span>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 gap-1">
              <div className="w-px h-6 bg-slate-200" />
              <span className="text-slate-300 text-[9px] font-black">VS</span>
              <div className="w-px h-6 bg-slate-200" />
            </div>

            <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-3 flex flex-col items-center gap-2">
              <p className="text-green-600 text-[8px] uppercase tracking-widest font-bold">Best Available</p>
              <Avatar id={BEST_CANDIDATE_ID} name={bestCandidate.name} size="sm" />
              <p className="text-[#0f172a] text-xs font-bold text-center leading-tight">{bestCandidate.name}</p>
              <span className="text-base font-black" style={{ color: fitColor(bestCandidate.roleFit) }}>
                {bestCandidate.roleFit}%
              </span>
            </div>
          </div>

          {/* Miss delta */}
          {diff > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
              <span className="text-red-500 font-black text-sm">−{diff}% from the strongest fit</span>
              <p className="text-slate-400 text-[10px] mt-0.5">
                {bestCandidate.source === 'external'
                  ? 'Did you check the external pool?'
                  : 'They were already in the org chart.'}
              </p>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex-1" />

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <PrimaryButton onClick={() => actions.showResult()}>
          Lihat Skor →
        </PrimaryButton>
      </motion.div>

    </div>
  )
}
