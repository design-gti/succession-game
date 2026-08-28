import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

// TODO: ganti dengan link booking demo Kelola yang sebenarnya
const DEMO_URL = 'https://talentlytica.com'

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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-brand/30 rounded-2xl p-4 w-full max-w-xs flex items-center gap-4"
        >
          <div className="bg-white rounded-xl p-2 flex-shrink-0">
            <QRCodeSVG value={DEMO_URL} size={88} level="M" bgColor="#ffffff" fgColor="#0f1724" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-brand font-black text-sm leading-tight">Curious what the real thing looks like?</p>
            <p className="text-white/50 text-xs mt-1.5 leading-snug">
              That was 60 seconds. The real demo takes 15 minutes.
            </p>
            <p className="text-white/30 text-[10px] mt-1.5 uppercase tracking-wider font-semibold">Scan to book a demo</p>
          </div>
        </motion.div>

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
