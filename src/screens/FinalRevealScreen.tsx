import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById, BEST_CANDIDATE_ID, CANDIDATES } from '../data/scenario'
import { fitColor } from '../game/scoring'

const SCENARIO_MESSAGES: Record<string, string> = {
  internal: 'The right successor was inside your organization all along.',
  external: 'Sometimes the strongest match needs to come from outside.',
}

function FitArc({ fit, size = 90 }: { fit: number; size?: number }) {
  const r = (size - 10) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const stroke = circumference * (1 - fit / 100)
  const color = fitColor(fit)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
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
  const isBestMatch = state.score.bestMatchFound
  const bestAvailableFit = Math.max(...CANDIDATES.map(c => c.roleFit))
  const diff = bestAvailableFit - finalPick.roleFit
  const fitCol = fitColor(finalPick.roleFit)

  const scenarioMsg = isBestMatch
    ? (finalPick.source === 'internal' ? SCENARIO_MESSAGES.internal : SCENARIO_MESSAGES.external)
    : ''

  useEffect(() => {
    if (isBestMatch && !fired.current) {
      fired.current = true
      setTimeout(() => {
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.4 }, colors: ['#1D6FF2', '#22c55e', '#f59e0b', '#a78bfa'] })
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 110, origin: { y: 0.5, x: 0.1 }, colors: ['#22c55e', '#f59e0b'] })
          confetti({ particleCount: 50, spread: 110, origin: { y: 0.5, x: 0.9 }, colors: ['#1D6FF2', '#a78bfa'] })
        }, 300)
      }, 600)
    }
  }, [])

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #0f1724 0%, #0e1e2e 60%, #0a1520 100%)' }}
    >
      {/* LEFT — winner reveal */}
      <motion.div
        className="flex flex-col items-center justify-center gap-2 px-6 py-4 flex-shrink-0"
        style={{ width: '55%', position: 'relative' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Spotlight glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 80% at 50% 40%, ${fitCol}20 0%, transparent 70%)` }} />

        {/* Header */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-white/35 text-[9px] font-bold uppercase tracking-[0.25em] z-10"
        >
          The seat goes to…
        </motion.p>

        {/* Avatar + glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
          className="relative z-10"
        >
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ backgroundColor: fitCol, filter: 'blur(18px)', opacity: 0.45, transform: 'scale(1.4)' }} />
          <Avatar id={state.finalPickId} name={finalPick.name} size="xl" className="relative" />
        </motion.div>

        {/* Name + role */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center z-10"
        >
          <h2 className="text-white text-xl font-black leading-tight">{finalPick.name}</h2>
          <p className="text-white/40 text-[11px] mt-0.5">{finalPick.currentRole}</p>
          {finalPick.source === 'external' && (
            <span className="inline-block mt-1 text-amber-400 text-[9px] font-bold uppercase tracking-widest border border-amber-400/40 rounded-full px-2 py-0.5">
              External
            </span>
          )}
        </motion.div>

        {/* Arc ring + % */}
        <motion.div
          className="relative flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <FitArc fit={finalPick.roleFit} size={90} />
          <motion.div
            className="absolute flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-2xl font-black leading-none" style={{ color: fitCol }}>
              {finalPick.roleFit}%
            </span>
            <span className="text-white/30 text-[8px] uppercase tracking-wider">Role Fit</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* RIGHT — result + CTA */}
      <div className="flex flex-col justify-center gap-3 px-4 py-5 flex-1">

        {/* Best match OR VS comparison */}
        {isBestMatch ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Best match badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 400, damping: 18 }}
              className="inline-flex items-center gap-1.5 bg-green-400 text-green-900 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
            >
              ⭐ Best Match
            </motion.div>
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <p className="text-green-400 font-black text-base leading-tight">You found the strongest fit!</p>
              {scenarioMsg && <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{scenarioMsg}</p>}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-2"
          >
            {/* VS cards side by side */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold">Your Pick</p>
                <Avatar id={state.finalPickId} name={finalPick.name} size="sm" />
                <p className="text-white text-[11px] font-bold text-center leading-tight">{finalPick.name}</p>
                <span className="text-base font-black" style={{ color: fitColor(finalPick.roleFit) }}>
                  {finalPick.roleFit}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center shrink-0 gap-1 px-1">
                <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="text-white/20 text-[9px] font-black">VS</span>
                <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div className="flex-1 rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-green-400/60 text-[8px] uppercase tracking-widest font-bold">Best Available</p>
                <Avatar id={BEST_CANDIDATE_ID} name={bestCandidate.name} size="sm" />
                <p className="text-white text-[11px] font-bold text-center leading-tight">{bestCandidate.name}</p>
                <span className="text-base font-black" style={{ color: fitColor(bestCandidate.roleFit) }}>
                  {bestCandidate.roleFit}%
                </span>
              </div>
            </div>

            {/* Miss delta */}
            {diff > 0 && (
              <div className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <span className="text-red-400 font-black text-sm">−{diff}% from the strongest fit</span>
                <p className="text-white/25 text-[9px] mt-0.5">
                  {bestCandidate.source === 'external'
                    ? 'Did you check the external pool?'
                    : 'They were already in the org chart.'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <PrimaryButton onClick={() => actions.showResult()}>
            See My Score →
          </PrimaryButton>
        </motion.div>
      </div>
    </div>
  )
}
