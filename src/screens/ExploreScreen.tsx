import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { FitRingWithLabel } from '../components/FitRing'
import { TimerBar } from '../components/TimerBar'
import { getCandidateById, EXTERNAL_CANDIDATES, BEST_CANDIDATE_ID, type Candidate, type Readiness, type Assessment } from '../data/scenario'
import { fitColor } from '../game/scoring'
import type { CandidateId } from '../game/types'
import { logEvent } from '../lib/api'

// ─── Position definitions ─────────────────────────────────────────────────────

type PositionId = 'sales_manager' | 'maya' | 'dimas' | 'andi' | 'rani' | 'fajar' | 'bintang' | 'sari' | 'rizky' | 'putri'

interface PositionDef {
  id: PositionId
  role: string
  shortRole: string
  naturalOccupant: CandidateId | null
  naturalFit: number
  level: 2 | 3
  standard: Assessment  // required benchmark per aspect for this position
}

const POSITIONS: PositionDef[] = [
  { id: 'sales_manager', role: 'Sales Manager',      shortRole: 'Sales Mgr', naturalOccupant: null,      naturalFit: 0,  level: 2,
    standard: { leadership: 85, drive: 85, influence: 80, resilience: 80, collaboration: 75 } },
  { id: 'maya',          role: 'CS Manager',          shortRole: 'CS Mgr',    naturalOccupant: 'maya',    naturalFit: 91, level: 2,
    standard: { leadership: 80, drive: 65, influence: 75, resilience: 75, collaboration: 90 } },
  { id: 'dimas',         role: 'Marketing Manager',   shortRole: 'Mkt Mgr',   naturalOccupant: 'dimas',   naturalFit: 85, level: 2,
    standard: { leadership: 75, drive: 75, influence: 85, resilience: 70, collaboration: 75 } },
  { id: 'andi',          role: 'Senior AE',           shortRole: 'Sr. AE',    naturalOccupant: 'andi',    naturalFit: 88, level: 3,
    standard: { leadership: 55, drive: 90, influence: 80, resilience: 75, collaboration: 60 } },
  { id: 'rani',          role: 'Account Executive',   shortRole: 'AE',        naturalOccupant: 'rani',    naturalFit: 90, level: 3,
    standard: { leadership: 50, drive: 85, influence: 75, resilience: 70, collaboration: 65 } },
  { id: 'fajar',         role: 'BD Executive',        shortRole: 'BD Exec',   naturalOccupant: 'fajar',   naturalFit: 82, level: 3,
    standard: { leadership: 55, drive: 85, influence: 85, resilience: 70, collaboration: 65 } },
  { id: 'bintang',       role: 'CS Representative',   shortRole: 'CS Rep',    naturalOccupant: 'bintang', naturalFit: 80, level: 3,
    standard: { leadership: 45, drive: 65, influence: 65, resilience: 70, collaboration: 80 } },
  { id: 'sari',          role: 'CS Specialist',       shortRole: 'CS Spec',   naturalOccupant: 'sari',    naturalFit: 82, level: 3,
    standard: { leadership: 50, drive: 65, influence: 70, resilience: 70, collaboration: 80 } },
  { id: 'rizky',         role: 'Mkt Specialist',      shortRole: 'Mkt Spec',  naturalOccupant: 'rizky',   naturalFit: 79, level: 3,
    standard: { leadership: 45, drive: 70, influence: 75, resilience: 65, collaboration: 70 } },
  { id: 'putri',         role: 'Content Creator',     shortRole: 'Content',   naturalOccupant: 'putri',   naturalFit: 77, level: 3,
    standard: { leadership: 40, drive: 70, influence: 70, resilience: 60, collaboration: 65 } },
]

const ASPECT_LABELS: { key: keyof Assessment; label: string }[] = [
  { key: 'leadership',    label: 'LEAD' },
  { key: 'drive',         label: 'DRIVE' },
  { key: 'influence',     label: 'INFL' },
  { key: 'resilience',    label: 'RESIL' },
  { key: 'collaboration', label: 'COLLAB' },
]

const INITIAL_ASSIGNMENTS: Partial<Record<PositionId, CandidateId>> = {
  maya: 'maya', dimas: 'dimas', andi: 'andi', rani: 'rani', fajar: 'fajar',
  bintang: 'bintang', sari: 'sari', rizky: 'rizky', putri: 'putri',
}

const FLOAT_DELAYS: Partial<Record<PositionId, number>> = {
  maya: 0, dimas: 0.7, andi: 0.3, rani: 1.0, fajar: 1.6,
  bintang: 0.5, sari: 1.2, rizky: 0.9, putri: 1.8,
}

function getSlotFit(posId: PositionId, occupant: CandidateId): number {
  if (posId === 'sales_manager') return getCandidateById(occupant).roleFit
  const pos = POSITIONS.find(p => p.id === posId)!
  if (occupant === pos.naturalOccupant) return pos.naturalFit
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
        const textColor = showStandard && value !== null ? aspectColor(value, std) : 'rgba(240,244,248,0.5)'
        return (
          <div key={key} className="flex items-center gap-1">
            <span className="text-white/35 text-[5.5px] font-bold tracking-wider w-[26px] text-right flex-shrink-0">{label}</span>
            <div className="relative flex-1 h-[5px] rounded-full bg-white/10 overflow-visible">
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
                <div className="absolute inset-y-0 left-0 rounded-full bg-brand/60" style={{ width: `${std}%` }} />
              )}
              {showStandard && (
                <div className="absolute top-[-1.5px] bottom-[-1.5px] w-[1.5px] bg-white/70 rounded-full" style={{ left: `${std}%` }} />
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

// ─── OrgCard ──────────────────────────────────────────────────────────────────

function OrgCard({
  posId,
  filled = false,
  name,
  role,
  candidateId,
  fit,
  badge,
  small = false,
  className = '',
}: {
  posId: PositionId
  filled?: boolean
  name: string
  role: string
  candidateId?: CandidateId
  fit?: number
  badge?: React.ReactNode
  small?: boolean
  className?: string
}) {
  const displayName = name.split(' ')[0]
  const shortRole = role.split(' ').slice(0, 2).join(' ')
  const readiness = candidateId ? getCandidateById(candidateId).readiness : null
  return (
    <div className={`relative rounded-xl border overflow-hidden flex-shrink-0
      ${small ? 'w-[76px]' : 'w-[96px]'}
      ${filled ? 'border-green-400/40 bg-green-500/10' : 'border-white/10 bg-[#1a2840]'}
      ${className}`}>
      {badge && <div className="absolute top-1 right-1 z-10">{badge}</div>}
      <div className={`flex items-center justify-center ${filled ? 'bg-green-500/10' : 'bg-white/5'} ${small ? 'h-[30px]' : 'h-[38px]'}`}>
        {candidateId
          ? <Avatar id={candidateId} name={name} size={small ? 'xs' : 'sm'} />
          : <div className={`rounded-full bg-white/10 flex items-center justify-center ${small ? 'w-6 h-6' : 'w-8 h-8'}`}>
              <span className="text-white/40 text-xs font-bold">{name.charAt(0)}</span>
            </div>
        }
      </div>
      <div className="px-1.5 pt-1 pb-1.5">
        <p className={`text-[#f0f4f8] font-bold leading-tight truncate ${small ? 'text-[7px]' : 'text-[8px]'}`}>{displayName}</p>
        <p className={`text-white/40 leading-tight truncate mt-0.5 ${small ? 'text-[6px]' : 'text-[7px]'}`}>{shortRole}</p>
        {readiness && !filled && (
          <div className="mt-1">
            <ReadinessBadge readiness={readiness} tiny={small} />
          </div>
        )}
        {fit !== undefined && (
          <>
            <div className="mt-1 h-[3px] rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${fit}%`, backgroundColor: fitColor(fit) }} />
            </div>
            <p className="text-[6px] mt-0.5 font-bold" style={{ color: fitColor(fit) }}>{fit}%</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ActiveVacancy ────────────────────────────────────────────────────────────

function ActiveVacancy({ nodeRef, isDragOver, posId, small = false }: {
  nodeRef: React.RefObject<HTMLDivElement>
  isDragOver: boolean
  posId: PositionId
  small?: boolean
}) {
  const pos = POSITIONS.find(p => p.id === posId)!
  return (
    <div
      ref={nodeRef}
      className={`relative rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-200 flex-shrink-0 overflow-hidden
        ${small ? 'w-[76px] h-[48px]' : 'w-[96px] h-[56px]'}
        ${isDragOver
          ? 'border-green-400 bg-green-500/15 scale-105'
          : 'border-red-500/70 bg-red-500/10 animate-vacant-glow'
        }`}
    >
      {/* Spinning dashed ring overlay */}
      {!isDragOver && (
        <div className="absolute inset-[-4px] rounded-[16px] border-2 border-dashed border-red-300/40 animate-spin-slow pointer-events-none" />
      )}

      {/* Person silhouette */}
      <div className="flex flex-col items-center gap-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          className={isDragOver ? 'text-green-500' : 'text-red-400'}>
          <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.5" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        </svg>
        <p className={`font-black text-[7px] uppercase tracking-widest leading-none ${isDragOver ? 'text-green-600' : 'text-red-500'}`}>
          {isDragOver ? '✓ Drop' : 'Vacant'}
        </p>
        <p className="text-[#adb5bd] text-[6px]">{pos.shortRole}</p>
      </div>
    </div>
  )
}

// ─── QueuedVacancy ────────────────────────────────────────────────────────────

function QueuedVacancy({ posId, small = false }: { posId: PositionId; small?: boolean }) {
  const pos = POSITIONS.find(p => p.id === posId)!
  return (
    <div className={`rounded-xl border border-dashed border-amber-400/30 bg-amber-500/5 flex items-center justify-center flex-shrink-0 opacity-50 ${small ? 'w-[76px] h-[48px]' : 'w-[96px] h-[56px]'}`}>
      <div className="text-center px-1.5">
        <p className="text-amber-500/70 text-[6px] font-bold uppercase tracking-widest">Next</p>
        <p className="text-[#adb5bd] text-[6px] mt-0.5">{pos.shortRole}</p>
      </div>
    </div>
  )
}

// ─── DraggableSlot ────────────────────────────────────────────────────────────

function DraggableSlot({ id, posId, onDrop, onDragMove, onDragStart, onDragEnd, onSelect, dimmed, floatDelay = 0, small = false, isTargeted = false }: {
  id: CandidateId
  posId: PositionId
  onDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
  dimmed?: boolean
  floatDelay?: number
  small?: boolean
  isTargeted?: boolean
}) {
  const [placed, setPlaced] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const c = getCandidateById(id)

  if (placed) {
    return <OrgCard posId={posId} name={c.name} role={c.currentRole} candidateId={id} small={small} />
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
      whileDrag={{ scale: 1.14, rotate: 4, zIndex: 999, opacity: 0.95, y: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
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
        onDragMove(null)
        onDragEnd?.()
        if (pt && onDrop(id, pt)) setPlaced(true)
      }}
      className="relative cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    >
      <OrgCard posId={posId} name={c.name} role={c.currentRole} candidateId={id} small={small} />
      <AnimatePresence>
        {isTargeted && (
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

function PlacedSlot({ id, posId, onMove, onUnplace, onDragMove, onDragStart, onDragEnd, onSelect }: {
  id: CandidateId
  posId: PositionId
  onMove: (point: { x: number; y: number }) => boolean
  onUnplace: () => void
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
}) {
  const c = getCandidateById(id)
  const realFit = getSlotFit(posId, id)
  const [displayFit, setDisplayFit] = useState(0)
  const [showBurst, setShowBurst] = useState(true)
  const [removed, setRemoved] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)

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
      className="relative animate-slot-in cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
      drag
      dragMomentum={false}
      dragElastic={0.3}
      whileDrag={{ scale: 1.1, rotate: -3, zIndex: 999, opacity: 0.85, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
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
        onDragMove(null)
        onDragEnd?.()
        const dist = Math.abs(info.offset.x) + Math.abs(info.offset.y)
        if (dist <= 20) return  // tiny drag — snap back, stay placed
        if (pt && onMove(pt)) { setRemoved(true); return }  // moved to active vacancy
        setRemoved(true); onUnplace()  // dropped elsewhere — just unplace
      }}
    >
      {showBurst && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-green-400 z-20 pointer-events-none"
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onAnimationComplete={() => setShowBurst(false)}
        />
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
      <OrgCard
        posId={posId}
        filled
        name={c.name}
        role={c.currentRole}
        candidateId={id}
        fit={displayFit}
        badge={
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-[7px] font-black leading-none">✓</span>
          </div>
        }
      />
    </motion.div>
  )
}

// ─── Connector helpers ────────────────────────────────────────────────────────

function VLine({ glow = false }: { glow?: boolean }) {
  return (
    <div className={`w-px h-2 mx-auto flex-shrink-0 transition-all duration-300
      ${glow ? 'bg-[#016699] shadow-sm' : 'bg-[#016699]/50'}`} />
  )
}

function GhostNode({ name, role }: { name: string; role: string }) {
  return (
    <div className="relative w-[44px] rounded-xl border border-white/10 bg-[#1a2840] overflow-hidden opacity-[0.22] flex-shrink-0">
      <div className="h-[22px] flex items-center justify-center bg-white/5">
        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white/40 text-[6px] font-bold">{name.charAt(0)}</span>
        </div>
      </div>
      <div className="px-1 py-1">
        <p className="text-[#f0f4f8] font-bold text-[6px] leading-tight truncate">{name}</p>
        <p className="text-white/40 text-[5px] leading-tight truncate">{role}</p>
      </div>
    </div>
  )
}

function BossNode() {
  return (
    <div className="relative w-[96px] rounded-xl border border-white/10 bg-[#1a2840] overflow-hidden opacity-30 flex-shrink-0">
      <div className="h-[38px] flex items-center justify-center bg-white/5">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white/50 text-xs font-bold">RS</span>
        </div>
      </div>
      <div className="px-1.5 pt-1 pb-1.5">
        <p className="text-[#f0f4f8] font-bold text-[8px] leading-tight truncate">Reza Santoso</p>
        <p className="text-white/40 text-[7px] leading-tight truncate mt-0.5">Commercial Dir</p>
      </div>
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
  activeDragId, onDragStart, onDragEnd, onUnplace, onMovePlaced, onSelect, initialZoom = 1.0,
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
  onSelect: (id: CandidateId) => void
  initialZoom?: number
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
      setExplored(true)
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
  const SMALL_POSITIONS: Set<PositionId> = new Set(['bintang', 'sari', 'rizky', 'putri'])

  function renderSlot(posId: PositionId) {
    const small = SMALL_POSITIONS.has(posId)
    if (posId === activeVacancyId) {
      return <ActiveVacancy nodeRef={nodeRef} isDragOver={isDragOver} posId={posId} small={small} />
    }
    if (vacancyQueue.includes(posId) && !assignments[posId]) {
      return <QueuedVacancy posId={posId} small={small} />
    }
    const occupant = assignments[posId]
    if (!occupant) return <QueuedVacancy posId={posId} small={small} />
    const isNatural = occupant === (posId as string)
    if (isNatural) {
      return (
        <DraggableSlot
          id={occupant} posId={posId} onDrop={onDrop} onDragMove={onDragMove}
          onDragStart={() => onDragStart(occupant)}
          onDragEnd={onDragEnd}
          onSelect={() => onSelect(occupant)}
          dimmed={isDragging && activeDragId !== occupant}
          floatDelay={FLOAT_DELAYS[posId] ?? 0}
          small={small}
          isTargeted={isDragOver && activeDragId === occupant}
        />
      )
    }
    return (
      <PlacedSlot
        id={occupant} posId={posId}
        onMove={(pt) => onMovePlaced(posId, occupant, pt)}
        onUnplace={() => onUnplace(posId)}
        onDragMove={onDragMove}
        onDragStart={() => onDragStart(occupant)}
        onDragEnd={onDragEnd}
        onSelect={() => onSelect(occupant)}
      />
    )
  }

  const connBase = isDragging ? 'bg-[#016699]/70' : 'bg-[#016699]/50'
  const connSub = isDragging ? 'bg-[#016699]/55' : 'bg-[#016699]/38'

  return (
    <div ref={outerRef} className="flex-1 min-h-0 overflow-hidden dot-grid relative" style={{ cursor: isDragging ? 'default' : 'grab' }}>
    {/* Zoom controls */}
    <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1">
      <button
        onClick={() => changeZoom(0.15)}
        className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/60 text-base font-bold flex items-center justify-center active:scale-90 transition-all select-none"
      >+</button>
      <button
        onClick={() => changeZoom(-0.15)}
        className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/60 text-base font-bold flex items-center justify-center active:scale-90 transition-all select-none"
      >−</button>
    </div>
    {/* Pan/explore hint */}
    <AnimatePresence>
      {!explored && (
        <motion.div
          key="pan-hint"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none z-10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/25">
            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white/25 text-[9px] uppercase tracking-[0.2em] font-semibold">drag to explore</span>
        </motion.div>
      )}
    </AnimatePresence>
    {/* Centering wrapper — ensures scale pivot is always at horizontal center of container */}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
    <div
      className="flex flex-col items-center py-2 min-w-max min-h-full"
      style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'top center', willChange: 'transform' }}
    >
      <BossNode />
      <div className={`w-px h-2 mx-auto ${connBase} transition-colors duration-300`} />

      {/* Vertical stack of all branches */}
      <div className="flex flex-col items-center">

        {/* Maya branch */}
        <div className="flex flex-col items-center flex-shrink-0">
          {renderSlot('maya')}
          <div className={`w-px h-2 ${connSub} transition-colors duration-300`} />
          <div className="relative flex gap-1">
            <div className={`absolute top-0 h-px ${connSub} transition-colors duration-300`} style={{ left: '38px', right: '38px' }} />
            {(['bintang', 'sari'] as PositionId[]).map(id => (
              <div key={id} className="flex flex-col items-center flex-shrink-0">
                <div className={`w-px h-2 ${connSub}`} />
                {renderSlot(id)}
              </div>
            ))}
          </div>
        </div>

        <div className={`w-px h-3 ${connBase} transition-colors duration-300`} />

        {/* Sales Manager branch */}
        <div className="flex flex-col items-center flex-shrink-0">
          {renderSlot('sales_manager')}
          <div className={`w-px h-2 ${connBase} transition-colors duration-300`} />
          <div className="relative flex gap-1.5">
            <div className={`absolute top-0 h-px ${connSub} transition-colors duration-300`} style={{ width: 'calc(100% - 96px)', left: '48px' }} />
            {(['andi', 'rani', 'fajar'] as PositionId[]).map(id => (
              <div key={id} className="flex flex-col items-center flex-shrink-0">
                <div className={`w-px h-2 ${connSub}`} />
                {renderSlot(id)}
              </div>
            ))}
          </div>
        </div>

        <div className={`w-px h-3 ${connBase} transition-colors duration-300`} />

        {/* Dimas branch */}
        <div className="flex flex-col items-center flex-shrink-0">
          {renderSlot('dimas')}
          <div className={`w-px h-2 ${connSub} transition-colors duration-300`} />
          <div className="relative flex gap-1">
            <div className={`absolute top-0 h-px ${connSub} transition-colors duration-300`} style={{ left: '38px', right: '38px' }} />
            {(['rizky', 'putri'] as PositionId[]).map(id => (
              <div key={id} className="flex flex-col items-center flex-shrink-0">
                <div className={`w-px h-2 ${connSub}`} />
                {renderSlot(id)}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    </div> {/* end centering wrapper */}
    </div>
  )
}

// ─── ExternalCandidateSlot ────────────────────────────────────────────────────

function ExternalCandidateSlot({ candidate, alreadyPlaced, onDrop, onDragMove, onDragStart, onDragEnd, onSelect, dimmed }: {
  candidate: Candidate
  alreadyPlaced: boolean
  onDrop: (id: CandidateId, point: { x: number; y: number }) => boolean
  onDragMove: (point: { x: number; y: number } | null) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onSelect?: () => void
  dimmed?: boolean
}) {
  const [placed, setPlaced] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!alreadyPlaced) setPlaced(false)
  }, [alreadyPlaced])

  if (placed || alreadyPlaced) {
    return (
      <div onClick={() => onSelect?.()} className="relative w-[72px] rounded-xl border border-green-400/25 bg-green-500/8 overflow-hidden opacity-40 select-none flex-shrink-0 cursor-pointer">
        <div className="h-[30px] flex items-center justify-center bg-green-500/10">
          <Avatar id={candidate.id} name={candidate.name} size="xs" />
        </div>
        <div className="px-1.5 pt-1 pb-1.5">
          <p className="text-[#f0f4f8] font-bold text-[7px] leading-tight truncate">{candidate.name.split(' ')[0]}</p>
          <p className="text-green-400 text-[6px] font-bold mt-0.5">placed ✓</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      drag dragSnapToOrigin dragElastic={0.45} dragMomentum={false}
      animate={{ opacity: dimmed ? 0.3 : 1, scale: dimmed ? 0.95 : 1 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      whileDrag={{ scale: 1.14, rotate: -4, zIndex: 999, opacity: 0.95,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      onTap={() => onSelect?.()}
      onDragStart={() => {
        const r = cardRef.current?.getBoundingClientRect()
        dragOrigin.current = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
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
        onDragMove(null)
        onDragEnd?.()
        if (pt && onDrop(candidate.id, pt)) setPlaced(true)
      }}
      className="relative w-[72px] rounded-xl border border-amber-400/50 bg-[#1a2840] overflow-hidden cursor-grab active:cursor-grabbing select-none flex-shrink-0"
      style={{ touchAction: 'none' }}
    >
      {/* EXT ribbon */}
      <div className="absolute top-0 left-0 w-[36px] h-[36px] overflow-hidden pointer-events-none z-10">
        <div className="absolute bg-amber-500 text-white font-black"
          style={{ fontSize: '5px', padding: '1.5px 10px', transform: 'rotate(-45deg) translate(-4px, 6px)', letterSpacing: '0.05em' }}>
          EXT
        </div>
      </div>
      <div className="h-[30px] flex items-center justify-center bg-amber-500/10">
        <Avatar id={candidate.id} name={candidate.name} size="xs" />
      </div>
      <div className="px-1.5 pt-1 pb-1.5">
        <p className="text-[#f0f4f8] font-bold text-[7px] leading-tight truncate">{candidate.name.split(' ')[0]}</p>
        <p className="text-white/40 text-[6px] truncate mt-0.5">{candidate.currentRole.split(' ').slice(0, 2).join(' ')}</p>
        <div className="mt-1">
          <ReadinessBadge readiness={candidate.readiness} tiny />
        </div>
      </div>
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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10"
        style={{ background: '#1a2840' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Drag handle / tap to close */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-9 h-1 rounded-full bg-white/25" />
        </div>
        <div className="px-4 pb-6 pt-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <FitRingWithLabel fit={c.roleFit} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[#f0f4f8] font-bold text-sm leading-tight truncate">{c.name}</p>
              <p className="text-white/40 text-xs mt-0.5 truncate">{c.currentRole}</p>
            </div>
          </div>
          {/* Aspect bars — no standard marker, player decides from raw values */}
          <AspectBars assessment={c.assessment} standard={benchPos.standard} showStandard={false} />
        </div>
      </motion.div>
    </>
  )
}

// ─── Portrait bottom panel ────────────────────────────────────────────────────

function PortraitBottomPanel({
  assignments, activeVacancyId, allFilled,
  onExternalDrop, onExternalDragMove, onConfirm,
  activeDragId, onDragStart, onDragEnd, onSelect,
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
  onSelect: (id: CandidateId) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const overallFit = computeOverallFit(assignments)
  const usedCandidateIds = new Set(Object.values(assignments).filter(Boolean))
  const vacantPos = activeVacancyId ? POSITIONS.find(p => p.id === activeVacancyId)! : null

  // Auto-expand when dragging (so drop target is accessible)
  useEffect(() => {
    if (activeDragId !== null) setExpanded(true)
  }, [activeDragId])

  return (
    <div className="border-t border-white/10 flex-shrink-0">

      {/* Gauge row — always visible, tap to toggle expand */}
      <div
        className="flex gap-2 px-3 pt-2 pb-1.5 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-[80px] flex-shrink-0 rounded-xl border border-white/10 bg-[#1a2840] pt-1 pb-0 px-1">
          <ArcGauge value={overallFit} />
        </div>
        <div className="flex-1 min-w-0">
          {vacantPos ? (
            <div className="h-full rounded-xl border border-red-500/25 bg-red-500/5 px-2 py-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-red-400 text-[6px] font-bold uppercase tracking-widest">Needs</p>
                <p className="text-[#f0f4f8] text-[7px] font-bold">{vacantPos.shortRole}</p>
              </div>
              <AspectBars assessment={null} standard={vacantPos.standard} />
            </div>
          ) : (
            <div className="h-full rounded-xl border border-green-500/25 bg-green-500/5 px-2.5 flex items-center justify-center">
              <p className="text-green-400 text-[7px] font-bold text-center">✓ All positions filled</p>
            </div>
          )}
        </div>
        {/* Expand chevron */}
        <div className="flex-shrink-0 flex items-center">
          <div
            className="text-white/30 text-[10px] leading-none transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </div>
        </div>
      </div>

      {/* External pool + confirm — only when expanded */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-3 pt-1 pb-3">
              <div>
                <p className="text-white/40 text-[7px] uppercase tracking-widest text-center mb-1.5">External Pool</p>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
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
              <div>
                <PrimaryButton onClick={onConfirm} disabled={!allFilled}>Confirm →</PrimaryButton>
                {!allFilled && activeVacancyId && (
                  <p className="text-white/30 text-[7px] text-center mt-1">Fill all positions first</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <div className="rounded-xl border border-white/10 bg-[#1a2840] pt-2 pb-1 px-2 flex-shrink-0">
          <ArcGauge value={overallFit} />
        </div>

        {/* Vacant position standard */}
        {(() => {
          const vacantPos = activeVacancyId ? POSITIONS.find(p => p.id === activeVacancyId)! : null
          return vacantPos ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-2.5 py-1.5 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-red-400 text-[6px] font-bold uppercase tracking-widest">Vacant · needs</p>
                <p className="text-[#f0f4f8] text-[7px] font-bold">{vacantPos.shortRole}</p>
              </div>
              <AspectBars assessment={null} standard={vacantPos.standard} />
            </div>
          ) : (
            <div className="rounded-xl border border-green-500/25 bg-green-500/5 px-2.5 py-1.5 flex-shrink-0">
              <p className="text-green-400 text-[7px] font-bold text-center">✓ All positions filled</p>
            </div>
          )
        })()}

        {/* Candidate detail */}
        <div className="rounded-xl border border-white/10 bg-[#1a2840] flex-shrink-0 flex flex-col items-center justify-center px-2.5 py-2 min-h-[90px]">
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
                            <p className="text-[#f0f4f8] font-bold text-[10px] leading-tight truncate">{c.name}</p>
                            <p className="text-white/40 text-[7px] truncate">{c.currentRole}</p>
                          </div>
                        </div>
                        <AspectBars assessment={c.assessment} standard={benchPos.standard} showStandard={false} />
                      </motion.div>
                    )
                  })()
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/25">
                        <circle cx="12" cy="8" r="4" fill="currentColor" />
                        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-white/25 text-[7px] leading-tight">Tap a card to see<br/>their profile</p>
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
          <p className="text-white/40 text-[7px] uppercase tracking-widest text-center mb-1.5">External Pool</p>
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
            <p className="text-white/30 text-[7px] text-center mt-1">Fill all positions first</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Explore Screen ───────────────────────────────────────────────────────────

export function ExploreScreen() {
  const { state, actions } = useGame()
  const vacantRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [assignments, setAssignments] = useState<Partial<Record<PositionId, CandidateId>>>(INITIAL_ASSIGNMENTS)
  const [vacancyQueue, setVacancyQueue] = useState<PositionId[]>(['sales_manager'])
  const [activeDragId, setActiveDragId] = useState<CandidateId | null>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<CandidateId | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerStart, setTimerStart] = useState<number | null>(null)
  const [showToast, setShowToast] = useState(false)
  const tutorialDone = timerStart !== null

  const activeVacancyId = vacancyQueue[0] ?? null
  const allFilled = vacancyQueue.length === 0
  const smOccupant = assignments['sales_manager'] ?? null
  const isUrgent = tutorialDone && timeLeft <= 10

  function triggerFirstDrop() {
    if (timerStart !== null) return
    const now = Date.now()
    setTimerStart(now)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
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

    // Reverse cascade: if internal candidate's natural slot was vacated, restore it
    if (candidate.source === 'internal') {
      const naturalPosId = occupant as unknown as PositionId
      if (newQueue.includes(naturalPosId)) {
        newQueue = newQueue.filter(q => q !== naturalPosId)
        newAssignments[naturalPosId] = occupant
      }
    }

    setAssignments(newAssignments)
    setVacancyQueue(newQueue)
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

  function handleDrop(candidateId: CandidateId, point: { x: number; y: number }): boolean {
    setIsDragOver(false)
    if (!activeVacancyId || !isOverVacancy(point)) return false

    const { assignments: newA, queue: newQ } = applyDrop(
      candidateId, activeVacancyId, null, assignments, vacancyQueue.slice(1)
    )
    setAssignments(newA)
    setVacancyQueue(newQ)

    const candidate = getCandidateById(candidateId)
    if (activeVacancyId === 'sales_manager') {
      logEvent(
        candidate.source === 'external' ? 'external_profile_opened' : 'employee_profile_opened',
        state.sessionId,
        { candidateId }
      )
    }
    triggerFirstDrop()
    return true
  }

  function handleMovePlaced(fromPosId: PositionId, candidateId: CandidateId, point: { x: number; y: number }): boolean {
    setIsDragOver(false)
    if (!activeVacancyId || !isOverVacancy(point) || fromPosId === activeVacancyId) return false

    // Reverse the original cascade before computing the new state
    const candidate = getCandidateById(candidateId)
    let baseA = { ...assignments }
    let baseQ = [...vacancyQueue]

    if (candidate.source === 'internal') {
      const naturalPosId = candidateId as unknown as PositionId
      // If natural slot was vacated due to this card's original placement, close it temporarily
      if (baseQ.includes(naturalPosId)) {
        baseQ = baseQ.filter(q => q !== naturalPosId)
        baseA[naturalPosId] = candidateId
      }
    }

    // Now apply the move: fromPosId becomes vacant, candidate goes to activeVacancyId
    const { assignments: newA, queue: newQ } = applyDrop(
      candidateId, activeVacancyId, fromPosId, baseA, baseQ.filter(q => q !== activeVacancyId)
    )
    setAssignments(newA)
    setVacancyQueue(newQ)
    triggerFirstDrop()
    return true
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Urgency vignette */}
      {isUrgent && (
        <div
          className="absolute inset-0 pointer-events-none z-50 animate-pulse-vignette"
          style={{ borderRadius: 'inherit' }}
        />
      )}

      <TimerBar
        timerStartedAt={timerStart}
        onTick={setTimeLeft}
        onExpire={() => {
          const pick = smOccupant ?? null
          actions.timeUp(pick, computeOverallFit(assignments))
        }}
      />

      {/* Tutorial hint — fades away after first drop */}
      <AnimatePresence>
        {!tutorialDone && (
          <motion.div
            key="tutorial-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            className="pointer-events-none z-30 px-4 pt-1 pb-2"
          >
            <div className="rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 flex items-center gap-3">
              {/* Ghost hand animation */}
              <motion.span
                className="text-xl flex-shrink-0 select-none"
                animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              >
                👆
              </motion.span>
              <div className="min-w-0">
                <p className="text-brand text-[11px] font-bold leading-tight">Tarik kandidat ke slot merah</p>
                <p className="text-white/40 text-[9px] mt-0.5">Timer mulai setelah drag pertama</p>
              </div>
              {/* Bouncing arrow toward canvas */}
              <motion.span
                className="text-brand text-sm flex-shrink-0"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              >
                ↓
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Timer dimulai!" toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#1a2840] border border-amber-400/40 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <span className="text-base">⏱</span>
              <p className="text-amber-400 text-xs font-bold whitespace-nowrap">Timer dimulai! 60 detik</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
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
            onSelect={setSelectedCandidateId}
            initialZoom={0.55}
          />
        </div>
        <PortraitBottomPanel
          assignments={assignments}
          activeVacancyId={activeVacancyId}
          allFilled={allFilled}
          onExternalDrop={handleDrop}
          onExternalDragMove={handleDragMove}
          onConfirm={() => {
            if (smOccupant) {
              actions.confirmExplore(smOccupant, computeOverallFit(assignments), timeLeft)
            }
          }}
          activeDragId={activeDragId}
          onDragStart={(id) => setActiveDragId(id)}
          onDragEnd={() => setActiveDragId(null)}
          onSelect={setSelectedCandidateId}
        />
      </div>

      {/* Candidate detail bottom sheet */}
      <AnimatePresence>
        {selectedCandidateId && (
          <CandidateSheet
            key={selectedCandidateId}
            candidateId={selectedCandidateId}
            benchPos={POSITIONS.find(p => p.id === (activeVacancyId ?? 'sales_manager'))!}
            onClose={() => setSelectedCandidateId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
