import { motion } from 'framer-motion'
import type { Assessment } from '../data/scenario'

const DIMENSIONS: { key: keyof Assessment; label: string }[] = [
  { key: 'leadership', label: 'Leadership' },
  { key: 'drive', label: 'Drive' },
  { key: 'influence', label: 'Influencing' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'collaboration', label: 'Collaboration' },
]

function barColor(value: number): string {
  if (value >= 85) return '#22c55e'
  if (value >= 70) return '#f59e0b'
  return '#ef4444'
}

interface Props {
  assessment: Assessment
}

export function AssessmentBars({ assessment }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {DIMENSIONS.map(({ key, label }) => {
        const value = assessment[key]
        const color = barColor(value)
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-white/60 text-sm w-28 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
            <span className="text-white/80 text-sm font-mono w-8 text-right">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
