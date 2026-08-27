import { motion } from 'framer-motion'
import { fitColor } from '../game/scoring'

interface Props {
  fit: number
  size?: number
  animate?: boolean
}

export function FitRing({ fit, size = 120, animate = true }: Props) {
  const stroke = size * 0.1
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const progress = fit / 100
  const dashOffset = circ * (1 - progress)
  const color = fitColor(fit)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: animate ? dashOffset : circ }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size, top: 0 }}>
        <span className="text-3xl font-black" style={{ color }}>{fit}%</span>
        <span className="text-xs text-white/50 font-medium">ROLE FIT</span>
      </div>
    </div>
  )
}

export function FitRingWithLabel({ fit, size = 120, animate = true }: Props) {
  const stroke = size * 0.1
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const progress = fit / 100
  const dashOffset = circ * (1 - progress)
  const color = fitColor(fit)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg] absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: animate ? dashOffset : circ }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="font-black leading-none" style={{ color, fontSize: size * 0.22 }}>{fit}%</span>
        <span className="text-white/50 font-medium uppercase" style={{ fontSize: size * 0.08 }}>Role Fit</span>
      </div>
    </div>
  )
}
