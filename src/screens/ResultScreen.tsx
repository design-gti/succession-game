import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById } from '../data/scenario'
import { fitColor } from '../game/scoring'
import type { Persona } from '../game/types'
import { PLAYER_AVATARS } from './IntroScreen'

const PERSONA_CONFIG: Record<Persona, { emoji: string; subtitle: string; color: string }> = {
  'TALENT ARCHITECT': {
    emoji: '🏆',
    subtitle: 'You found the strongest match.',
    color: '#22c55e',
  },
  'TALENT STRATEGIST': {
    emoji: '🎯',
    subtitle: 'You make strong talent decisions.',
    color: '#1D6FF2',
  },
  'TALENT SCOUT': {
    emoji: '🔍',
    subtitle: 'You spotted the best candidate, but chose differently.',
    color: '#f59e0b',
  },
  'GUT-FEEL MANAGER': {
    emoji: '👆',
    subtitle: 'You trusted what you saw first. More data might change the picture.',
    color: '#ef4444',
  },
}

export function ResultScreen() {
  const { state, actions } = useGame()
  const [copied, setCopied] = useState(false)
  const score = state.score!
  const finalPick = getCandidateById(state.finalPickId!)
  const firstPick = getCandidateById(state.firstPickId!)
  const persona = PERSONA_CONFIG[score.persona]
  const fitDelta = finalPick.roleFit - firstPick.roleFit
  const playerAv = PLAYER_AVATARS[state.playerAvatar ?? 0]

  async function handleShare() {
    const text = `I scored ${score.total} pts in Fill the Seat!\nPersona: ${score.persona} ${persona.emoji}\nFinal pick: ${finalPick.name} — ${finalPick.roleFit}% fit\n#Talentlytica`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-full px-6 py-6 overflow-y-auto scrollable">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center gap-5"
      >
        {/* Player + Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg"
            style={{ backgroundColor: playerAv.color }}>
            {state.playerName.charAt(0).toUpperCase() || playerAv.label}
          </div>
          <p className="text-white/50 text-sm font-semibold">{state.playerName || 'You'}</p>
          <div className="text-7xl font-black leading-none" style={{ color: persona.color }}>
            {score.total}
          </div>
          <div className="text-white/35 text-sm uppercase tracking-widest">Talent Decision Score</div>
        </motion.div>

        {/* Persona — rubber stamp */}
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 22 }}
          className="relative px-6 py-4 rounded-2xl border-4 text-center w-full"
          style={{ borderColor: persona.color, color: persona.color, backgroundColor: persona.color + '10' }}
        >
          <div className="text-3xl mb-1">{persona.emoji}</div>
          <div className="text-xl font-black uppercase tracking-widest">{score.persona}</div>
          <p className="text-white/50 text-xs mt-1">{persona.subtitle}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full grid grid-cols-3 gap-2"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-xl font-black" style={{ color: fitColor(finalPick.roleFit) }}>
              {finalPick.roleFit}%
            </div>
            <div className="text-white/35 text-[10px] uppercase tracking-wide mt-0.5">Final Fit</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-xl font-black text-[#f0f4f8]">{score.matchChecksUsed}</div>
            <div className="text-white/35 text-[10px] uppercase tracking-wide mt-0.5">Match Checks</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className={`text-xl font-black ${fitDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fitDelta >= 0 ? '+' : ''}{fitDelta}%
            </div>
            <div className="text-white/35 text-[10px] uppercase tracking-wide mt-0.5">vs First Pick</div>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left"
        >
          <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-3">Score Breakdown</p>
          {[
            { label: 'Found best candidate', points: score.discoveryBonus, max: 30 },
            { label: 'Chose best candidate', points: score.pickBonus, max: 30 },
            { label: 'Final role fit', points: score.finalRoleFitPoints, max: 30 },
            { label: 'Search efficiency', points: score.searchEfficiencyPoints, max: 10 },
          ].map(({ label, points, max }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/8 last:border-0">
              <span className="text-white/60 text-sm">{label}</span>
              <span className="font-bold text-sm text-[#f0f4f8]">{points}<span className="text-white/25">/{max}</span></span>
            </div>
          ))}
        </motion.div>

        {/* Final pick */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <Avatar id={state.finalPickId!} name={finalPick.name} size="md" />
          <div className="text-left">
            <p className="text-white/40 text-xs">Your replacement</p>
            <p className="text-[#f0f4f8] font-bold">{finalPick.name}</p>
            <p className="text-white/40 text-xs">{finalPick.roleFit}% Role Fit</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="w-full flex flex-col gap-2"
        >
          <PrimaryButton onClick={() => actions.showLeaderboard()}>
            View Leaderboard →
          </PrimaryButton>
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-2xl border-2 border-white/10 text-white/60 font-bold text-sm flex items-center justify-center gap-2 hover:border-white/20 transition-colors active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span key="copied" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  ✓ Copied!
                </motion.span>
              ) : (
                <motion.span key="share" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  Share my result
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
