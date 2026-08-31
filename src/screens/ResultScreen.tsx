import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById } from '../data/scenario'
import { fitColor } from '../game/scoring'
import type { Persona } from '../game/types'

const PERSONA_CONFIG: Record<Persona, { emoji: string; subtitle: string; color: string }> = {
  'TALENT ARCHITECT': {
    emoji: '🏆',
    subtitle: 'Kamu menemukan kandidat terkuat!',
    color: '#16a34a',
  },
  'TALENT STRATEGIST': {
    emoji: '🎯',
    subtitle: 'Keputusan talent kamu sangat solid.',
    color: '#1D6FF2',
  },
  'TALENT SCOUT': {
    emoji: '🔍',
    subtitle: 'Pilihan yang oke, tapi ada yang lebih cocok.',
    color: '#d97706',
  },
  'GUT-FEEL MANAGER': {
    emoji: '👆',
    subtitle: 'Lebih banyak data = keputusan lebih baik.',
    color: '#ef4444',
  },
}

export function ResultScreen() {
  const { state, actions } = useGame()
  const score = state.score!
  const finalPick = state.finalPickId ? getCandidateById(state.finalPickId) : null
  const persona = PERSONA_CONFIG[score.persona]

  return (
    <div className="flex flex-col h-full px-6 py-6 overflow-y-auto scrollable bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center gap-5"
      >
        {/* Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-2 pt-2"
        >
          <div className="text-8xl font-black leading-none" style={{ color: persona.color }}>
            {score.total}%
          </div>
          <div className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Team Fitness</div>
        </motion.div>

        {/* Persona stamp */}
        <motion.div
          initial={{ scale: 2.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 22 }}
          className="relative px-6 py-4 rounded-2xl border-4 text-center w-full bg-white"
          style={{ borderColor: persona.color + '60', color: persona.color }}
        >
          <div className="text-3xl mb-1">{persona.emoji}</div>
          <div className="text-xl font-black uppercase tracking-widest">{score.persona}</div>
          <p className="text-slate-500 text-xs mt-1">{persona.subtitle}</p>
        </motion.div>

        {/* Final pick */}
        {finalPick && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4"
          >
            <Avatar id={state.finalPickId!} name={finalPick.name} size="md" />
            <div className="text-left">
              <p className="text-slate-400 text-xs">Pilihan kamu untuk Sales Manager</p>
              <p className="text-[#0f172a] font-bold">{finalPick.name}</p>
              <p className="text-sm font-semibold" style={{ color: fitColor(finalPick.roleFit) }}>
                {finalPick.roleFit}% Role Fit
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full flex flex-col gap-2"
        >
          <PrimaryButton onClick={() => actions.showKelolaReveal()}>
            Lihat Plot Twist →
          </PrimaryButton>
        </motion.div>
      </motion.div>
    </div>
  )
}
