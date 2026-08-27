import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { RESIGNED_PERSON } from '../data/scenario'

function OrgNode({
  name = '', role, isVacant, isNew, dim, small,
}: {
  name?: string
  role: string
  isVacant?: boolean
  isNew?: boolean
  dim?: boolean
  small?: boolean
}) {
  const w = small ? 'w-[44px]' : 'w-[96px]'
  const avatarSize = small ? 'w-4 h-4 text-[6px]' : 'w-8 h-8 text-[10px]'
  const avatarArea = small ? 'h-[22px]' : 'h-[38px]'
  const nameSize = small ? 'text-[6px]' : 'text-[8px]'
  const roleSize = small ? 'text-[5px]' : 'text-[7px]'

  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0 } : undefined}
      animate={{ scale: 1, opacity: dim ? 0.22 : 1 }}
      className={`${w} rounded-xl border overflow-hidden flex-shrink-0
        ${isVacant
          ? 'border-red-500/60 border-dashed bg-red-500/10 animate-vacant-glow'
          : 'border-white/10 bg-[#1a2840] shadow-sm'
        }`}
    >
      <div className={`${avatarArea} flex items-center justify-center ${isVacant ? 'bg-red-500/10' : 'bg-white/5'}`}>
        {isVacant ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-400">
            <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.5" />
            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        ) : (
          <div className={`${avatarSize} rounded-full bg-white/10 flex items-center justify-center`}>
            <span className="text-white/60 font-bold">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="px-1.5 pt-1 pb-1.5">
        {isVacant ? (
          <>
            <p className={`text-red-400 font-black ${nameSize} uppercase tracking-widest leading-tight`}>Vacant</p>
            <p className={`text-white/40 ${roleSize} leading-tight truncate mt-0.5`}>{role}</p>
          </>
        ) : (
          <>
            <p className={`text-[#f0f4f8] font-bold ${nameSize} leading-tight truncate`}>{name.split(' ')[0]}</p>
            <p className={`text-white/40 ${roleSize} leading-tight truncate mt-0.5`}>{role}</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function VLine({ dim = false }: { dim?: boolean }) {
  return <div className={`w-px h-2 mx-auto flex-shrink-0 ${dim ? 'bg-[#1D6FF2]/30' : 'bg-[#1D6FF2]/50'}`} />
}

function HBar({ dim = false, style }: { dim?: boolean; style?: React.CSSProperties }) {
  return <div className={`absolute top-0 h-px ${dim ? 'bg-[#1D6FF2]/30' : 'bg-[#1D6FF2]/50'}`} style={style} />
}

export function OrgChartRevealScreen() {
  const { actions } = useGame()
  const [phase, setPhase] = useState<'normal' | 'notification' | 'vacant'>('normal')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('notification'), 1800)
    const t2 = setTimeout(() => setPhase('vacant'), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex-shrink-0">
        <p className="text-white/40 text-[9px] uppercase tracking-widest font-semibold">PT Nusa Digital</p>
        <h2 className="text-lg font-black text-[#f0f4f8] leading-tight">Organization Chart</h2>
      </div>

      {/* Org tree */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 dot-grid">
        <OrgNode name="Reza Santoso" role="Commercial Dir" />
        <VLine />

        <div className="relative flex items-start gap-2 flex-shrink-0">
          <HBar style={{ left: 48, right: 48 }} />

          {/* Maya branch */}
          <div className="flex flex-col items-center flex-shrink-0 w-[96px]">
            <VLine />
            <OrgNode name="Maya" role="CS Manager" />
            <VLine dim />
            <div className="relative flex gap-1.5">
              <HBar dim style={{ width: 'calc(100% - 44px)', left: 22 }} />
              {[{ name: 'Bintang', role: 'CS Rep' }, { name: 'Sari', role: 'CS Spec' }].map(g => (
                <div key={g.name} className="flex flex-col items-center">
                  <VLine dim />
                  <OrgNode name={g.name} role={g.role} small dim />
                </div>
              ))}
            </div>
          </div>

          {/* Sales Manager branch */}
          <div className="flex flex-col items-center flex-shrink-0 w-[306px]">
            <VLine />
            {phase === 'vacant'
              ? <OrgNode role="Sales Manager" isVacant isNew />
              : <OrgNode name={RESIGNED_PERSON.name} role={RESIGNED_PERSON.role} />
            }
            <VLine dim />
            <div className="relative flex gap-1.5">
              <HBar dim style={{ width: 'calc(100% - 96px)', left: 48 }} />
              {[{ name: 'Andi', role: 'Sr. AE' }, { name: 'Rani', role: 'AE' }, { name: 'Fajar', role: 'BD Exec' }].map(r => (
                <div key={r.name} className="flex flex-col items-center flex-shrink-0">
                  <VLine dim />
                  <OrgNode name={r.name} role={r.role} />
                </div>
              ))}
            </div>
          </div>

          {/* Dimas branch */}
          <div className="flex flex-col items-center flex-shrink-0 w-[96px]">
            <VLine />
            <OrgNode name="Dimas" role="Mkt. Manager" />
            <VLine dim />
            <div className="relative flex gap-1.5">
              <HBar dim style={{ width: 'calc(100% - 44px)', left: 22 }} />
              {[{ name: 'Rizky', role: 'Mkt Spec' }, { name: 'Putri', role: 'Content' }].map(g => (
                <div key={g.name} className="flex flex-col items-center">
                  <VLine dim />
                  <OrgNode name={g.name} role={g.role} small dim />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resigned notification */}
      <AnimatePresence>
        {phase === 'notification' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-6 bottom-20 bg-[#1a2840] border border-amber-400/40 rounded-2xl p-4 shadow-lg z-10"
          >
            <p className="text-amber-400 text-[9px] font-bold uppercase tracking-widest">Organization Update</p>
            <p className="text-[#f0f4f8] font-bold mt-1 text-sm">
              {RESIGNED_PERSON.name} — {RESIGNED_PERSON.role}
            </p>
            <p className="text-white/60 text-sm mt-0.5">has resigned.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="px-6 pb-4 safe-bottom flex-shrink-0">
        <AnimatePresence>
          {phase === 'vacant' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-3 text-center">
                <p className="text-white/60 text-sm">The position is now open.</p>
                <p className="text-[#f0f4f8] font-semibold text-sm">Who should fill the seat?</p>
              </div>
              <PrimaryButton onClick={() => actions.viewOrgChart()}>
                Find a Replacement →
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
