import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

export const PLAYER_AVATARS = [
  { color: '#1D6FF2', label: 'B' },
  { color: '#7C3AED', label: 'P' },
  { color: '#059669', label: 'G' },
  { color: '#D97706', label: 'A' },
  { color: '#DC2626', label: 'R' },
  { color: '#0891B2', label: 'C' },
  { color: '#BE185D', label: 'M' },
  { color: '#16A34A', label: 'E' },
]

// ─── Cinematic intro beats (scrollytelling-style, tap or auto-advance) ────────

const TEAM_COLORS = ['#1D6FF2', '#7C3AED', '#DC2626', '#D97706', '#0891B2']

function TeamRow({ vacantIndex }: { vacantIndex: number | null }) {
  return (
    <div className="flex items-end gap-3">
      {TEAM_COLORS.map((color, i) => {
        const vacant = i === vacantIndex
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <AnimatePresence mode="wait">
              {vacant ? (
                <motion.div
                  key="vacant"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 bg-red-500/15 flex items-center justify-center"
                >
                  <span className="text-red-400 text-lg font-black">?</span>
                </motion.div>
              ) : (
                <motion.div
                  key="filled"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                    <circle cx="12" cy="8" r="4" fill="currentColor" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            {vacant && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-[9px] font-bold uppercase tracking-widest"
              >
                vacant
              </motion.span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const N_BEATS = 5

function IntroBeat({ beat }: { beat: number }) {
  switch (beat) {
    case 0:
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="text-brand text-xs font-bold tracking-[0.35em] uppercase">Talentlytica presents</p>
          <h1 className="text-5xl font-black text-[#f0f4f8] leading-tight">Fill the Seat</h1>
        </div>
      )
    case 1:
      return (
        <div className="flex flex-col items-center gap-5">
          <TeamRow vacantIndex={null} />
          <p className="text-3xl font-black text-[#f0f4f8] leading-tight">
            This is your <span className="text-brand">sales team</span>.
          </p>
        </div>
      )
    case 2:
      return (
        <div className="flex flex-col items-center gap-5">
          <TeamRow vacantIndex={2} />
          <p className="text-3xl font-black text-[#f0f4f8] leading-tight">
            This morning, your Sales Manager <span className="text-red-400">resigned</span>.
          </p>
        </div>
      )
    case 3:
      return (
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-7xl font-black text-[#f0f4f8] leading-none">14</p>
            <p className="text-white/50 text-sm uppercase tracking-widest mt-1">candidates</p>
          </div>
          <p className="text-white/30 text-4xl font-black">·</p>
          <div className="text-center">
            <p className="text-7xl font-black text-brand leading-none">1</p>
            <p className="text-white/50 text-sm uppercase tracking-widest mt-1">right choice</p>
          </div>
        </div>
      )
    case 4:
      return (
        <div className="flex items-center gap-6">
          <motion.p
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="text-9xl font-black text-amber-400 leading-none"
          >
            60
          </motion.p>
          <p className="text-3xl font-black text-[#f0f4f8] leading-tight text-left">
            seconds.<br />
            <span className="text-white/50 text-xl font-bold">That's all you get.</span>
          </p>
        </div>
      )
    default:
      return null
  }
}

export function IntroScreen() {
  const { state, actions } = useGame()
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState(0)
  const [beat, setBeat] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollRef = useRef(0)
  const touchStartY = useRef(0)
  const phase = state.phase.name
  const isFinal = beat >= N_BEATS

  function advance() {
    setScrolled(true)
    setBeat(b => Math.min(b + 1, N_BEATS))
  }

  function goBack() {
    setScrolled(true)
    setBeat(b => Math.max(b - 1, 0))
  }

  function handleWheel(e: React.WheelEvent) {
    if (isFinal) return
    const now = Date.now()
    if (now - lastScrollRef.current < 600) return
    lastScrollRef.current = now
    if (e.deltaY > 0) advance()
    else if (e.deltaY < 0) goBack()
  }

  if (phase === 'intro') {
    return (
      <div
        className="relative flex flex-col h-full items-center justify-center px-6 text-center overflow-hidden intro-drift"
        onClick={() => { if (!isFinal) advance() }}
        onWheel={handleWheel}
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
        onTouchEnd={e => {
          if (isFinal) return
          const dy = touchStartY.current - e.changedTouches[0].clientY
          if (Math.abs(dy) > 40) dy > 0 ? advance() : goBack()
        }}
      >
        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(15,23,36,0.9) 100%)' }} />

        <AnimatePresence mode="wait">
          {!isFinal ? (
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
              className="relative max-w-md"
            >
              <IntroBeat beat={beat} />
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex flex-col items-center gap-6 max-w-sm w-full"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <p className="text-brand text-xs font-semibold tracking-widest uppercase">Talentlytica</p>
                <h1 className="text-4xl font-black text-[#f0f4f8] leading-tight">Fill the Seat</h1>
                <p className="text-white/50 text-sm">Find the strongest candidate. Choose wisely.</p>
              </div>
              <TeamRow vacantIndex={2} />
              <PrimaryButton onClick={() => actions.startGame()}>
                Let's Play
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* scroll hint — visible on first beat until user interacts */}
        <AnimatePresence>
          {!isFinal && !scrolled && beat === 0 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
            >
              <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-semibold">scroll</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4l5 5 5-5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* progress dots */}
        {!isFinal && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex gap-1.5">
              {Array.from({ length: N_BEATS }).map((_, i) => (
                <div key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i === beat ? 'w-5 bg-brand' : 'w-1.5 bg-white/20'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // nameEntry
  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#f0f4f8]">What's your name?</h2>
          <p className="text-white/50 text-sm mt-1">Used for the leaderboard</p>
        </div>

        {/* Avatar picker */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest text-center mb-2">Pick your avatar</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {PLAYER_AVATARS.map((av, i) => (
              <motion.button
                key={i}
                onClick={() => setAvatarId(i)}
                whileTap={{ scale: 0.9 }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm transition-transform"
                style={{ backgroundColor: av.color }}
              >
                {name ? name.charAt(0).toUpperCase() : av.label}
                {avatarId === i && (
                  <motion.div
                    layoutId="avatar-ring"
                    className="absolute inset-[-3px] rounded-full border-2 border-white"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && actions.submitName(name, avatarId)}
          placeholder="Your name or nickname"
          maxLength={24}
          autoFocus
          className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-[#f0f4f8] text-base
            placeholder:text-white/25 outline-none focus:border-brand transition-colors"
        />
        <PrimaryButton onClick={() => actions.submitName(name, avatarId)}>
          Start →
        </PrimaryButton>
      </motion.div>
    </div>
  )
}
