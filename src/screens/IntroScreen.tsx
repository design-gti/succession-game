import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'

// ── Inline SVG icons ─────────────────────────────────────────────────────────
function IconTarget({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IconArrows({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}
function IconClock({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ── Org node positions (mini org chart) ───────────────────────────────────────
// Layout: 1 boss top, 3 mid row (left, center=vacancy, right), 3 bottom row
const NODES = [
  { id: 'boss',    x: 50,  y: 0,   color: '#1D6FF2', size: 36, isVacancy: false, isBoss: true },
  { id: 'left',   x: 15,  y: 68,  color: '#7C3AED', size: 30, isVacancy: false, isBoss: false },
  { id: 'center', x: 50,  y: 68,  color: '#ef4444', size: 30, isVacancy: true,  isBoss: false },
  { id: 'right',  x: 85,  y: 68,  color: '#0891B2', size: 30, isVacancy: false, isBoss: false },
  { id: 'bl',     x: 8,   y: 130, color: '#D97706', size: 22, isVacancy: false, isBoss: false },
  { id: 'bm1',    x: 35,  y: 130, color: '#1D6FF2', size: 22, isVacancy: false, isBoss: false },
  { id: 'bm2',    x: 58,  y: 130, color: '#7C3AED', size: 22, isVacancy: false, isBoss: false },
  { id: 'br',     x: 85,  y: 130, color: '#0891B2', size: 22, isVacancy: false, isBoss: false },
]

// Edges as [fromId, toId]
const EDGES: [string, string][] = [
  ['boss', 'left'], ['boss', 'center'], ['boss', 'right'],
  ['left', 'bl'], ['center', 'bm1'], ['center', 'bm2'], ['right', 'br'],
]

// Get center coords of a node (percentage space 0-100 wide, 0-160 tall)
function nodeCenter(n: typeof NODES[0]) {
  return { cx: n.x, cy: n.y + n.size / 2 }
}

function MiniOrgChart({ showVacancy, ripple }: { showVacancy: boolean; ripple: boolean }) {
  const W = 200, H = 160

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      {/* SVG lines */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {EDGES.map(([fromId, toId], i) => {
          const from = NODES.find(n => n.id === fromId)!
          const to   = NODES.find(n => n.id === toId)!
          const f = nodeCenter(from)
          const t = nodeCenter(to)
          const x1 = f.cx / 100 * W
          const y1 = f.cy
          const x2 = t.cx / 100 * W
          const y2 = t.cy

          const isCenterEdge = fromId === 'center' || toId === 'center'
          const opacity = isCenterEdge && !showVacancy ? 0 : (ripple && isCenterEdge ? 0.9 : 0.35)

          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isCenterEdge ? 'rgba(239,68,68,0.6)' : 'rgba(184,199,224,0.5)'}
              strokeWidth={isCenterEdge ? 1.5 : 1.5}
              strokeLinecap="round"
              strokeDasharray={isCenterEdge && ripple ? '3 3' : 'none'}
              animate={{ opacity, strokeDashoffset: ripple && isCenterEdge ? [0, -12] : 0 }}
              transition={ripple && isCenterEdge
                ? { opacity: { duration: 0.3 }, strokeDashoffset: { duration: 0.6, repeat: Infinity, ease: 'linear' } }
                : { duration: 0.4 }
              }
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {NODES.map(node => {
        const cx = node.x / 100 * W
        const cy = node.y

        if (node.isVacancy) {
          return (
            <div key={node.id} style={{ position: 'absolute', left: cx, top: cy, transform: 'translateX(-50%)' }}>
              <AnimatePresence mode="wait">
                {!showVacancy ? (
                  // Person still there, about to resign
                  <motion.div
                    key="person"
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ scale: [1, 1.1, 0], opacity: [1, 1, 0], transition: { duration: 0.45 } }}
                    style={{
                      width: node.size, height: node.size, borderRadius: '50%',
                      background: '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width={node.size * 0.5} height={node.size * 0.5} viewBox="0 0 24 24" fill="white">
                      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  </motion.div>
                ) : (
                  // Vacancy
                  <motion.div
                    key="vacant"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    style={{ position: 'relative', width: node.size, height: node.size }}
                  >
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', inset: -4, borderRadius: '50%',
                        border: '1.5px solid rgba(239,68,68,0.5)',
                      }}
                    />
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      border: '2px dashed rgba(239,68,68,0.75)',
                      background: 'rgba(254,242,242,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#ef4444', fontWeight: 900, fontSize: node.size * 0.42, lineHeight: 1 }}>?</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {showVacancy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ textAlign: 'center', marginTop: 3, fontSize: 7, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444' }}
                >
                  VACANT
                </motion.div>
              )}
            </div>
          )
        }

        return (
          <motion.div
            key={node.id}
            style={{ position: 'absolute', left: cx, top: cy, transform: 'translateX(-50%)' }}
            animate={ripple && (node.id === 'bm1' || node.id === 'bm2')
              ? { x: [0, -2, 2, -1, 0], transition: { duration: 0.5, delay: 0.3 } }
              : {}}
          >
            <div style={{
              width: node.size, height: node.size, borderRadius: '50%',
              background: node.isBoss
                ? `linear-gradient(135deg, ${node.color}, ${node.color}cc)`
                : node.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: node.isBoss ? `0 4px 12px ${node.color}40` : `0 2px 6px ${node.color}30`,
              opacity: ripple && (node.id === 'bm1' || node.id === 'bm2') ? 0.7 : 1,
            }}>
              <svg width={node.size * 0.48} height={node.size * 0.48} viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Phases of the intro sequence ──────────────────────────────────────────────
type Phase = 'org' | 'resign' | 'ripple' | 'headline' | 'mission' | 'cta'

export function IntroScreen() {
  const { actions } = useGame()
  const [phase, setPhase] = useState<Phase>('org')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('resign'),   600),
      setTimeout(() => setPhase('ripple'),   1200),
      setTimeout(() => setPhase('headline'), 1700),
      setTimeout(() => setPhase('cta'),      2400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const showVacancy  = ['ripple','headline','mission','cta'].includes(phase)
  const showRipple   = phase === 'ripple'
  const showHeadline = ['headline','mission','cta'].includes(phase)
  const showCta      = phase === 'cta'

  return (
    <div
      className="flex flex-col h-full bg-white"
    >

      {/* All elements always in DOM — only opacity/y animated, no layout shift */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-5 pt-10 pb-8">

        {/* ── Brand ── */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: '#1D6FF2', textTransform: 'uppercase' }}
        >
          Talentlytica
        </motion.p>

        {/* ── Mini org chart ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <MiniOrgChart showVacancy={showVacancy} ripple={showRipple} />
        </motion.div>

        {/* ── Headline — always in DOM, opacity-only transition ── */}
        <motion.div
          className="text-center flex flex-col gap-2"
          animate={{ opacity: showHeadline ? 1 : 0, y: showHeadline ? 0 : 10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Sales Manager kamu<br />baru saja resign.
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, fontWeight: 500, hyphens: 'none', wordBreak: 'keep-all' }}>
            Satu orang pergi, dampaknya bisa ke mana-mana.{' '}
            Susun ulang talent dan jaga organisasi tetap fit.
          </p>
        </motion.div>

        {/* ── CTA — always in DOM, opacity-only transition ── */}
        <motion.div
          style={{ width: '100%' }}
          animate={{ opacity: showCta ? 1 : 0, y: showCta ? 0 : 10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => actions.startGame()}
            disabled={!showCta}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 16,
              background: 'linear-gradient(135deg, #1D6FF2 0%, #6366f1 100%)',
              color: 'white', fontWeight: 900, fontSize: 15,
              border: 'none', cursor: showCta ? 'pointer' : 'default',
              letterSpacing: '0.01em',
              boxShadow: '0 8px 28px rgba(29,111,242,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                position: 'absolute', top: 0, left: '-100%', bottom: 0, width: '60%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                pointerEvents: 'none',
              }}
              animate={showCta ? { left: ['-100%', '200%'] } : {}}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'linear' }}
            />
            <span>Mulai Susun Organisasi</span>
            <motion.span
              animate={showCta ? { x: [0, 4, 0] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 16 }}
            >
              →
            </motion.span>
          </button>
        </motion.div>

      </div>
    </div>
  )
}
