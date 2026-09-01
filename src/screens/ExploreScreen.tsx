import React, { useRef, useState, useEffect, useContext, createContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { FitRingWithLabel } from '../components/FitRing'
import { getCandidateById, EXTERNAL_CANDIDATES, type Candidate, type Readiness, type Assessment } from '../data/scenario'
import { fitColor } from '../game/scoring'
import type { CandidateId, PlacementEntry, TimeFillData } from '../game/types'
import { logEvent } from '../lib/api'

// ─── Name map context ─────────────────────────────────────────────────────────
const NameMapCtx = createContext<Record<string, string>>({})
function useDisplayName(id: string, fallback: string): string {
  const map = useContext(NameMapCtx)
  return map[id] || fallback
}

// ─── Position definitions ─────────────────────────────────────────────────────

type PositionId = 'sales_manager' | 'maya' | 'dimas' | 'andi' | 'rani' | 'fajar' | 'bintang' | 'rizky'

interface PositionDef {
  id: PositionId
  role: string
  shortRole: string
  naturalOccupant: CandidateId | null
  naturalFit: number
  level: 2 | 3
  standard: Assessment  // required benchmark per aspect for this position
  brief: string         // one-line position context shown in the workspace panel
}

const POSITIONS: PositionDef[] = [
  { id: 'sales_manager', role: 'Sales Manager',      shortRole: 'Sales Mgr', naturalOccupant: null,      naturalFit: 0,  level: 2,
    standard: { leadership: 85, drive: 85, influence: 80 },
    brief: 'Pimpin tim, jaga pipeline, dan pastikan angka tercapai setiap kuartal.' },
  { id: 'maya',          role: 'CS Manager',          shortRole: 'CS Mgr',    naturalOccupant: 'maya',    naturalFit: 91, level: 2,
    standard: { leadership: 80, drive: 65, influence: 75 },
    brief: 'Jaga pelanggan tetap puas dan hubungan jangka panjang tetap terjaga.' },
  { id: 'dimas',         role: 'Marketing Manager',   shortRole: 'Mkt Mgr',   naturalOccupant: 'dimas',   naturalFit: 85, level: 2,
    standard: { leadership: 75, drive: 75, influence: 85 },
    brief: 'Bangun awareness brand dan pastikan setiap kampanye bisa diukur hasilnya.' },
  { id: 'andi',          role: 'Senior AE',           shortRole: 'Sr. AE',    naturalOccupant: 'andi',    naturalFit: 88, level: 3,
    standard: { leadership: 55, drive: 90, influence: 80 },
    brief: 'Kelola akun senior dan bantu tim junior berkembang.' },
  { id: 'rani',          role: 'Account Executive',   shortRole: 'AE',        naturalOccupant: 'rani',    naturalFit: 90, level: 3,
    standard: { leadership: 50, drive: 85, influence: 75 },
    brief: 'Rawat klien existing dan cari peluang upsell dari hubungan yang sudah ada.' },
  { id: 'fajar',         role: 'BD Executive',        shortRole: 'BD Exec',   naturalOccupant: 'fajar',   naturalFit: 82, level: 3,
    standard: { leadership: 55, drive: 85, influence: 85 },
    brief: 'Buka peluang bisnis baru dan masuk ke territory yang belum tersentuh.' },
  { id: 'bintang',       role: 'CS Representative',   shortRole: 'CS Rep',    naturalOccupant: 'bintang', naturalFit: 80, level: 3,
    standard: { leadership: 45, drive: 65, influence: 65 },
    brief: 'Jadi titik kontak pertama pelanggan, responsif dan tenang saat ada eskalasi.' },
  { id: 'rizky',         role: 'Mkt Specialist',      shortRole: 'Mkt Spec',  naturalOccupant: 'rizky',   naturalFit: 79, level: 3,
    standard: { leadership: 45, drive: 70, influence: 75 },
    brief: 'Eksekusi kampanye digital dan pastikan setiap channel terukur performanya.' },
]

const ASPECT_LABELS: { key: keyof Assessment; label: string }[] = [
  { key: 'leadership', label: 'LEAD' },
  { key: 'drive',      label: 'DRIVE' },
  { key: 'influence',  label: 'INFL' },
]

const ASPECT_CONFIG: Record<keyof Assessment, {
  color: string; gradFrom: string; gradTo: string
  rowBg: string; iconBg: string; glow: string
  icon: React.ReactNode
}> = {
  leadership: {
    color: '#3B82F6',
    gradFrom: '#93C5FD',
    gradTo: '#3B82F6',
    rowBg: 'rgba(59,130,246,0.05)',
    iconBg: 'rgba(59,130,246,0.12)',
    glow: 'rgba(59,130,246,0.35)',
    icon: (
      // Shield/badge leadership icon
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 3.5V7.5C2 11 5 13.8 8 15C11 13.8 14 11 14 7.5V3.5L8 1Z" fill="#3B82F6" opacity="0.9"/>
        <path d="M6 8L7.5 9.5L10.5 6.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  drive: {
    color: '#8B5CF6',
    gradFrom: '#C4B5FD',
    gradTo: '#8B5CF6',
    rowBg: 'rgba(139,92,246,0.05)',
    iconBg: 'rgba(139,92,246,0.12)',
    glow: 'rgba(139,92,246,0.35)',
    icon: (
      // Rocket drive icon
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path d="M8 1C8 1 11 3 11 7L9.5 8.5L7.5 8.5L6 7C6 3 8 1 8 1Z" fill="#8B5CF6" opacity="0.9"/>
        <path d="M6 7L5 10L7 9M10 7L11 10L9 9" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="8" cy="6.5" r="1" fill="white" opacity="0.9"/>
        <path d="M6.5 10.5C6.5 11.5 7 12.5 8 13C9 12.5 9.5 11.5 9.5 10.5" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  influence: {
    color: '#06B6D4',
    gradFrom: '#A5F3FC',
    gradTo: '#06B6D4',
    rowBg: 'rgba(6,182,212,0.05)',
    iconBg: 'rgba(6,182,212,0.12)',
    glow: 'rgba(6,182,212,0.35)',
    icon: (
      // People/network influence icon
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="2" fill="#06B6D4" opacity="0.9"/>
        <circle cx="3.5" cy="8" r="1.5" fill="#06B6D4" opacity="0.7"/>
        <circle cx="12.5" cy="8" r="1.5" fill="#06B6D4" opacity="0.7"/>
        <path d="M5.5 6.5L3.5 8M10.5 6.5L12.5 8" stroke="#06B6D4" strokeWidth="1" strokeLinecap="round"/>
        <path d="M4 11C4 10 5.8 9.5 8 9.5C10.2 9.5 12 10 12 11" stroke="#06B6D4" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
}

const INITIAL_ASSIGNMENTS: Partial<Record<PositionId, CandidateId>> = {
  maya: 'maya', dimas: 'dimas', andi: 'andi', rani: 'rani', fajar: 'fajar',
  bintang: 'bintang', rizky: 'rizky',
}

const FLOAT_DELAYS: Partial<Record<PositionId, number>> = {
  maya: 0, dimas: 0.7, andi: 0.3, rani: 1.0, fajar: 1.6,
  bintang: 0.5, rizky: 0.9,
}

function getSlotFit(posId: PositionId, occupant: CandidateId): number {
  if (posId === 'sales_manager') return getCandidateById(occupant).roleFit
  const pos = POSITIONS.find(p => p.id === posId)!
  if (occupant === pos.naturalOccupant) return pos.naturalFit
  // Non-natural placement: calculate dynamically from assessment vs position standard
  const c = getCandidateById(occupant)
  if (c.assessment) {
    const keys: (keyof Assessment)[] = ['leadership', 'drive', 'influence']
    const avg = keys.reduce((sum, k) => sum + Math.min(c.assessment![k] / pos.standard[k], 1), 0) / keys.length
    return Math.round(avg * 100)
  }
  return getCandidateById(occupant).naturalFit ?? 78
}

function computeOverallFit(assignments: Partial<Record<PositionId, CandidateId>>): number {
  let total = 0
  for (const pos of POSITIONS) {
    const occupant = assignments[pos.id]
    total += occupant ? getSlotFit(pos.id, occupant) : 0
  }
  return Math.round(total / POSITIONS.length)
}

// ─── ReadinessBadge ──────────────────────────────────────────────────────────

const READINESS_CONFIG: Record<Readiness, { label: string; color: string }> = {
  now:  { label: 'Ready Now', color: '#16a34a' },
  '6mo': { label: '6 Months',  color: '#d97706' },
  '1yr': { label: '1 Year',    color: '#ea580c' },
  '2yr': { label: '2+ Years',  color: '#dc2626' },
}

function ReadinessBadge({ readiness, tiny = false }: { readiness: Readiness; tiny?: boolean }) {
  const cfg = READINESS_CONFIG[readiness]
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-bold leading-none ${tiny ? 'text-[5.5px] px-1 py-[1.5px]' : 'text-[6px] px-1.5 py-[2px]'}`}
      style={{ backgroundColor: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}40` }}
    >
      <span className={`rounded-full flex-shrink-0 ${tiny ? 'w-[3px] h-[3px]' : 'w-[4px] h-[4px]'}`}
        style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  )
}

// ─── AspectBars ──────────────────────────────────────────────────────────────

function aspectColor(value: number, std: number): string {
  if (value >= std) return '#22c55e'
  if (value >= std - 10) return '#f59e0b'
  return '#ef4444'
}

function AspectBars({ assessment, standard, showStandard = true }: { assessment: Assessment | null; standard: Assessment; showStandard?: boolean }) {
  return (
    <div className="w-full flex flex-col gap-[3px]">
      {ASPECT_LABELS.map(({ key, label }) => {
        const std = standard[key]
        const value = assessment?.[key] ?? null
        const barColor = showStandard && value !== null ? aspectColor(value, std) : '#1D6FF2'
        const textColor = showStandard && value !== null ? aspectColor(value, std) : '#64748b'
        return (
          <div key={key} className="flex items-center gap-1">
            <span className="text-slate-400 text-[5.5px] font-bold tracking-wider w-[26px] text-right flex-shrink-0">{label}</span>
            <div className="relative flex-1 h-[5px] rounded-full bg-slate-200 overflow-visible">
              {value !== null && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: barColor }}
                />
              )}
              {value === null && (
                <div className="absolute inset-y-0 left-0 rounded-full bg-brand/50" style={{ width: `${std}%` }} />
              )}
              {showStandard && (
                <div className="absolute top-[-1.5px] bottom-[-1.5px] w-[1.5px] bg-slate-500 rounded-full" style={{ left: `${std}%` }} />
              )}
            </div>
            <span
              className="text-[5.5px] font-bold w-[12px] flex-shrink-0 tabular-nums"
              style={{ color: value !== null ? textColor : '#1D6FF2' }}
            >
              {value ?? std}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── ActiveBubble wrapper — selected avatar state ─────────────────────────────

function ActiveBubble({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  const [showRipple, setShowRipple] = useState(false)
  const wasActive = useRef(false)

  useEffect(() => {
    if (isActive && !wasActive.current) setShowRipple(true)
    wasActive.current = isActive
  }, [isActive])

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Rotating gradient ring — persistent while active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="animate-spin-slow"
            style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, rgba(29,111,242,0.7), rgba(103,232,249,0.45), rgba(147,197,253,0.3), rgba(29,111,242,0.7))',
              WebkitMask: 'radial-gradient(circle, transparent 71%, black 75%)',
              mask: 'radial-gradient(circle, transparent 71%, black 75%)',
              pointerEvents: 'none', zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>

      {/* Single-shot ripple on selection */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            key="ripple"
            style={{
              position: 'absolute', inset: -1, borderRadius: '50%',
              border: '1.5px solid rgba(29,111,242,0.55)',
              pointerEvents: 'none', zIndex: 10,
            }}
            initial={{ scale: 0.98, opacity: 0.72 }}
            animate={{ scale: 1.82, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => setShowRipple(false)}
          />
        )}
      </AnimatePresence>

      {/* Float up */}
      <motion.div
        animate={isActive ? { y: -5 } : { y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {/* Inflate (spring overshoot gives 1→1.10→1.06) + breathing loop */}
        <motion.div
          animate={isActive
            ? { scale: [1, 1.10, 1.06, 1.085, 1.06] }
            : { scale: 1 }
          }
          transition={isActive
            ? { duration: 3.2, times: [0, 0.07, 0.16, 0.58, 1], ease: 'easeInOut', repeat: Infinity }
            : { duration: 0.18, ease: 'easeOut' }
          }
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── OrgCircle ────────────────────────────────────────────────────────────────

type NodeSize = 'sm' | 'md' | 'lg'
const NODE_AVATAR_SIZE: Record<NodeSize, 'sm' | 'md' | 'lg'> = { sm: 'sm', md: 'md', lg: 'lg' }
const NODE_NAME_SIZE: Record<NodeSize, string> = { sm: 'text-[7px]', md: 'text-[9px]', lg: 'text-[11px]' }
const NODE_ROLE_SIZE: Record<NodeSize, string> = { sm: 'text-[5.5px]', md: 'text-[7px]', lg: 'text-[8.5px]' }
const NODE_CHECK_SIZE: Record<NodeSize, string> = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
const NODE_FIT_W: Record<NodeSize, string> = { sm: 'w-5', md: 'w-8', lg: 'w-11' }

function OrgCircle({
  filled = false,
  name,
  role,
  candidateId,
  posId,
  nodeSize = 'md',
  className = '',
  isActive = false,
  softDimmed = false,
}: {
  filled?: boolean
  name: string
  role: string
  candidateId?: CandidateId
  posId?: PositionId
  nodeSize?: NodeSize
  className?: string
  isActive?: boolean
  softDimmed?: boolean
}) {
  const firstName = name.split(' ')[0]
  const shortRole = role.split(' ').slice(0, 2).join(' ')

  return (
    <div
      className={`flex flex-col items-center gap-1 flex-shrink-0 ${className}`}
      style={{ opacity: softDimmed ? 0.88 : 1, transition: 'opacity 0.2s' }}
    >
      <div className="relative">
        <ActiveBubble isActive={isActive}>
          <Avatar id={candidateId} name={name} size={NODE_AVATAR_SIZE[nodeSize]} />
        </ActiveBubble>
        {filled && (
          <div className={`absolute -bottom-0.5 -right-0.5 z-10 ${NODE_CHECK_SIZE[nodeSize]} rounded-full bg-green-500 flex items-center justify-center border-[1.5px] border-white shadow-sm`}>
            <span className="text-white text-[7px] font-black leading-none">✓</span>
          </div>
        )}
      </div>
      <p className={`text-[#0f172a] font-bold leading-none text-center ${NODE_NAME_SIZE[nodeSize]}`}>
        {firstName}
      </p>
      <p className={`text-slate-500 leading-none text-center truncate max-w-[72px] ${NODE_ROLE_SIZE[nodeSize]}`}>
        {shortRole}
      </p>
      {candidateId && posId && (() => {
        const fit = getSlotFit(posId, candidateId)
        return (
          <div className="flex items-center gap-0.5 mt-0.5">
            <div className={`${NODE_FIT_W[nodeSize]} h-[3px] rounded-full bg-slate-100 overflow-hidden`}>
              <div className="h-full rounded-full" style={{ width: `${fit}%`, backgroundColor: fitColor(fit) }} />
            </div>
            <p className="text-[7px] font-bold" style={{ color: fitColor(fit) }}>{fit}%</p>
          </div>
        )
      })()}
    </div>
  )
}

// ─── ActiveVacancy ────────────────────────────────────────────────────────────

const NODE_SZ_PX: Record<NodeSize, number> = { sm: 32, md: 48, lg: 64 }

function ActiveVacancy({ nodeRef, isDragOver, posId, nodeSize = 'md' }: {
  nodeRef: React.RefObject<HTMLDivElement>
  isDragOver: boolean
  posId: PositionId
  nodeSize?: NodeSize
}) {
  const pos = POSITIONS.find(p => p.id === posId)!
  const sz = NODE_SZ_PX[nodeSize]
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div
        ref={nodeRef}
        data-tutorial="vacant"
        style={{
          width: sz, height: sz, borderRadius: '50%',
          border: `2px dashed ${isDragOver ? '#22c55e' : 'rgba(239,68,68,0.8)'}`,
          background: isDragOver ? '#f0fdf4' : '#fff5f5',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 2, position: 'relative', flexShrink: 0,
          transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
          boxShadow: isDragOver ? '0 0 0 4px rgba(34,197,94,0.2)' : undefined,
        }}
      >
        {!isDragOver && (
          <div
            style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '1.5px dashed rgba(239,68,68,0.25)' }}
            className="animate-spin-slow pointer-events-none"
          />
        )}
        <svg width={sz * 0.38} height={sz * 0.38} viewBox="0 0 24 24" fill="none"
          style={{ color: isDragOver ? '#22c55e' : '#ef4444' }}>
          <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.5" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        </svg>
        <p style={{ color: isDragOver ? '#16a34a' : '#ef4444', fontSize: nodeSize === 'lg' ? 7 : 6, fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
          {isDragOver ? '✓ Drop' : 'Vacant'}
        </p>
      </div>
      <p className={`text-[#0f172a] font-bold leading-none text-center ${NODE_NAME_SIZE[nodeSize]}`}>
        {pos.shortRole.split(' ')[0]}
      </p>
      <p className={`text-slate-500 leading-none text-center truncate max-w-[72px] ${NODE_ROLE_SIZE[nodeSize]}`}>
        {pos.shortRole}
      </p>
    </div>
  )
}

// ─── QueuedVacancy ────────────────────────────────────────────────────────────

function QueuedVacancy({ posId, nodeSize = 'md', daysVacant = 0 }: { posId: PositionId; nodeSize?: NodeSize; daysVacant?: number }) {
  const pos = POSITIONS.find(p => p.id === posId)!
  const sz = NODE_SZ_PX[nodeSize]
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0 opacity-45">
      <div style={{
        width: sz, height: sz, borderRadius: '50%', flexShrink: 0,
        border: '1.5px dashed rgba(180,130,0,0.45)',
        background: 'rgba(251,191,36,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <p style={{ color: '#b45309', fontSize: nodeSize === 'lg' ? 7 : 6, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Next</p>
        {daysVacant > 0 && (
          <p style={{ color: '#b45309', fontSize: 5.5, fontWeight: 700, lineHeight: 1 }}>{daysVacant}h</p>
        )}
      </div>
      <p className={`text-[#0f172a] font-bold leading-none text-center ${NODE_NAME_SIZE[nodeSize]}`}>
        {pos.shortRole.split(' ')[0]}
      </p>
      <p className={`text-slate-500 leading-none text-center truncate max-w-[72px] ${NODE_ROLE_SIZE[nodeSize]}`}>
        {pos.shortRole}
      </p>
    </div>
  )
}

// ─── BubblePop — glass burst effect at drop point ────────────────────────────

const BURST_PARTICLES = [
  { angle: 0,   dist: 0.72, sz: 3.5, delay: 0.00 },
  { angle: 60,  dist: 0.80, sz: 4.2, delay: 0.03 },
  { angle: 120, dist: 0.70, sz: 3.0, delay: 0.01 },
  { angle: 180, dist: 0.78, sz: 4.5, delay: 0.04 },
  { angle: 240, dist: 0.76, sz: 3.2, delay: 0.02 },
  { angle: 300, dist: 0.82, sz: 3.8, delay: 0.05 },
]

function BubblePop({ sizePx, onDone }: { sizePx: number; onDone: () => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {/* Primary expanding glass ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1.5px solid rgba(130,210,255,0.75)' }}
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.30, ease: [0.2, 0, 0.6, 1] }}
        onAnimationComplete={onDone}
      />
      {/* Secondary ring — offset timing */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1px solid rgba(200,235,255,0.5)' }}
        initial={{ scale: 1, opacity: 0.55 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut', delay: 0.06 }}
      />
      {/* Particles radiating outward */}
      {BURST_PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const tx = Math.cos(rad) * sizePx * p.dist
        const ty = Math.sin(rad) * sizePx * p.dist
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: p.sz, height: p.sz,
              marginLeft: -p.sz / 2, marginTop: -p.sz / 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,225,255,0.95) 0%, rgba(120,195,255,0.4) 60%, transparent 100%)',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
            transition={{ duration: 0.28 + p.delay, ease: 'easeOut', delay: p.delay + 0.03 }}
          />
        )
      })}
    </div>
  )
}

// ─── DraggableSlot ────────────────────────────────────────────────────────────

function DraggableSlot({ id, posId, onDrop, onDragMove, onDragStart, onDragEnd, onSelect, onUnplace, dimmed, softDimmed, isActive, floatDelay = 0, nodeSize = 'md', isTargeted = false }: {
  id: CandidateId
  posId: PositionId
  onDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
  onUnplace?: () => void
  dimmed?: boolean
  softDimmed?: boolean
  isActive?: boolean
  floatDelay?: number
  nodeSize?: NodeSize
  isTargeted?: boolean
}) {
  const [placed, setPlaced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const c = getCandidateById(id)
  const displayName = useDisplayName(id, c.name)
  const avatarPx = NODE_SZ_PX[nodeSize]

  const slotFit = getSlotFit(posId, id)

  if (placed) {
    return <OrgCircle name={displayName} role={c.currentRole} candidateId={id} posId={posId} nodeSize={nodeSize} />
  }

  return (
    <motion.div
      ref={cardRef}
      drag
      dragSnapToOrigin
      dragElastic={0.45}
      dragMomentum={false}
      animate={{
        y: dimmed ? 0 : [0, -3, 0],
        opacity: dimmed ? 0.3 : 1,
        scale: dimmed ? 0.96 : 1,
      }}
      transition={{
        y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: floatDelay },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      }}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
        setIsDragging(true)
        onDragStart?.()
      }}
      onDrag={(_, info) => {
        if (dragOrigin.current) {
          onDragMove({ x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y })
        }
      }}
      onDragEnd={(_, info) => {
        const pt = dragOrigin.current
          ? { x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y }
          : null
        dragOrigin.current = null
        setIsDragging(false)
        onDragMove(null)
        onDragEnd?.()
        const dropped = pt && onDrop(id, pt)
        if (dropped) { setPlaced(true); return }
        // If drag was far enough and no vacancy accepted it, unplace so user can rearrange
        const dist = Math.abs(info.offset.x) + Math.abs(info.offset.y)
        if (dist > 30 && onUnplace) onUnplace()
      }}
      className={`relative cursor-grab active:cursor-grabbing select-none ${isDragging ? 'bubble-dragging' : ''}`}
      style={{ touchAction: 'none', zIndex: isDragging ? 999 : 'auto' }}
    >
      <OrgCircle name={displayName} role={c.currentRole} candidateId={id} posId={posId} nodeSize={nodeSize} isActive={isActive} softDimmed={softDimmed} />
      <AnimatePresence>
        {isTargeted && !isDragging && (
          <motion.div
            key="target"
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg pointer-events-none select-none z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            🎯
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── PlacedSlot ───────────────────────────────────────────────────────────────

function PlacedSlot({ id, posId, onMove, onUnplace, onDragMove, onDragStart, onDragEnd, onSelect, nodeSize = 'md', isActive, softDimmed }: {
  id: CandidateId
  posId: PositionId
  onMove: (point: { x: number; y: number }) => boolean
  onUnplace: () => void
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
  nodeSize?: NodeSize
  isActive?: boolean
  softDimmed?: boolean
}) {
  const c = getCandidateById(id)
  const displayName = useDisplayName(id, c.name)
  const realFit = getSlotFit(posId, id)
  const [displayFit, setDisplayFit] = useState(0)
  const [showPop, setShowPop] = useState(true)
  const [removed, setRemoved] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const avatarPx = NODE_SZ_PX[nodeSize]

  useEffect(() => {
    const start = Date.now()
    const duration = 700
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayFit(Math.round(realFit * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [realFit])

  const fitEmoji = realFit >= 85 ? '🎉' : realFit >= 70 ? '😊' : realFit >= 55 ? '😐' : '😬'
  const [showEmoji, setShowEmoji] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowEmoji(false), 1600)
    return () => clearTimeout(t)
  }, [])

  if (removed) return null

  return (
    <motion.div
      ref={cardRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${isDragging ? 'bubble-dragging' : 'animate-bubble-reform'}`}
      style={{ touchAction: 'none', zIndex: isDragging ? 999 : 'auto' }}
      drag
      dragMomentum={false}
      dragElastic={0.3}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
        setIsDragging(true)
        onDragStart?.()
      }}
      onDrag={(_, info) => {
        if (dragOrigin.current) {
          onDragMove({ x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y })
        }
      }}
      onDragEnd={(_, info) => {
        const pt = dragOrigin.current
          ? { x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y }
          : null
        dragOrigin.current = null
        setIsDragging(false)
        onDragMove(null)
        onDragEnd?.()
        const dist = Math.abs(info.offset.x) + Math.abs(info.offset.y)
        if (dist <= 20) return
        if (pt && onMove(pt)) { setRemoved(true); return }
        setRemoved(true); onUnplace()
      }}
    >
      {showPop && (
        <BubblePop sizePx={avatarPx} onDone={() => setShowPop(false)} />
      )}
      {showEmoji && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg z-30 pointer-events-none select-none"
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -14, opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          {fitEmoji}
        </motion.div>
      )}
      <OrgCircle
        filled
        name={displayName}
        role={c.currentRole}
        candidateId={id}
        posId={posId}
        nodeSize={nodeSize}
        isActive={isActive}
        softDimmed={softDimmed}
      />
    </motion.div>
  )
}

// ─── Connector helpers ────────────────────────────────────────────────────────

function VLine({ glow = false }: { glow?: boolean }) {
  return (
    <div className={`w-px h-2 mx-auto flex-shrink-0 transition-all duration-300
      ${glow ? 'bg-slate-400 shadow-sm' : 'bg-slate-300'}`} />
  )
}

function GhostNode({ name, role }: { name: string; role: string }) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex flex-col items-center gap-[3px] opacity-[0.35] flex-shrink-0">
      <div style={{
        width: 30, height: 30, borderRadius: '50%', background: '#94a3b8',
        boxShadow: '0 0 0 2px white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.3) 0%, transparent 55%)' }} />
        <span style={{ color: 'white', fontWeight: 900, fontSize: 9, position: 'relative' }}>{initials}</span>
      </div>
      <p className="text-[#0f172a] font-bold text-[6px] leading-none">{name.split(' ')[0]}</p>
      <p className="text-slate-400 text-[5px] leading-none truncate max-w-[40px]">{role.split(' ')[0]}</p>
    </div>
  )
}

function BossNode() {
  const name = useDisplayName('reza', 'Reza')
  return (
    <div className="flex flex-col items-center gap-[3px] opacity-40 flex-shrink-0">
      <Avatar id="reza" name={name} size="md" />
      <p className="text-[#0f172a] font-bold text-[8px] leading-none">{name}</p>
      <p className="text-slate-500 text-[6.5px] leading-none">Commercial Dir</p>
    </div>
  )
}

// ─── Arc gauge ───────────────────────────────────────────────────────────────

function ArcGauge({ value }: { value: number }) {
  const r = 48, cx = 60, cy = 62
  const arcLen = Math.PI * r
  const offset = arcLen * (1 - value / 100)
  const color = fitColor(value)
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`

  return (
    <svg viewBox="0 0 120 70" className="w-full h-auto">
      <path d={d} fill="none" stroke="#dee2e6" strokeWidth="9" strokeLinecap="round" />
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={arcLen}
        animate={{ strokeDashoffset: offset }}
        initial={{ strokeDashoffset: arcLen }}
        transition={{ type: 'spring', damping: 18, stiffness: 90 }}
      />
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize="20" fontWeight="900"
        fill={color} fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">{value}%</text>
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="6.5" fill="#6c757d"
        fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        letterSpacing="0.07em">TEAM FITNESS</text>
    </svg>
  )
}

// ─── Org Tree ─────────────────────────────────────────────────────────────────

function OrgTree({
  assignments, activeVacancyId, vacancyQueue, nodeRef, isDragOver, onDrop, onDragMove,
  activeDragId, onDragStart, onDragEnd, onUnplace, onMovePlaced, onSelect, onSelectVacant, onExplore,
  selectedCandidateId, initialZoom = 1.0, currentDay = 1, vacancyOpenedAt = {},
}: {
  assignments: Partial<Record<PositionId, CandidateId>>
  activeVacancyId: PositionId | null
  vacancyQueue: PositionId[]
  nodeRef: React.RefObject<HTMLDivElement>
  isDragOver: boolean
  onDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onDragMove: (point: { x: number; y: number } | null) => void
  activeDragId: CandidateId | null
  onDragStart: (id: CandidateId) => void
  onDragEnd: () => void
  onUnplace: (posId: PositionId) => void
  onMovePlaced: (fromPosId: PositionId, candidateId: CandidateId, point: { x: number; y: number }) => boolean
  onSelect: (id: CandidateId, posId?: PositionId) => void
  onSelectVacant: (posId: PositionId) => void
  onExplore?: () => void
  selectedCandidateId?: CandidateId | null
  initialZoom?: number
  currentDay?: number
  vacancyOpenedAt?: Partial<Record<PositionId, number>>
}) {
  const isDragging = activeDragId !== null
  const [zoom, setZoom] = useState(initialZoom)
  const zoomRef = useRef(initialZoom)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const panXRef = useRef(0)
  const panYRef = useRef(0)
  const [explored, setExplored] = useState(false)
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { zoomRef.current = zoom }, [zoom])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    // ── Pan ────────────────────────────────────────────────────────────────
    let panPointerId: number | null = null
    let panStart: { x: number; y: number; px: number; py: number } | null = null
    let panMoved = false

    function onPointerDown(e: PointerEvent) {
      if (pinchActive) return
      // Don't intercept card drags (cards have cursor-grab class)
      if ((e.target as Element).closest('.cursor-grab')) return
      panPointerId = e.pointerId
      panStart = { x: e.clientX, y: e.clientY, px: panXRef.current, py: panYRef.current }
      panMoved = false
    }
    function onPointerMove(e: PointerEvent) {
      if (e.pointerId !== panPointerId || !panStart || pinchActive) return
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      if (!panMoved && Math.hypot(dx, dy) < 8) return
      panMoved = true
      panXRef.current = panStart.px + dx
      panYRef.current = panStart.py + dy
      setPanX(panXRef.current)
      setPanY(panYRef.current)
      if (!explored) { setExplored(true); onExplore?.() }
    }
    function onPointerUp(e: PointerEvent) {
      if (e.pointerId === panPointerId) { panStart = null; panPointerId = null }
    }

    // ── Pinch zoom ─────────────────────────────────────────────────────────
    let pinchActive = false
    let startDist: number | null = null
    let startZoom = 1.0

    function pinchDist(e: TouchEvent) {
      return Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault(); e.stopPropagation()
        pinchActive = true; panStart = null
        startDist = pinchDist(e); startZoom = zoomRef.current
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && startDist !== null) {
        e.preventDefault(); e.stopPropagation()
        const next = Math.min(1.8, Math.max(0.35, startZoom * (pinchDist(e) / startDist)))
        zoomRef.current = next; setZoom(next)
      }
    }
    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        if (startDist !== null) { e.stopPropagation(); e.preventDefault() }
        startDist = null; pinchActive = false
      }
    }

    // ── Scroll-wheel zoom ──────────────────────────────────────────────────
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      const next = Math.min(1.8, Math.max(0.35, zoomRef.current * factor))
      zoomRef.current = next; setZoom(next)
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('touchstart', onTouchStart, { passive: false, capture: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    el.addEventListener('touchend', onTouchEnd, { capture: true })
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('touchstart', onTouchStart, { capture: true } as EventListenerOptions)
      el.removeEventListener('touchmove', onTouchMove, { capture: true } as EventListenerOptions)
      el.removeEventListener('touchend', onTouchEnd, { capture: true } as EventListenerOptions)
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  function changeZoom(delta: number) {
    const next = Math.min(1.8, Math.max(0.35, zoomRef.current + delta))
    zoomRef.current = next
    setZoom(next)
  }
  function renderSlot(posId: PositionId, nodeSize: NodeSize = 'md') {
    const daysVacant = vacancyOpenedAt[posId] != null ? Math.max(0, currentDay - vacancyOpenedAt[posId]!) : 0
    if (posId === activeVacancyId) {
      return <div onClick={() => onSelectVacant(posId)} className="cursor-pointer"><ActiveVacancy nodeRef={nodeRef} isDragOver={isDragOver} posId={posId} nodeSize={nodeSize} /></div>
    }
    if (vacancyQueue.includes(posId) && !assignments[posId]) {
      return <div onClick={() => onSelectVacant(posId)} className="cursor-pointer"><QueuedVacancy posId={posId} nodeSize={nodeSize} daysVacant={daysVacant} /></div>
    }
    const occupant = assignments[posId]
    if (!occupant) return <div onClick={() => onSelectVacant(posId)} className="cursor-pointer"><QueuedVacancy posId={posId} nodeSize={nodeSize} daysVacant={daysVacant} /></div>
    const isNatural = occupant === (posId as string)
    const isActive = selectedCandidateId === occupant
    const softDimmed = !!selectedCandidateId && !isActive
    const slotNode = isNatural ? (
      <DraggableSlot
        key={occupant}
        id={occupant} posId={posId} onDrop={onDrop} onDragMove={onDragMove}
        onDragStart={() => onDragStart(occupant)}
        onDragEnd={onDragEnd}
        onSelect={() => onSelect(occupant, posId)}
        onUnplace={() => onUnplace(posId)}
        dimmed={isDragging && activeDragId !== occupant}
        softDimmed={softDimmed}
        isActive={isActive}
        floatDelay={FLOAT_DELAYS[posId] ?? 0}
        nodeSize={nodeSize}
        isTargeted={isDragOver && activeDragId === occupant}
      />
    ) : (
      <PlacedSlot
        key={occupant}
        id={occupant} posId={posId}
        onMove={(pt) => onMovePlaced(posId, occupant, pt)}
        onUnplace={() => onUnplace(posId)}
        onDragMove={onDragMove}
        onDragStart={() => onDragStart(occupant)}
        onDragEnd={onDragEnd}
        onSelect={() => onSelect(occupant, posId)}
        nodeSize={nodeSize}
        isActive={isActive}
        softDimmed={softDimmed}
      />
    )
    if (posId === 'andi') {
      return <div data-tutorial="internal-card">{slotNode}</div>
    }
    return slotNode
  }

  // Bubble field — positions, sizes, hierarchy edges
  // x/y = center of the avatar circle; nodeSize drives avatar px
  const BUBBLE_LAYOUT: Array<{ posId: PositionId; x: number; y: number; nodeSize: NodeSize }> = [
    { posId: 'maya',          x: 70,  y: 85,  nodeSize: 'lg' },
    { posId: 'sales_manager', x: 200, y: 85,  nodeSize: 'lg' },
    { posId: 'dimas',         x: 330, y: 85,  nodeSize: 'lg' },
    { posId: 'bintang',       x: 40,  y: 212, nodeSize: 'sm' },
    { posId: 'andi',          x: 115, y: 218, nodeSize: 'md' },
    { posId: 'rani',          x: 200, y: 242, nodeSize: 'md' },
    { posId: 'fajar',         x: 285, y: 218, nodeSize: 'md' },
    { posId: 'rizky',         x: 362, y: 212, nodeSize: 'sm' },
  ]
  // Boss position (center-top, dimmed)
  const BOSS_X = 200, BOSS_Y = 10, BOSS_SZ = 48
  // Avatar sizes in px
  const AV_SZ: Record<NodeSize, number> = { sm: 32, md: 48, lg: 64 }
  // Hierarchy edges: [parentX, parentCY, childX, childCY]
  // CY = y + avatarSz/2
  const bossCY = BOSS_Y + BOSS_SZ / 2
  const EDGES = [
    [BOSS_X, bossCY, 70,  85  + AV_SZ.lg / 2],  // reza → maya
    [BOSS_X, bossCY, 200, 85  + AV_SZ.lg / 2],  // reza → sales_manager
    [BOSS_X, bossCY, 330, 85  + AV_SZ.lg / 2],  // reza → dimas
    [70,  85  + AV_SZ.lg / 2, 40,  212 + AV_SZ.sm / 2],  // maya → bintang
    [200, 85  + AV_SZ.lg / 2, 115, 218 + AV_SZ.md / 2],  // sm → andi
    [200, 85  + AV_SZ.lg / 2, 200, 242 + AV_SZ.md / 2],  // sm → rani
    [200, 85  + AV_SZ.lg / 2, 285, 218 + AV_SZ.md / 2],  // sm → fajar
    [330, 85  + AV_SZ.lg / 2, 362, 212 + AV_SZ.sm / 2],  // dimas → rizky
  ]
  const CANVAS_W = 400, CANVAS_H = 330

  return (
    <div ref={outerRef} className="flex-1 min-h-0 overflow-hidden dot-grid relative" style={{ cursor: isDragging ? 'default' : 'grab' }}>
    {/* Zoom controls */}
    <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1">
      <button
        onClick={() => changeZoom(0.15)}
        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 text-base font-bold flex items-center justify-center active:scale-90 transition-all select-none shadow-sm"
      >+</button>
      <button
        onClick={() => changeZoom(-0.15)}
        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 text-base font-bold flex items-center justify-center active:scale-90 transition-all select-none shadow-sm"
      >−</button>
    </div>
    {/* Bubble canvas */}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div
        style={{
          position: 'relative', width: CANVAS_W, height: CANVAS_H, flexShrink: 0,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {/* SVG hierarchy lines — rendered first so bubbles sit on top */}
        <svg
          width={CANVAS_W} height={CANVAS_H}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          {EDGES.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isDragging ? 'rgba(148,163,184,0.55)' : 'rgba(148,163,184,0.35)'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Boss node — center top, dimmed */}
        <div style={{ position: 'absolute', left: BOSS_X, top: BOSS_Y, transform: 'translate(-50%, 0)' }}>
          <BossNode />
        </div>

        {/* All position slots */}
        {BUBBLE_LAYOUT.map(({ posId, x, y, nodeSize }) => (
          <div key={posId} data-posid={posId} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, 0)' }}>
            {renderSlot(posId, nodeSize)}
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

// ─── ExternalCandidateSlot ────────────────────────────────────────────────────

function ExternalCandidateSlot({ candidate, alreadyPlaced, onDrop, onDragMove, onDragStart, onDragEnd, onSelect, dimmed, isActive, softDimmed }: {
  candidate: Candidate
  alreadyPlaced: boolean
  onDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
  dimmed?: boolean
  isActive?: boolean
  softDimmed?: boolean
}) {
  const [placed, setPlaced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const displayName = useDisplayName(candidate.id, candidate.name)

  useEffect(() => {
    if (!alreadyPlaced) setPlaced(false)
  }, [alreadyPlaced])

  if (placed || alreadyPlaced) {
    return (
      <div onClick={() => onSelect?.()} className="flex flex-col items-center gap-1 opacity-35 select-none flex-shrink-0 cursor-pointer">
        <div className="relative">
          <Avatar id={candidate.id} name={displayName} size="md" />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border-[1.5px] border-white shadow-sm">
            <span className="text-white text-[7px] font-black leading-none">✓</span>
          </div>
        </div>
        <p className="text-[#0f172a] font-bold text-[8px] leading-none">{displayName.split(' ')[0]}</p>
      </div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      drag dragSnapToOrigin dragElastic={0.45} dragMomentum={false}
      animate={{ opacity: dimmed ? 0.3 : 1, scale: dimmed ? 0.95 : 1 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
        setIsDragging(true)
        onDragStart?.()
      }}
      onDrag={(_, info) => {
        if (dragOrigin.current) {
          onDragMove({ x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y })
        }
      }}
      onDragEnd={(_, info) => {
        const pt = dragOrigin.current
          ? { x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y }
          : null
        dragOrigin.current = null
        setIsDragging(false)
        onDragMove(null)
        onDragEnd?.()
        if (pt && onDrop(candidate.id, pt)) setPlaced(true)
      }}
      className={`flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none flex-shrink-0 ${isDragging ? 'bubble-dragging' : ''}`}
      style={{ touchAction: 'none', zIndex: isDragging ? 999 : 'auto', opacity: softDimmed ? 0.88 : 1, transition: 'opacity 0.2s' }}
    >
      <div className="relative">
        <ActiveBubble isActive={!!isActive}>
          <Avatar id={candidate.id} name={displayName} size="md" ringColor="#f59e0b" />
        </ActiveBubble>
      </div>
      <p className="text-[#0f172a] font-bold text-[8px] leading-none text-center">
        {displayName.split(' ')[0]}
      </p>
      <p className="text-slate-400 text-[6.5px] leading-none text-center truncate max-w-[56px]">
        {candidate.currentRole.split(' ').slice(0, 2).join(' ')}
      </p>
    </motion.div>
  )
}

// ─── Candidate bottom sheet ───────────────────────────────────────────────────

function CandidateSheet({
  candidateId, benchPos, onClose,
}: {
  candidateId: CandidateId
  benchPos: PositionDef
  onClose: () => void
}) {
  const c = getCandidateById(candidateId)
  const displayName = useDisplayName(candidateId, c.name)
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-slate-200"
        style={{ background: 'white' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Drag handle / tap to close */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-9 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="px-4 pb-6 pt-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <FitRingWithLabel fit={c.roleFit} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[#0f172a] font-bold text-sm leading-tight truncate">{displayName}</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{c.currentRole}</p>
            </div>
          </div>
          {/* Aspect bars — no standard marker, player decides from raw values */}
          <AspectBars assessment={c.assessment} standard={benchPos.standard} showStandard={false} />
        </div>
      </motion.div>
    </>
  )
}

// ─── Neutral aspect bars (no match color coding) ─────────────────────────────

function AspectRow({ aspectKey, label, children }: { aspectKey: keyof Assessment; label: string; children: React.ReactNode }) {
  const cfg = ASPECT_CONFIG[aspectKey]
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-1.5 py-[5px]"
      style={{ background: cfg.rowBg }}
    >
      {/* Icon bubble */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-md"
        style={{ width: 20, height: 20, background: cfg.iconBg }}
      >
        {cfg.icon}
      </div>
      {/* Label */}
      <span className="text-[9px] font-bold tracking-wide w-[24px] flex-shrink-0" style={{ color: cfg.color }}>{label}</span>
      {children}
    </div>
  )
}

function NeutralBars({ standard }: { standard: Assessment }) {
  return (
    <div className="w-full flex flex-col gap-[3px]">
      {ASPECT_LABELS.map(({ key, label }) => {
        const cfg = ASPECT_CONFIG[key]
        const std = standard[key]
        return (
          <AspectRow key={key} aspectKey={key} label={label}>
            <div className="relative flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.18)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${std}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})` }}
              />
            </div>
            <span className="text-[9px] font-bold w-[18px] flex-shrink-0 tabular-nums" style={{ color: cfg.color }}>{std}</span>
          </AspectRow>
        )
      })}
    </div>
  )
}

function ComparisonBars({ standard, assessment }: { standard: Assessment; assessment: Assessment }) {
  return (
    <div className="w-full flex flex-col gap-[3px]">
      {ASPECT_LABELS.map(({ key, label }) => {
        const cfg = ASPECT_CONFIG[key]
        const std = standard[key]
        const val = assessment[key]
        return (
          <AspectRow key={key} aspectKey={key} label={label}>
            <div className="relative flex-1 h-[6px] rounded-full" style={{ background: 'rgba(148,163,184,0.18)' }}>
              {/* Filled track — candidate achievement */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})`, opacity: 0.75 }}
              />
              {/* Standard marker — thin neutral vertical line */}
              <div
                className="absolute top-[-4px] bottom-[-4px] rounded-full z-10"
                style={{ left: `${std}%`, width: 1.5, background: 'rgba(100,116,139,0.55)' }}
              />
              {/* Candidate glossy bubble — positioned by % width, centered on track */}
              <motion.div
                className="absolute z-20"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
                style={{
                  left: `calc(${val}% - 6px)`,
                  top: '50%',
                  marginTop: -6,
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${cfg.color} 60%)`,
                  boxShadow: `0 0 0 1.5px white, 0 0 7px ${cfg.glow}`,
                }}
              />
            </div>
            <span className="text-[9px] font-bold w-[18px] flex-shrink-0 tabular-nums" style={{ color: cfg.color }}>{val}</span>
          </AspectRow>
        )
      })}
    </div>
  )
}

// ─── Portrait bottom panel ────────────────────────────────────────────────────

function PortraitBottomPanel({
  assignments, activeVacancyId, allFilled,
  onExternalDrop, onExternalDragMove, onConfirm,
  activeDragId, onDragStart, onDragEnd, onSelect,
  selectedCandidateId, inspectedPosId = null, vacancyQueue, currentDay = 1,
  panelHeight = null, onHeightChange, onHeightCommit,
}: {
  assignments: Partial<Record<PositionId, CandidateId>>
  activeVacancyId: PositionId | null
  allFilled: boolean
  onExternalDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onExternalDragMove: (point: { x: number; y: number } | null) => void
  onConfirm: () => void
  activeDragId: CandidateId | null
  onDragStart: (id: CandidateId) => void
  onDragEnd: () => void
  onSelect: (id: CandidateId, posId?: PositionId) => void
  selectedCandidateId: CandidateId | null
  inspectedPosId?: PositionId | null
  vacancyQueue: PositionId[]
  currentDay?: number
  panelHeight?: number | null
  onHeightChange?: (h: number) => void
  onHeightCommit?: (h: number, naturalH: number, workspaceH: number) => void
}) {
  const usedCandidateIds = new Set(Object.values(assignments).filter(Boolean))
  // Benchmark position: active vacancy while filling; inspected position after all filled
  const benchPosId = activeVacancyId ?? (allFilled ? inspectedPosId : null)
  const vacantPos = benchPosId ? POSITIONS.find(p => p.id === benchPosId)! : null
  const selectedCandidate = selectedCandidateId ? getCandidateById(selectedCandidateId) : null
  const selectedDisplayName = useDisplayName(selectedCandidateId ?? '', selectedCandidate?.name ?? '')
  const remaining = vacancyQueue.length

  // Determine content mode — after allFilled, compare mode still available via inspected position
  const mode: 'empty' | 'profile' | 'compare' | 'filled' =
    vacantPos && selectedCandidate ? 'compare'
    : allFilled ? 'filled'
    : vacantPos ? 'profile'
    : 'empty'

  const panelRef = useRef<HTMLDivElement>(null)
  const workspaceEndRef = useRef<HTMLDivElement>(null)
  const naturalHeightRef = useRef<number>(300)
  const workspaceHeightRef = useRef<number>(200)
  const dragRef = useRef<{ startY: number; startH: number; naturalH: number; workspaceH: number } | null>(null)
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)

  // Keep natural + workspace heights up to date when panel is in auto mode
  useEffect(() => {
    if (panelHeight === null && panelRef.current) {
      naturalHeightRef.current = panelRef.current.offsetHeight
      if (workspaceEndRef.current) {
        const panelTop = panelRef.current.getBoundingClientRect().top
        const dividerBottom = workspaceEndRef.current.getBoundingClientRect().bottom
        workspaceHeightRef.current = Math.round(dividerBottom - panelTop)
      }
    }
  })

  function onHandlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const naturalH = naturalHeightRef.current
    const workspaceH = workspaceHeightRef.current
    const startH = panelHeight ?? naturalH
    dragRef.current = { startY: e.clientY, startH, naturalH, workspaceH }
    setIsDraggingPanel(true)
  }
  function onHandlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const delta = dragRef.current.startY - e.clientY
    const next = Math.max(dragRef.current.workspaceH, Math.min(dragRef.current.naturalH, dragRef.current.startH + delta))
    onHeightChange?.(next)
  }
  function onHandlePointerUp(e: React.PointerEvent) {
    if (dragRef.current) {
      const delta = dragRef.current.startY - e.clientY
      const finalH = Math.max(dragRef.current.workspaceH, Math.min(dragRef.current.naturalH, dragRef.current.startH + delta))
      onHeightCommit?.(finalH, dragRef.current.naturalH, dragRef.current.workspaceH)
    }
    dragRef.current = null
    setIsDraggingPanel(false)
  }

  const isCollapsed = panelHeight !== null

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 flex flex-col"
      style={{
        ...(isCollapsed ? { height: panelHeight, overflow: 'hidden' } : {}),
        background: 'white',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 24px rgba(15,23,42,0.08), 0 -1px 4px rgba(15,23,42,0.04)',
        transition: isDraggingPanel ? 'none' : 'height 220ms cubic-bezier(0.32,0,0.67,0)',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-2.5 pb-1 flex-shrink-0 cursor-ns-resize touch-none"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={(e) => onHandlePointerUp(e)}
      >
        <div className="w-8 h-[3px] rounded-full bg-slate-300" />
      </div>

      <div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-0">
        <div className="flex items-center gap-1.5">
          {/* Gradient icon */}
          <div className="flex-shrink-0" style={{
            width: 16, height: 16, borderRadius: 5,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="5" width="4" height="8" rx="1" fill="white" opacity="0.9"/>
              <rect x="5" y="3" width="4" height="10" rx="1" fill="white"/>
              <rect x="9" y="6" width="4" height="7" rx="1" fill="white" opacity="0.75"/>
            </svg>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Role Match Workspace</p>
        </div>
        {vacantPos && (
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            borderRadius: 8, padding: '2px 8px',
            boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
          }}>
            <p className="text-[9px] font-bold text-white truncate max-w-[110px]">{vacantPos.role}</p>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="px-4 pt-2 pb-2" data-tutorial="needs-panel">
        <AnimatePresence mode="wait">
          {mode === 'empty' && (
            <motion.div key="empty"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1 py-3"
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-slate-400 text-[10px] text-center leading-snug">Tap posisi kosong untuk<br/>melihat profil peran</p>
            </motion.div>
          )}

          {mode === 'profile' && vacantPos && (
            <motion.div key={`profile-${activeVacancyId}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1.5"
            >
              <p className="text-[8px] text-slate-400 uppercase tracking-widest">Standar Peran</p>
              <p className="text-[8.5px] text-slate-600 italic leading-snug">{vacantPos.brief}</p>
              <NeutralBars standard={vacantPos.standard} />
              <p className="text-[8px] text-slate-400 text-center mt-0.5">Tap kandidat untuk membandingkan</p>
            </motion.div>
          )}

          {mode === 'compare' && vacantPos && selectedCandidate && (
            <motion.div key={`compare-${vacantPos.id}-${selectedCandidateId}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1.5"
            >
              {selectedCandidate.quote && (
                <p className="text-[8.5px] text-slate-600 italic leading-snug">
                  💬 "{selectedCandidate.quote}"
                </p>
              )}
              {/* Legend row — spacers calibrated to align with bar track edges */}
              {/* AspectRow: px-1.5(6) + icon(20) + gap(8) + label(24) + gap(8) = 66px left of track */}
              {/* Legend gap-2 layout: spacer + gap(8) = 66 → spacer=58; right: value(18)+px-1.5(6)+gap(8)=32 → right-spacer=24 */}
              <div className="flex items-center justify-between">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold">Perbandingan</p>
                <div className="flex items-center gap-2.5 text-[8px]">
                  <span className="flex items-center gap-1">
                    <span className="inline-block flex-shrink-0 rounded-full overflow-hidden" style={{ width: 16, height: 16 }}>
                      <div style={{ width: 24, height: 24, transform: 'scale(0.667)', transformOrigin: '0 0' }}>
                        <Avatar id={selectedCandidateId!} name={selectedDisplayName} size="xs" />
                      </div>
                    </span>
                    <span className="text-slate-500 font-semibold">{selectedDisplayName.split(' ')[0]}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block flex-shrink-0 rounded-full" style={{ width: 1.5, height: 8, background: 'rgba(100,116,139,0.55)' }} />
                    <span className="text-slate-400">Standar</span>
                  </span>
                </div>
              </div>
              <ComparisonBars standard={vacantPos.standard} assessment={selectedCandidate.assessment} />
            </motion.div>
          )}

          {mode === 'filled' && (
            <motion.div key="filled"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D6FF2" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-[#0f172a] text-[10px] font-bold text-center">Semua posisi telah terisi</p>
              <p className="text-slate-400 text-[9px] text-center">Tap karyawan untuk cek kecocokan posisinya,<br/>atau geser untuk atur ulang</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider — measured to determine workspace-only snap height */}
      <div ref={workspaceEndRef} className="mx-4 h-px bg-slate-100" />

      {/* External talent */}
      <div className="px-4 pt-2 pb-1" data-tutorial="external-pool">
        <p className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Talenta Eksternal</p>
        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {EXTERNAL_CANDIDATES.map(c => (
            <ExternalCandidateSlot
              key={c.id}
              candidate={c}
              alreadyPlaced={usedCandidateIds.has(c.id)}
              onDrop={onExternalDrop}
              onDragMove={onExternalDragMove}
              onDragStart={() => onDragStart(c.id)}
              onDragEnd={onDragEnd}
              onSelect={() => onSelect(c.id)}
              dimmed={activeDragId !== null && activeDragId !== c.id}
              isActive={selectedCandidateId === c.id}
              softDimmed={!!selectedCandidateId && selectedCandidateId !== c.id}
            />
          ))}
        </div>
      </div>

      {/* Compact sticky footer */}
      <div className="flex items-center gap-3 px-4 pt-1 pb-3">
        <p className="text-[9px] text-slate-400 flex-1 leading-snug">
          {allFilled ? 'Siap direview' : `${remaining} posisi belum terisi`}
        </p>
        <button
          onClick={onConfirm}
          disabled={!allFilled}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold transition-all"
          style={{
            background: allFilled ? '#1D6FF2' : '#e2e8f0',
            color: allFilled ? 'white' : '#94a3b8',
          }}
        >
          Review Organisasi →
        </button>
      </div>

      </div>
    </div>
  )
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({
  assignments, activeVacancyId, allFilled, smOccupant,
  onExternalDrop, onExternalDragMove, onConfirm,
  activeDragId, onDragStart, onDragEnd, onSelect, selectedCandidateId,
}: {
  assignments: Partial<Record<PositionId, CandidateId>>
  activeVacancyId: PositionId | null
  allFilled: boolean
  smOccupant: CandidateId | null
  onExternalDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onExternalDragMove: (point: { x: number; y: number } | null) => void
  onConfirm: () => void
  activeDragId: CandidateId | null
  onDragStart: (id: CandidateId) => void
  onDragEnd: () => void
  onSelect: (id: CandidateId) => void
  selectedCandidateId: CandidateId | null
}) {
  const { state } = useGame()
  const overallFit = computeOverallFit(assignments)
  const usedCandidateIds = new Set(Object.values(assignments).filter(Boolean))

  return (
    <div className="flex flex-col h-full pr-3 pl-1 flex-shrink-0 w-[182px]">

      {/* Scrollable top section: arc gauge + vacant panel + candidate detail */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>

        {/* Arc gauge — overall team fitness only */}
        <div className="rounded-xl border border-slate-200 bg-white pt-2 pb-1 px-2 flex-shrink-0">
          <ArcGauge value={overallFit} />
        </div>

        {/* Vacant position standard */}
        {(() => {
          const vacantPos = activeVacancyId ? POSITIONS.find(p => p.id === activeVacancyId)! : null
          return vacantPos ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-2.5 py-1.5 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-red-500 text-[6px] font-bold uppercase tracking-widest">Vacant · needs</p>
                <p className="text-[#0f172a] text-[7px] font-bold">{vacantPos.shortRole}</p>
              </div>
              <AspectBars assessment={null} standard={vacantPos.standard} />
            </div>
          ) : (
            <div className="rounded-xl border border-green-300 bg-green-50 px-2.5 py-1.5 flex-shrink-0">
              <p className="text-green-600 text-[7px] font-bold text-center">✓ All positions filled</p>
            </div>
          )
        })()}

        {/* Candidate detail */}
        <div className="rounded-xl border border-slate-200 bg-white flex-shrink-0 flex flex-col items-center justify-center px-2.5 py-2 min-h-[90px]">
          {(() => {
            const benchPos = POSITIONS.find(p => p.id === (activeVacancyId ?? 'sales_manager'))!
            return (
              <AnimatePresence mode="wait">
                {(selectedCandidateId ?? smOccupant) ? (
                  (() => {
                    const detailId = selectedCandidateId ?? smOccupant!
                    const c = getCandidateById(detailId)
                    return (
                      <motion.div
                        key={detailId}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 16, stiffness: 300 }}
                        className="w-full flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <FitRingWithLabel fit={c.roleFit} size={34} />
                          <div className="min-w-0 text-left">
                            <p className="text-[#0f172a] font-bold text-[10px] leading-tight truncate">{c.name}</p>
                            <p className="text-slate-400 text-[7px] truncate">{c.currentRole}</p>
                          </div>
                        </div>
                        <AspectBars assessment={c.assessment} standard={benchPos.standard} showStandard={false} />
                      </motion.div>
                    )
                  })()
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                        <circle cx="12" cy="8" r="4" fill="currentColor" />
                        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-[7px] leading-tight">Tap a card to see<br/>their profile</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })()}
        </div>
      </div>

      {/* Fixed bottom section: external pool + confirm always visible */}
      <div className="flex flex-col gap-2 flex-shrink-0 pb-2">
        {/* External candidates */}
        <div>
          <p className="text-slate-400 text-[7px] uppercase tracking-widest text-center mb-1.5">External Pool</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {EXTERNAL_CANDIDATES.map(c => (
              <ExternalCandidateSlot
                key={c.id}
                candidate={c}
                alreadyPlaced={usedCandidateIds.has(c.id)}
                onDrop={onExternalDrop}
                onDragMove={onExternalDragMove}
                onDragStart={() => onDragStart(c.id)}
                onDragEnd={onDragEnd}
                onSelect={() => onSelect(c.id)}
                dimmed={activeDragId !== null && activeDragId !== c.id}
              />
            ))}
          </div>
        </div>

        {/* Confirm */}
        <div>
          <PrimaryButton onClick={onConfirm} disabled={!allFilled}>
            Confirm →
          </PrimaryButton>
          {!allFilled && activeVacancyId && (
            <p className="text-slate-400 text-[7px] text-center mt-1">Fill all positions first</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Walkthrough gesture demos ────────────────────────────────────────────────

function rectOfTarget(container: HTMLElement, target: string) {
  const el = container.querySelector(`[data-tutorial="${target}"]`)
  if (!el) return null
  const c = container.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return { x: r.x - c.x, y: r.y - c.y, w: r.width, h: r.height }
}

type DemoGeo = {
  kind: 'pan' | 'tap' | 'sweep' | 'drag'
  start: { x: number; y: number }
  end: { x: number; y: number }
  ghostId?: CandidateId
}

const DOT = 30  // touch indicator diameter

function TouchIndicator() {
  return (
    <div style={{
      width: DOT, height: DOT, borderRadius: '50%',
      background: 'rgba(255,255,255,0.9)',
      boxShadow: '0 0 0 5px rgba(255,255,255,0.25), 0 2px 12px rgba(15,23,42,0.4)',
    }} />
  )
}

function GestureDemo({ step, containerRef }: {
  step: number
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const [geo, setGeo] = useState<DemoGeo | null>(null)

  useEffect(() => {
    setGeo(null)
    const t = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const center = (r: { x: number; y: number; w: number; h: number }) =>
        ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })
      const vacant = rectOfTarget(container, 'vacant')

      switch (step) {
        case 0: {
          // canvas — pan gesture
          const r = rectOfTarget(container, 'canvas')
          if (!r) return
          const c = center(r)
          setGeo({ kind: 'pan', start: { x: c.x - 55, y: c.y - 10 }, end: { x: c.x + 55, y: c.y + 10 } })
          break
        }
        case 1: {
          // vacant — tap
          if (!vacant) return
          const c = center(vacant)
          setGeo({ kind: 'tap', start: c, end: c })
          break
        }
        case 2: {
          // internal-card — drag to vacant
          const r = rectOfTarget(container, 'internal-card')
          if (!r || !vacant) return
          setGeo({ kind: 'drag', ghostId: 'andi', start: center(r), end: center(vacant) })
          break
        }
        case 3: {
          // external-pool — drag to vacant
          const r = rectOfTarget(container, 'external-pool')
          if (!r) return
          const s = { x: r.x + 42, y: r.y + r.h / 2 }
          const e = vacant ? center(vacant) : { x: s.x + 60, y: s.y - 140 }
          setGeo({ kind: 'drag', ghostId: 'dewi', start: s, end: e })
          break
        }
        case 4: {
          // needs-panel — sweep
          const r = rectOfTarget(container, 'needs-panel')
          if (!r) return
          setGeo({ kind: 'sweep', start: { x: r.x + r.w * 0.22, y: r.y + r.h * 0.5 }, end: { x: r.x + r.w * 0.72, y: r.y + r.h * 0.5 } })
          break
        }
        case 5: {
          // calendar — no gesture demo, spotlight only
          break
        }
      }
    }, 350)
    return () => clearTimeout(t)
  }, [step])

  if (!geo) return null
  const { kind, start, end } = geo
  const dotOff = DOT / 2

  if (kind === 'pan' || kind === 'sweep') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" key={`demo-${step}`}>
        <motion.div
          className="absolute left-0 top-0"
          animate={{
            x: [start.x - dotOff, start.x - dotOff, end.x - dotOff, start.x - dotOff, start.x - dotOff],
            y: [start.y - dotOff, start.y - dotOff, end.y - dotOff, start.y - dotOff, start.y - dotOff],
            opacity: [0, 1, 1, 1, 0],
            scale: [0.6, 0.85, 0.85, 0.85, 0.6],
          }}
          transition={{ duration: 3, times: [0, 0.12, 0.5, 0.88, 1], repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
        >
          <TouchIndicator />
        </motion.div>
      </div>
    )
  }

  if (kind === 'tap') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" key={`demo-${step}`}>
        {/* Ripple ring on tap */}
        <motion.div
          className="absolute left-0 top-0 rounded-full"
          style={{ width: DOT, height: DOT, border: '2px solid rgba(255,255,255,0.85)', x: start.x - dotOff, y: start.y - dotOff }}
          animate={{ scale: [1, 1, 2.4, 2.8], opacity: [0, 0, 0.9, 0] }}
          transition={{ duration: 2, times: [0, 0.4, 0.7, 1], repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute left-0 top-0"
          style={{ x: start.x - dotOff, y: start.y - dotOff }}
          animate={{ opacity: [0, 1, 1, 1, 0], scale: [0.6, 0.9, 0.65, 0.9, 0.6] }}
          transition={{ duration: 2, times: [0, 0.25, 0.42, 0.6, 1], repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
        >
          <TouchIndicator />
        </motion.div>
      </div>
    )
  }

  // kind === 'drag' — ghost avatar lifted and dragged to the vacant seat
  const ghost = geo.ghostId ? getCandidateById(geo.ghostId) : null
  const GHOST = 44
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" key={`demo-${step}`}>
      {/* Ghost avatar follows the finger */}
      {ghost && (
        <motion.div
          className="absolute left-0 top-0"
          animate={{
            x: [start.x - GHOST / 2, start.x - GHOST / 2, end.x - GHOST / 2, end.x - GHOST / 2],
            y: [start.y - GHOST / 2, start.y - GHOST / 2, end.y - GHOST / 2, end.y - GHOST / 2],
            opacity: [0, 0.95, 0.95, 0],
            scale: [0.7, 1.15, 1.15, 0.8],
          }}
          transition={{ duration: 3.2, times: [0, 0.2, 0.72, 1], repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 6px 14px rgba(15,23,42,0.45))' }}
        >
          <div style={{ width: GHOST, height: GHOST, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)' }}>
            <Avatar id={ghost.id} name={ghost.name} size="sm" />
          </div>
        </motion.div>
      )}
      {/* Finger dot slightly offset on top of the ghost */}
      <motion.div
        className="absolute left-0 top-0"
        animate={{
          x: [start.x - dotOff + 10, start.x - dotOff + 10, end.x - dotOff + 10, end.x - dotOff + 10],
          y: [start.y - dotOff + 12, start.y - dotOff + 12, end.y - dotOff + 12, end.y - dotOff + 12],
          opacity: [0, 0.9, 0.9, 0],
          scale: [0.6, 0.8, 0.8, 0.6],
        }}
        transition={{ duration: 3.2, times: [0, 0.2, 0.72, 1], repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
      >
        <TouchIndicator />
      </motion.div>
    </div>
  )
}

// ─── Walkthrough Overlay ──────────────────────────────────────────────────────

const WALK_STEPS = [
  { target: 'canvas',        pos: 'bottom' as const, text: 'Ini org chart perusahaanmu. Drag untuk jelajahi, pinch untuk zoom.' },
  { target: 'vacant',        pos: 'bottom' as const, text: 'Sales Manager resign. Kursi merah ini harus kamu isi!' },
  { target: 'internal-card', pos: 'bottom' as const, text: 'Kandidat bisa dari dalam. Tarik siapa pun di org chart, tap kartu untuk lihat profil.' },
  { target: 'external-pool', pos: 'top'    as const, text: 'Atau rekrut dari luar. Tidak meninggalkan lubang di tim, tapi cek readiness-nya.' },
  { target: 'needs-panel',   pos: 'top'    as const, text: 'Setiap posisi punya standar kompetensi. Garis = level minimum yang dibutuhkan.' },
  { target: 'calendar',      pos: 'bottom' as const, text: 'Ini jam organisasimu. Setiap hari ada biaya posisi kosong, makin cepat diisi makin kecil dampaknya ke bisnis.' },
]

function WalkthroughOverlay({ step, onStep, onDone, containerRef }: {
  step: number
  onStep: (s: number) => void
  onDone: () => void
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const [spot, setSpot] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [cH, setCH] = useState(0)
  const PAD = 12
  const current = WALK_STEPS[step]
  const isLast = step === WALK_STEPS.length - 1

  useEffect(() => {
    const t = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      setCH(cRect.height)
      const el = container.querySelector(`[data-tutorial="${current.target}"]`)
      if (!el) { setSpot(null); return }
      const r = el.getBoundingClientRect()
      setSpot({ x: r.x - cRect.x - PAD, y: r.y - cRect.y - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 })
    }, 120)
    return () => clearTimeout(t)
  }, [step])

  function advance() {
    if (isLast) { onDone(); return }
    onStep(step + 1)
  }

  const tooltipBelow = current.pos === 'bottom'
  const tooltipStyle: React.CSSProperties = spot
    ? tooltipBelow
      ? { top: Math.min(spot.y + spot.h + 10, cH - 160) }
      : { bottom: Math.max(cH - spot.y + 10, 10) }
    : { bottom: 120 }

  return (
    <div className="absolute inset-0 z-40" onClick={advance}>
      {/* Dark overlay with spotlight hole */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {spot ? (
          <motion.div
            className="absolute"
            style={{ borderRadius: 14, boxShadow: '0 0 0 9999px rgba(0,0,0,0.8)' }}
            animate={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h }}
            initial={false}
            transition={{ type: 'spring', damping: 30, stiffness: 240 }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/80" />
        )}
      </div>

      {/* Animated gesture demo */}
      <GestureDemo step={step} containerRef={containerRef} />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: tooltipBelow ? 8 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 right-4 pointer-events-auto"
          style={tooltipStyle}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-[#0f172a] text-[13px] leading-snug flex-1">{current.text}</p>
              <span className="text-slate-400 text-[10px] font-mono flex-shrink-0 mt-0.5 tabular-nums">
                {step + 1}/{WALK_STEPS.length}
              </span>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1 mb-3">
              {WALK_STEPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-brand' : i < step ? 'w-1.5 bg-brand/40' : 'w-1.5 bg-slate-200'}`} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onDone}
                className="text-slate-400 text-sm font-medium py-3 px-4 rounded-xl active:text-slate-600 active:bg-slate-100 transition-colors flex-shrink-0"
              >
                Lewati
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={advance}
                className="flex-1 py-3 px-5 rounded-xl bg-brand text-white font-semibold text-sm transition-all active:scale-95"
              >
                {isLast ? 'Mulai! →' : 'Lanjut →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── CalendarWidget ───────────────────────────────────────────────────────────

function CalendarWidget({ currentDay, openRoles }: { currentDay: number; openRoles: number }) {
  const prevDayRef = useRef(currentDay)
  const [delta, setDelta] = useState<number | null>(null)
  const [glowing, setGlowing] = useState(false)

  useEffect(() => {
    if (currentDay !== prevDayRef.current) {
      const d = currentDay - prevDayRef.current
      prevDayRef.current = currentDay
      setDelta(d)
      setGlowing(true)
      const t1 = setTimeout(() => setDelta(null), 1400)
      const t2 = setTimeout(() => setGlowing(false), 700)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [currentDay])

  return (
    <div className="flex items-center gap-2">
      {/* Mini calendar card */}
      <div className="relative">
        {/* +N Day toast */}
        <AnimatePresence>
          {delta !== null && (
            <motion.div
              key={`toast-${currentDay}`}
              initial={{ opacity: 0, y: 4, scale: 0.85 }}
              animate={{ opacity: 1, y: -2, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.28, exit: { duration: 0.5 } }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-10"
            >
              <span className="text-[9px] font-black text-brand bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-brand/20">
                +{delta} Hari
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <motion.div
          animate={glowing ? {
            boxShadow: ['0 0 0 0px rgba(29,111,242,0)', '0 0 0 4px rgba(29,111,242,0.18)', '0 0 0 0px rgba(29,111,242,0)'],
          } : { boxShadow: '0 0 0 0px rgba(29,111,242,0)' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center rounded-lg overflow-hidden"
          style={{
            width: 40,
            background: 'white',
            border: '1.5px solid rgba(59,130,246,0.22)',
            boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
          }}
        >
          {/* Calendar header strip */}
          <div className="w-full flex items-center justify-center gap-0.5 py-[2px]"
            style={{ background: 'linear-gradient(135deg, #1D6FF2, #06B6D4)' }}>
            <svg width="6" height="6" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="13" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M1 6h14" stroke="white" strokeWidth="1.5"/>
              <path d="M5 1v2M11 1v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-white text-[6px] font-bold uppercase tracking-[0.12em] leading-none">Hari</span>
          </div>

          {/* Day number with flip animation */}
          <div className="py-1 flex items-center justify-center overflow-hidden" style={{ height: 24 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={currentDay}
                initial={{ y: 10, opacity: 0, scaleY: 0.5 }}
                animate={{ y: 0, opacity: 1, scaleY: 1 }}
                exit={{ y: -10, opacity: 0, scaleY: 0.5 }}
                transition={{ duration: 0.32, ease: [0.2, 0, 0.2, 1] }}
                className="text-[16px] font-black leading-none tabular-nums"
                style={{ color: '#1D6FF2', display: 'block', transformOrigin: 'center' }}
              >
                {currentDay}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

// ─── Explore Screen ───────────────────────────────────────────────────────────

export function ExploreScreen() {
  const { state, actions } = useGame()
  const vacantRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [canvasExplored, setCanvasExplored] = useState(false)
  const [assignments, setAssignments] = useState<Partial<Record<PositionId, CandidateId>>>(INITIAL_ASSIGNMENTS)
  const [vacancyQueue, setVacancyQueue] = useState<PositionId[]>(['sales_manager'])
  const [activeDragId, setActiveDragId] = useState<CandidateId | null>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<CandidateId | null>(null)
  const [inspectedPosId, setInspectedPosId] = useState<PositionId | null>(null)
  const [selectedVacantPosId, setSelectedVacantPosId] = useState<PositionId | null>(null)
  const [walkthroughDone, setWalkthroughDone] = useState(false)
  const [walkthroughStep, setWalkthroughStep] = useState(0)
  const walkthroughContainerRef = useRef<HTMLDivElement>(null)

  // Simulated calendar: 1 day passes every 2 real minutes
  const [currentDay, setCurrentDay] = useState(1)
  const [vacancyOpenedAt, setVacancyOpenedAt] = useState<Partial<Record<PositionId, number>>>({ sales_manager: 1 })
  const [placements, setPlacements] = useState<PlacementEntry[]>([])
  const [panelHeight, setPanelHeight] = useState<number | null>(null)
  const [showFirstDropHint, setShowFirstDropHint] = useState(false)
  const firstDropDoneRef = useRef(false)
  const [showAllFilledHint, setShowAllFilledHint] = useState(false)
  const prevAllFilledRef = useRef(false)
  useEffect(() => {
    const id = setInterval(() => setCurrentDay(d => d + 1), 30 * 1000)
    return () => clearInterval(id)
  }, [])

  const activeVacancyId = vacancyQueue[0] ?? null
  const allFilled = vacancyQueue.length === 0

  // Show hint when allFilled first becomes true
  useEffect(() => {
    if (allFilled && !prevAllFilledRef.current) {
      setShowAllFilledHint(true)
      const t = setTimeout(() => setShowAllFilledHint(false), 5000)
      prevAllFilledRef.current = true
      return () => clearTimeout(t)
    }
    if (!allFilled) prevAllFilledRef.current = false
  }, [allFilled])
  const smOccupant = assignments['sales_manager'] ?? null

  function handleSelect(candidateId: CandidateId, posId?: PositionId) {
    setSelectedCandidateId(candidateId)
    setSelectedVacantPosId(null)
    if (allFilled && posId) setInspectedPosId(posId)
    else setInspectedPosId(null)
  }

  function computeTimeFill(): TimeFillData {
    const totalVacancyDays = placements.reduce((s, p) => s + p.vacancyAge, 0)
    const avgTTF = placements.length > 0 ? Math.round(totalVacancyDays / placements.length) : 0
    return { currentDay, placements, avgTTF, totalDays: currentDay }
  }

  function isOverVacancy(point: { x: number; y: number }) {
    const rect = vacantRef.current?.getBoundingClientRect()
    if (!rect) return false
    const pad = 10
    return point.x >= rect.left - pad && point.x <= rect.right + pad &&
           point.y >= rect.top - pad  && point.y <= rect.bottom + pad
  }

  function handleUnplace(posId: PositionId) {
    const occupant = assignments[posId]
    if (!occupant) return
    const candidate = getCandidateById(occupant)
    const newAssignments = { ...assignments }
    delete newAssignments[posId]
    let newQueue = [posId, ...vacancyQueue.filter(q => q !== posId)]

    // Reset placement log for this position (vacancy re-opened)
    setPlacements(prev => prev.filter(p => p.posId !== posId))
    setVacancyOpenedAt(prev => ({ ...prev, [posId]: currentDay }))

    // Reverse cascade: if internal candidate's natural slot was vacated, restore it
    if (candidate.source === 'internal') {
      const naturalPosId = occupant as unknown as PositionId
      if (newQueue.includes(naturalPosId)) {
        newQueue = newQueue.filter(q => q !== naturalPosId)
        newAssignments[naturalPosId] = occupant
        // Remove the natural slot from vacancyOpenedAt since it's filled again
        setVacancyOpenedAt(prev => {
          const next = { ...prev }
          delete next[naturalPosId]
          return next
        })
        setPlacements(prev => prev.filter(p => p.posId !== naturalPosId))
      }
    }

    setAssignments(newAssignments)
    setVacancyQueue(newQueue)
  }

  function getPosIdAtPoint(point: { x: number; y: number }): PositionId | null {
    const el = document.elementFromPoint(point.x, point.y)
    if (!el) return null
    const slotEl = el.closest('[data-posid]')
    if (!slotEl) return null
    return slotEl.getAttribute('data-posid') as PositionId
  }

  function handleSwapPositions(fromPosId: PositionId, toPosId: PositionId) {
    const fromOccupant = assignments[fromPosId]
    const toOccupant = assignments[toPosId]
    if (!fromOccupant || !toOccupant || fromPosId === toPosId) return
    setAssignments(prev => ({ ...prev, [fromPosId]: toOccupant, [toPosId]: fromOccupant }))
    setSelectedCandidateId(fromOccupant)
    setInspectedPosId(toPosId)
  }

  function handleDragMove(point: { x: number; y: number } | null) {
    setIsDragOver(point !== null && isOverVacancy(point))
  }

  function applyDrop(
    candidateId: CandidateId,
    targetPosId: PositionId,
    fromPosId: PositionId | null,
    baseAssignments: Partial<Record<PositionId, CandidateId>>,
    baseQueue: PositionId[],
  ): { assignments: Partial<Record<PositionId, CandidateId>>; queue: PositionId[] } {
    const candidate = getCandidateById(candidateId)
    const newA = { ...baseAssignments, [targetPosId]: candidateId }
    let newQ = baseQueue.filter(q => q !== targetPosId)

    // Cascade: open natural slot only when NOT placing in natural slot itself
    if (candidate.source === 'internal') {
      const naturalPosId = candidateId as unknown as PositionId
      if (targetPosId !== naturalPosId && newA[naturalPosId] === candidateId) {
        delete newA[naturalPosId]
        newQ = [...newQ, naturalPosId]
      }
    }

    // If moving from a non-natural PlacedSlot, open the old slot
    if (fromPosId && fromPosId !== targetPosId) {
      delete newA[fromPosId]
      if (!newQ.includes(fromPosId)) newQ = [fromPosId, ...newQ]
    }

    return { assignments: newA, queue: newQ }
  }

  function applyConfirmedDrop(
    candidateId: CandidateId,
    targetPosId: PositionId,
    fromPosId: PositionId | null,
    baseAssignments: Partial<Record<PositionId, CandidateId>>,
    baseQueue: PositionId[],
  ) {
    const candidate = getCandidateById(candidateId)
    const { assignments: newA, queue: newQ } = applyDrop(candidateId, targetPosId, fromPosId, baseAssignments, baseQueue)
    const openedAt = vacancyOpenedAt[targetPosId] ?? currentDay
    const vacancyAge = Math.max(0, currentDay - openedAt)

    // Record placement
    const entry: PlacementEntry = {
      posId: targetPosId,
      candidateId,
      dayFilled: currentDay,
      vacancyAge,
    }
    setPlacements(prev => [...prev.filter(p => p.posId !== targetPosId), entry])

    // Update vacancyOpenedAt — remove filled slot, open any new cascade vacancies
    const newVacancyOpenedAt: Partial<Record<PositionId, number>> = { ...vacancyOpenedAt }
    delete newVacancyOpenedAt[targetPosId]
    for (const posId of newQ) {
      if (!newVacancyOpenedAt[posId]) newVacancyOpenedAt[posId] = currentDay
    }
    if (fromPosId && fromPosId !== targetPosId && !newVacancyOpenedAt[fromPosId]) {
      newVacancyOpenedAt[fromPosId] = currentDay
    }

    setAssignments(newA)
    setVacancyQueue(newQ)
    setVacancyOpenedAt(newVacancyOpenedAt)

    if (!firstDropDoneRef.current) {
      firstDropDoneRef.current = true
      setShowFirstDropHint(true)
      setTimeout(() => setShowFirstDropHint(false), 5000)
    }

    if (targetPosId === 'sales_manager') {
      logEvent(
        candidate.source === 'external' ? 'external_profile_opened' : 'employee_profile_opened',
        state.sessionId,
        { candidateId }
      )
    }
    setSelectedCandidateId(candidateId)
  }

  function handleDrop(candidateId: CandidateId, point: { x: number; y: number }): boolean {
    setIsDragOver(false)
    if (activeVacancyId && isOverVacancy(point)) {
      setSelectedVacantPosId(null)
      applyConfirmedDrop(candidateId, activeVacancyId, null, assignments, vacancyQueue.slice(1))
      return true
    }
    // When allFilled: drag onto another slot = swap
    if (allFilled) {
      const fromPosId = candidateId as unknown as PositionId
      const targetPosId = getPosIdAtPoint(point)
      if (targetPosId && targetPosId !== fromPosId && assignments[targetPosId]) {
        handleSwapPositions(fromPosId, targetPosId)
        return true
      }
    }
    return false
  }

  function handleMovePlaced(fromPosId: PositionId, candidateId: CandidateId, point: { x: number; y: number }): boolean {
    setIsDragOver(false)
    if (activeVacancyId && isOverVacancy(point) && fromPosId !== activeVacancyId) {
      // Moving a placed card: reverse cascade first
      const candidate = getCandidateById(candidateId)
      let baseA = { ...assignments }
      let baseQ = [...vacancyQueue]
      if (candidate.source === 'internal') {
        const naturalPosId = candidateId as unknown as PositionId
        if (baseQ.includes(naturalPosId)) {
          baseQ = baseQ.filter(q => q !== naturalPosId)
          baseA[naturalPosId] = candidateId
        }
      }
      applyConfirmedDrop(candidateId, activeVacancyId, fromPosId, baseA, baseQ.filter(q => q !== activeVacancyId))
      return true
    }
    // When allFilled: drag onto another slot = swap
    if (allFilled) {
      const targetPosId = getPosIdAtPoint(point)
      if (targetPosId && targetPosId !== fromPosId && assignments[targetPosId]) {
        handleSwapPositions(fromPosId, targetPosId)
        return true
      }
    }
    return false
  }

  return (
    <NameMapCtx.Provider value={state.nameMap}>
    <div ref={walkthroughContainerRef} className="relative flex flex-col h-full overflow-hidden bg-[#e8edf5]">

      <div className="flex flex-col flex-1 min-h-0 relative">

        {/* Floating header overlay — no background, sits on top of canvas */}
        <div className="absolute top-0 left-0 right-0 z-10 grid grid-cols-3 items-center px-3 pt-2 pb-1 pointer-events-none">
          {/* Left: calendar */}
          <div className="pointer-events-auto" data-tutorial="calendar">
            <CalendarWidget currentDay={currentDay} openRoles={vacancyQueue.length} />
          </div>

          {/* Center: drag hint */}
          <AnimatePresence>
            {!canvasExplored ? (
              <motion.div
                key="drag-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.6, duration: 0.4 }}
                className="flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                  <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span className="text-slate-400 text-[9px] uppercase tracking-[0.18em] font-semibold">Drag to explore</span>
              </motion.div>
            ) : <div />}
          </AnimatePresence>

          {/* Right: ? button */}
          <div className="flex justify-end pointer-events-auto">
            <button
              onClick={() => { setWalkthroughStep(0); setWalkthroughDone(false) }}
              className="w-7 h-7 rounded-full border border-slate-200 bg-white text-slate-400 text-xs font-bold flex items-center justify-center active:scale-90 transition-all shadow-sm"
            >?</button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col" data-tutorial="canvas">
          <OrgTree
            assignments={assignments}
            activeVacancyId={activeVacancyId}
            vacancyQueue={vacancyQueue}
            nodeRef={vacantRef}
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragMove={handleDragMove}
            activeDragId={activeDragId}
            onDragStart={(id) => setActiveDragId(id)}
            onDragEnd={() => setActiveDragId(null)}
            onUnplace={handleUnplace}
            onMovePlaced={handleMovePlaced}
            onSelect={handleSelect}
            onSelectVacant={(posId) => { setSelectedVacantPosId(posId); setSelectedCandidateId(null) }}
            onExplore={() => setCanvasExplored(true)}
            selectedCandidateId={selectedCandidateId}
            initialZoom={0.95}
            currentDay={currentDay}
            vacancyOpenedAt={vacancyOpenedAt}
          />
        </div>
        {/* First drop hint callout */}
        <AnimatePresence>
          {showFirstDropHint && (
            <motion.div
              key="first-drop-hint"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="absolute top-12 left-3 right-3 z-20 pointer-events-none overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(15,23,42,0.84)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="flex items-start gap-2.5 px-3.5 pt-2.5 pb-2">
                <span className="text-base leading-none flex-shrink-0 mt-0.5">⏱️</span>
                <p className="text-white text-[11px] leading-snug font-medium">
                  Posisi terisi! Keputusan dan kecepatan kamu mengisi posisi sama-sama dihitung di akhir.
                </p>
              </div>
              <div className="h-[3px] w-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'rgba(255,255,255,0.55)', transformOrigin: 'left' }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All-filled hint callout — top */}
        <AnimatePresence>
          {showAllFilledHint && (
            <motion.div
              key="all-filled-hint"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="absolute top-12 left-3 right-3 z-20 pointer-events-none overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(15,23,42,0.84)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="flex items-start gap-2.5 px-3.5 pt-2.5 pb-2">
                <span className="text-base leading-none flex-shrink-0 mt-0.5">🎉</span>
                <p className="text-white text-[11px] leading-snug font-medium">
                  Seluruh posisi sudah terisi! Tap karyawan untuk cek kecocokan posisinya, atau geser untuk atur ulang.
                </p>
              </div>
              {/* Progress bar */}
              <div className="h-[3px] w-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'rgba(255,255,255,0.55)', transformOrigin: 'left' }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PortraitBottomPanel
          assignments={assignments}
          activeVacancyId={selectedVacantPosId ?? activeVacancyId}
          allFilled={allFilled}
          onExternalDrop={handleDrop}
          onExternalDragMove={handleDragMove}
          onConfirm={() => {
            if (smOccupant) {
              actions.confirmExplore(smOccupant, computeOverallFit(assignments), computeTimeFill())
            }
          }}
          activeDragId={activeDragId}
          onDragStart={(id) => setActiveDragId(id)}
          onDragEnd={() => setActiveDragId(null)}
          onSelect={handleSelect}
          selectedCandidateId={selectedCandidateId}
          inspectedPosId={inspectedPosId}
          vacancyQueue={vacancyQueue}
          currentDay={currentDay}
          panelHeight={panelHeight}
          onHeightChange={(h) => setPanelHeight(h)}
          onHeightCommit={(h, naturalH, workspaceH) => {
            // Snap to workspace-only or full based on midpoint between the two
            const mid = (workspaceH + naturalH) / 2
            setPanelHeight(h < mid ? workspaceH : null)
          }}
        />
      </div>

      {/* 5-step walkthrough — shown until dismissed */}
      {!walkthroughDone && (
        <WalkthroughOverlay
          step={walkthroughStep}
          onStep={setWalkthroughStep}
          onDone={() => setWalkthroughDone(true)}
          containerRef={walkthroughContainerRef}
        />
      )}

    </div>
    </NameMapCtx.Provider>
  )
}
