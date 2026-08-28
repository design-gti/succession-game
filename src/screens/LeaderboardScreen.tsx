import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { fetchLeaderboard, type LeaderboardRow } from '../lib/api'

export function LeaderboardScreen() {
  const { state, actions } = useGame()
  const [board, setBoard] = useState<LeaderboardRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
      .then(data => setBoard(data))
      .finally(() => setLoading(false))
  }, [])

  const displayBoard: LeaderboardRow[] = board ?? (state.score ? [
    { id: 'you', player_name: state.playerName || 'You', score: state.score.total, persona: state.score.persona, created_at: '' }
  ] : [])

  const myScore = state.score?.total ?? 0

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <div className="mb-4">
          <p className="text-brand text-xs font-bold uppercase tracking-widest">Today's</p>
          <h2 className="text-2xl font-black text-[#f0f4f8]">Leaderboard</h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollable">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayBoard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 text-sm">No scores yet today.</p>
              <p className="text-white/30 text-xs mt-1">Be the first!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayBoard.map((row, i) => {
                const isMe = row.player_name === state.playerName && row.score === myScore
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 rounded-xl p-3 border
                      ${isMe
                        ? 'border-brand bg-brand/10'
                        : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                      ${i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white/60'}`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isMe ? 'text-brand' : 'text-[#f0f4f8]'}`}>
                        {row.player_name} {isMe && '(you)'}
                      </p>
                      <p className="text-white/40 text-xs">{row.persona}</p>
                    </div>
                    <span className={`text-lg font-black ${isMe ? 'text-brand' : 'text-[#f0f4f8]'}`}>
                      {row.score}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div className="pt-4">
          <PrimaryButton onClick={() => actions.finish()}>
            Play Again →
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  )
}
