import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TIMER_DURATION } from '../game/reducer'

interface Props {
  timerStartedAt: number | null
  onExpire?: () => void
  onTick?: (secondsLeft: number) => void
}

export function TimerBar({ timerStartedAt, onExpire, onTick }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION)

  useEffect(() => {
    if (!timerStartedAt) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - timerStartedAt) / 1000
      const left = Math.max(0, TIMER_DURATION - elapsed)
      setSecondsLeft(left)
      onTick?.(left)
      if (left <= 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [timerStartedAt])

  const progress = secondsLeft / TIMER_DURATION
  const isUrgent = secondsLeft <= 15

  let barColor = 'bg-brand'
  if (secondsLeft <= 15) barColor = 'bg-amber-500'
  if (secondsLeft <= 8) barColor = 'bg-red-500'

  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Time</span>
        <span className={`text-sm font-mono font-bold transition-colors ${isUrgent ? 'text-amber-400' : 'text-white/60'} ${secondsLeft <= 8 ? 'text-red-400' : ''}`}>
          {Math.ceil(secondsLeft)}s
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${barColor}`}
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}
