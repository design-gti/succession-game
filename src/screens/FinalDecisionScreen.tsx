import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById, CANDIDATES } from '../data/scenario'
import type { CandidateId } from '../game/types'
import { fitColor } from '../game/scoring'

export function FinalDecisionScreen() {
  const { state, actions } = useGame()
  const [selected, setSelected] = useState<CandidateId | null>(null)

  const revealed = Object.entries(state.revealedFits) as [CandidateId, number][]

  // All candidates — group revealed vs. unrevealed
  const revealedCandidates = revealed.sort((a, b) => b[1] - a[1])
  const unrevealedCandidates = CANDIDATES.filter(c => state.revealedFits[c.id] === undefined)

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="mb-2">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">Final Decision</p>
          <h2 className="text-2xl font-black text-[#212529] mt-1">Who gets the seat?</h2>
          <p className="text-[#6c757d] text-sm mt-1">
            {state.timerExpired ? 'Time\'s up!' : 'Ready to decide.'} Choose from the candidates you\'ve assessed.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollable py-2">
          {/* Revealed candidates */}
          {revealedCandidates.length > 0 && (
            <div className="mb-4">
              <p className="text-[#6c757d] text-xs uppercase tracking-widest font-semibold mb-3">
                Candidates You've Assessed
              </p>
              <div className="flex flex-col gap-2">
                {revealedCandidates.map(([id, fit]) => {
                  const c = getCandidateById(id)
                  const isSelected = selected === id
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected(id)}
                      className={`rounded-2xl p-4 text-left border transition-all
                        ${isSelected
                          ? 'border-brand bg-brand/10'
                          : c.source === 'external'
                          ? 'border-amber-400/50 bg-amber-50'
                          : 'border-[#dee2e6] bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar id={id} name={c.name} size="sm" />
                        <div className="flex-1">
                          <p className="text-[#212529] font-bold text-sm">{c.name}</p>
                          <p className="text-[#6c757d] text-xs">{c.currentRole}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-lg font-black"
                            style={{ color: fitColor(fit) }}
                          >
                            {fit}%
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unrevealed candidates */}
          {unrevealedCandidates.length > 0 && (
            <div className="mb-4">
              <p className="text-[#6c757d] text-xs uppercase tracking-widest font-semibold mb-3">
                {state.matchChecksUsed === 0 ? 'Choose Without Data' : 'Not Assessed'}
              </p>
              {state.matchChecksUsed === 0 && (
                <p className="text-[#adb5bd] text-xs mb-3 italic">
                  You ran out of time. Trust your gut.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {unrevealedCandidates.map(c => {
                  const isSelected = selected === c.id
                  if (state.matchChecksUsed === 0) {
                    return (
                      <motion.button
                        key={c.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(c.id)}
                        className={`rounded-2xl p-4 text-left border transition-all
                          ${isSelected
                            ? 'border-brand bg-brand/10'
                            : c.source === 'external'
                            ? 'border-amber-400/50 bg-amber-50 opacity-70'
                            : 'border-[#dee2e6] bg-white opacity-70'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar id={c.id} name={c.name} size="sm" />
                          <div className="flex-1">
                            <p className="text-[#212529] font-bold text-sm">{c.name}</p>
                            <p className="text-[#6c757d] text-xs">{c.currentRole}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#adb5bd] text-lg font-black">??</span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    )
                  }
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl p-4 border border-[#dee2e6] bg-[#f8f9fa] opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#e9ecef] rounded-full flex items-center justify-center">
                          <span className="text-[#adb5bd] text-sm font-bold">?</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#6c757d] font-bold text-sm">{c.name}</p>
                          <p className="text-[#adb5bd] text-xs">{c.currentRole}</p>
                        </div>
                        <span className="text-[#adb5bd] text-lg font-black">??</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="pt-2">
          <PrimaryButton
            onClick={() => selected && actions.confirmFinal(selected)}
            disabled={!selected}
          >
            Confirm Replacement →
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  )
}
