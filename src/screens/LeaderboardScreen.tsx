import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { fetchLeaderboard, type LeaderboardRow } from '../lib/api'
import type { Persona } from '../game/types'

const PERSONA_COLOR: Record<Persona, string> = {
  'TALENT STRATEGIST': '#1D6FF2',
  'QUALITY ARCHITECT': '#16a34a',
  'RAPID RECRUITER':   '#d97706',
  'TALENT EXPLORER':   '#6366f1',
}

const MEDALS = ['🥇', '🥈', '🥉']

function TrophyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M6 3H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.5M18 3h2a2 2 0 0 1 2 2v1a4 4 0 0 0-4 4h-.5" />
      <path d="M6 3h12v8a6 6 0 0 1-12 0V3z" />
    </svg>
  )
}

function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  )
}

export function LeaderboardScreen() {
  const { state, actions } = useGame()
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  const playerName  = state.playerName
  const playerScore = state.score?.total ?? 0
  const playerPersona = state.score?.persona

  const load = async () => {
    setLoading(true)
    const data = await fetchLeaderboard()
    setRows(data)
    setLoading(false)
    setRetrying(false)
  }

  useEffect(() => { load() }, [])

  const playerRankInBoard = rows?.findIndex(
    r => r.player_name === playerName && r.score === playerScore,
  ) ?? -1

  const isMe = (r: LeaderboardRow, i: number) =>
    r.player_name === playerName && r.score === playerScore && i === playerRankInBoard

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(160deg, #eef4ff 0%, #f5f0ff 40%, #f0f9ff 100%)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: '20px 20px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}
      >
        <TrophyIcon />
        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', color: '#1D6FF2', textTransform: 'uppercase', margin: 0 }}>
          Hari Ini
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Top Talent Deciders
        </h2>
      </motion.div>

      {/* My score chip */}
      {playerPersona && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
          style={{ padding: '0 20px 12px' }}
        >
          <div style={{
            borderRadius: 14,
            background: `${PERSONA_COLOR[playerPersona]}12`,
            border: `1.5px solid ${PERSONA_COLOR[playerPersona]}30`,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', margin: 0 }}>Skor kamu</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{playerName || 'Kamu'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: PERSONA_COLOR[playerPersona], lineHeight: 1 }}>{playerScore}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: PERSONA_COLOR[playerPersona] }}>%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollable" style={{ padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}
            >
              <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Memuat leaderboard…</p>
            </motion.div>
          ) : rows === null ? (
            <motion.div
              key="offline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 20 }}
            >
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                Leaderboard tidak bisa dimuat.<br />Coba lagi?
              </p>
              <button
                onClick={() => { setRetrying(true); load() }}
                disabled={retrying}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 700, color: '#1D6FF2',
                  background: 'none', border: '1px solid #1D6FF2', borderRadius: 8,
                  padding: '6px 14px', cursor: retrying ? 'not-allowed' : 'pointer',
                  opacity: retrying ? 0.5 : 1,
                }}
              >
                <RetryIcon /> {retrying ? 'Mencoba…' : 'Coba lagi'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="list" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
              {rows.map((row, i) => {
                const mine = isMe(row, i)
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{
                      borderRadius: 14,
                      background: mine ? `linear-gradient(135deg, #eff6ff, #dbeafe)` : 'white',
                      border: mine ? '1.5px solid #93c5fd' : '1.5px solid #e2e8f0',
                      padding: '11px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: mine ? '0 4px 16px rgba(29,111,242,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Rank */}
                    <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                      {i < 3
                        ? <span style={{ fontSize: 18 }}>{MEDALS[i]}</span>
                        : <span style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8' }}>{i + 1}</span>
                      }
                    </div>

                    {/* Name + persona */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: mine ? 900 : 700,
                        color: mine ? '#1D6FF2' : '#0f172a',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.player_name}
                        {mine && <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', marginLeft: 6 }}>(Kamu)</span>}
                      </p>
                      {row.persona && (
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', margin: '1px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {row.persona}
                        </p>
                      )}
                    </div>

                    {/* Score */}
                    <div style={{
                      display: 'flex', alignItems: 'baseline', gap: 1, flexShrink: 0,
                    }}>
                      <span style={{
                        fontSize: 22, fontWeight: 900, lineHeight: 1,
                        color: mine ? '#1D6FF2' : '#475569',
                      }}>{row.score}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: mine ? '#3b82f6' : '#94a3b8' }}>%</span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Player not in top 10 */}
              {playerRankInBoard === -1 && rows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  style={{
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    border: '1.5px dashed #93c5fd',
                    padding: '11px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8' }}>…</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 900, color: '#1D6FF2', margin: 0 }}>
                      {playerName || 'Kamu'} <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>(Kamu)</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: '#1D6FF2' }}>{playerScore}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>%</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ padding: '12px 20px 24px' }}
      >
        <PrimaryButton onClick={() => actions.showFinished()}>
          Selesai →
        </PrimaryButton>
      </motion.div>
    </div>
  )
}
