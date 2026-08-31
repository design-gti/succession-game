import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

const TEAM_COLORS = ['#1D6FF2', '#7C3AED', '#DC2626', '#D97706', '#0891B2']
const RESIGN_INDEX = 2 // Sales Manager slot

function PersonAvatar({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" className="text-white">
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" />
      </svg>
    </div>
  )
}

export function IntroScreen() {
  const { actions } = useGame()
  const [resignDone, setResignDone] = useState(false)

  // Trigger the resignation animation after a short delay
  useEffect(() => {
    const t = setTimeout(() => setResignDone(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 max-w-sm w-full"
      >
        {/* Brand */}
        <p className="text-brand text-xs font-bold uppercase tracking-[0.3em]">Talentlytica</p>

        {/* Team row with animated resignation */}
        <div className="flex items-end justify-center gap-4">
          {TEAM_COLORS.map((color, i) => {
            const isResigning = i === RESIGN_INDEX
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <AnimatePresence mode="wait">
                  {isResigning && resignDone ? (
                    /* Vacant chair */
                    <motion.div
                      key="vacant"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                      transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.2 }}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 bg-red-50 flex items-center justify-center"
                    >
                      <span className="text-red-500 text-xl font-black leading-none">?</span>
                    </motion.div>
                  ) : isResigning ? (
                    /* Person walking out */
                    <motion.div
                      key="resigning"
                      initial={{ x: 0, opacity: 1 }}
                      animate={{ x: 40, opacity: 0 }}
                      transition={{ duration: 0.55, ease: 'easeIn', delay: 0.4 }}
                    >
                      <PersonAvatar color={color} />
                    </motion.div>
                  ) : (
                    /* Normal team member */
                    <motion.div
                      key="member"
                      initial={{ y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.07, duration: 0.4 }}
                    >
                      <PersonAvatar color={color} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isResigning && resignDone && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-red-500 text-[9px] font-bold uppercase tracking-widest"
                  >
                    vacant
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Headline */}
        <AnimatePresence>
          {resignDone && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="text-3xl font-black text-[#0f172a] leading-tight">
                Sales Manager kamu<br />baru saja resign.
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Siapa penggantinya? Jelajahi org chart,<br />bandingkan kandidat, pilih yang terbaik.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {resignDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 }}
              className="w-full"
            >
              <PrimaryButton onClick={() => actions.startGame()}>
                Mulai Eksplorasi →
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
