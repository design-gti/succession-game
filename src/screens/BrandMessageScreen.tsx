import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

export function BrandMessageScreen() {
  const { actions } = useGame()

  return (
    <div className="flex flex-col h-full px-6 py-8 items-center justify-between text-center">
      <div />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-brand/15 rounded-3xl flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="15" y="2" width="10" height="8" rx="2" fill="#1D6FF2" opacity="0.8" />
              <rect x="2" y="28" width="10" height="8" rx="2" fill="#1D6FF2" opacity="0.4" />
              <rect x="15" y="28" width="10" height="8" rx="2" fill="#1D6FF2" />
              <rect x="28" y="28" width="10" height="8" rx="2" fill="#1D6FF2" opacity="0.4" />
              <line x1="20" y1="10" x2="20" y2="18" stroke="#1D6FF2" strokeWidth="2" opacity="0.4" />
              <line x1="7" y1="18" x2="33" y2="18" stroke="#1D6FF2" strokeWidth="2" opacity="0.4" />
              <line x1="7" y1="18" x2="7" y2="28" stroke="#1D6FF2" strokeWidth="2" opacity="0.4" />
              <line x1="20" y1="18" x2="20" y2="28" stroke="#1D6FF2" strokeWidth="2" />
              <line x1="33" y1="18" x2="33" y2="28" stroke="#1D6FF2" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>

          <div>
            <p className="text-3xl font-black text-[#f0f4f8]">You filled the seat.</p>
            <p className="text-white/60 mt-2 text-base leading-relaxed max-w-xs">
              But finding the right person shouldn't be a guessing game.
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left w-full max-w-xs">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
            Talentlytica helps organizations understand:
          </p>
          {['Performance', 'Potential', 'Competency', 'Role Fit'].map(item => (
            <div key={item} className="flex items-center gap-2 py-1.5 border-b border-white/8 last:border-0">
              <div className="w-1.5 h-1.5 bg-brand rounded-full" />
              <p className="text-white/70 text-sm">{item}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-brand text-lg font-black tracking-tight">TALENTLYTICA</p>
          <p className="text-white/30 text-sm font-medium">Right Person. Right Seat.</p>
        </div>
      </motion.div>

      <div className="w-full flex flex-col gap-2">
        <PrimaryButton onClick={() => actions.restart()}>
          Play Again
        </PrimaryButton>
        <p className="text-white/25 text-xs text-center mt-1">talentlytica.com</p>
      </div>
    </div>
  )
}
