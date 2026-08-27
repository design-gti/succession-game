import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { JOB_NEEDS, VACANCY_POSITION } from '../data/scenario'

export function JobNeedsScreen() {
  const { actions } = useGame()

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="mb-6">
          <p className="text-brand text-xs font-bold uppercase tracking-widest">Position Needed</p>
          <h2 className="text-2xl font-black text-[#f0f4f8] mt-1">{VACANCY_POSITION}</h2>
        </div>

        {/* Job needs */}
        <div className="flex-1">
          <p className="text-white/50 text-sm mb-4">We need someone who can:</p>
          <div className="flex flex-col gap-3">
            {JOB_NEEDS.map((need, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-white/80 text-sm leading-snug">{need}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timer warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="my-4 bg-amber-500/10 border border-amber-400/30 rounded-xl px-4 py-3 text-center"
        >
          <p className="text-amber-400 text-sm font-semibold">
            ⏱ You have <strong>60 seconds</strong> to find the best match
          </p>
        </motion.div>

        <PrimaryButton onClick={() => actions.startSearching()}>
          Start Searching
        </PrimaryButton>
      </motion.div>
    </div>
  )
}
