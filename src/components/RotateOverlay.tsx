import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function RotateOverlay() {
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (!isPortrait) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f1724] flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: [0, 90, 90, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl"
      >
        📱
      </motion.div>
      <div className="text-center">
        <p className="text-[#f0f4f8] font-black text-xl">Putar HP kamu</p>
        <p className="text-white/50 text-sm mt-1">Rotate your phone to landscape</p>
      </div>
    </div>
  )
}
