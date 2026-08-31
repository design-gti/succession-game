import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Avatar } from '../components/Avatar'
import { getCandidateById } from '../data/scenario'
import type { Persona } from '../game/types'

const PERSONA_CONFIG: Record<Persona, {
  emoji: string
  subtitle: string
  color: string
  qualityLabel: string
  speedLabel: string
  description: string
}> = {
  'TALENT STRATEGIST': {
    emoji: '🎯',
    subtitle: 'Kualitas tinggi, proses efisien.',
    color: '#1D6FF2',
    qualityLabel: 'Kualitas Tinggi',
    speedLabel: 'Kecepatan Tinggi',
    description: 'Kamu memilih kandidat yang kuat tanpa membuang waktu. Kombinasi langka dari ketajaman penilaian dan efisiensi.',
  },
  'QUALITY ARCHITECT': {
    emoji: '🏛',
    subtitle: 'Kualitas adalah prioritas utama.',
    color: '#16a34a',
    qualityLabel: 'Kualitas Tinggi',
    speedLabel: 'Kecepatan Rendah',
    description: 'Kamu sangat selektif. Pilihan yang solid — tapi posisi kosong cukup lama. Pertimbangkan dampak jangka pendeknya.',
  },
  'RAPID RECRUITER': {
    emoji: '⚡',
    subtitle: 'Cepat, tapi kualitas bisa dikuatkan.',
    color: '#d97706',
    qualityLabel: 'Kualitas Sedang',
    speedLabel: 'Kecepatan Tinggi',
    description: 'Kamu bergerak cepat mengisi posisi. Efisien di operasional, tapi ada ruang untuk meningkatkan kualitas keputusan.',
  },
  'TALENT EXPLORER': {
    emoji: '🧭',
    subtitle: 'Masih menemukan gaya decision-making kamu.',
    color: '#6366f1',
    qualityLabel: 'Kualitas Sedang',
    speedLabel: 'Kecepatan Sedang',
    description: 'Ada potensi yang besar. Dengan data yang lebih sistematis, kamu bisa membuat keputusan yang lebih tajam dan lebih cepat.',
  },
}

function ScoreBubble({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 18 }}
      className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 px-2"
      style={{ background: `${color}10`, border: `1.5px solid ${color}30` }}
    >
      <div className="text-3xl font-black leading-none" style={{ color }}>{value}%</div>
      <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400 text-center leading-tight">{label}</div>
    </motion.div>
  )
}

function TTFChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(15,23,42,0.04)' }}>
      <span className="text-[9px] font-black text-[#0f172a]">{value}</span>
      <span className="text-[7px] text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
    </div>
  )
}

export function ResultScreen() {
  const { state, actions } = useGame()
  const score = state.score!
  const finalPick = state.finalPickId ? getCandidateById(state.finalPickId) : null
  const persona = PERSONA_CONFIG[score.persona] ?? PERSONA_CONFIG['TALENT EXPLORER']
  const ttf = score.timeFill ?? null

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-y-auto scrollable bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center gap-4"
      >

        {/* Talent Decision Score headline */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center gap-1 pt-1"
        >
          <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400">Talent Decision Score</p>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 18 }}
            className="text-7xl font-black leading-none"
            style={{ color: persona.color }}
          >
            {score.total}%
          </motion.div>
          <p className="text-[9px] text-slate-400">70% Org Fit · 30% Hiring Speed</p>
        </motion.div>

        {/* Two sub-score bubbles */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 w-full"
        >
          <ScoreBubble value={score.overallFit} label="Organization Fit" color="#3B82F6" delay={0.25} />
          <ScoreBubble value={score.hiringSpeed} label="Hiring Speed" color="#8B5CF6" delay={0.32} />
        </motion.div>

        {/* TTF stats row */}
        {ttf && ttf.placements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 justify-center"
          >
            <TTFChip label="Hari Total" value={`H${ttf.currentDay}`} />
            <TTFChip label="Avg TTF" value={`${ttf.avgTTF} hr`} />
            <TTFChip label="Posisi Diisi" value={`${ttf.placements.length}/${8}`} />
          </motion.div>
        )}

        {/* Persona stamp */}
        <motion.div
          initial={{ scale: 2, opacity: 0, rotate: -16 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 360, damping: 22 }}
          className="relative w-full rounded-2xl border-4 bg-white px-5 py-4 text-center"
          style={{ borderColor: persona.color + '55', color: persona.color }}
        >
          <div className="text-2xl mb-1">{persona.emoji}</div>
          <div className="text-lg font-black uppercase tracking-widest leading-tight">{score.persona}</div>
          <p className="text-slate-400 text-[10px] mt-0.5 font-semibold">{persona.subtitle}</p>

          {/* Quality × Speed matrix chips */}
          <div className="flex justify-center gap-2 mt-2">
            <span className="px-2 py-[3px] rounded-full text-[7px] font-bold uppercase tracking-wider"
              style={{ background: `${persona.color}15`, color: persona.color }}>
              {persona.qualityLabel}
            </span>
            <span className="px-2 py-[3px] rounded-full text-[7px] font-bold uppercase tracking-wider"
              style={{ background: `${persona.color}15`, color: persona.color }}>
              {persona.speedLabel}
            </span>
          </div>

          <p className="text-slate-500 text-[9px] mt-2 leading-relaxed max-w-[260px] mx-auto">{persona.description}</p>
        </motion.div>

        {/* Final pick */}
        {finalPick && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3"
          >
            <Avatar id={state.finalPickId!} name={finalPick.name} size="sm"
              ringColor={finalPick.source === 'external' ? '#f59e0b' : undefined} />
            <div className="text-left flex-1 min-w-0">
              <p className="text-slate-400 text-[8px] uppercase tracking-wider">Sales Manager</p>
              <p className="text-[#0f172a] font-bold text-sm leading-tight">{finalPick.name}</p>
              <p className="text-[9px] text-slate-400">{finalPick.currentRole}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full"
        >
          <PrimaryButton onClick={() => actions.showKelolaReveal()}>
            Lihat Plot Twist →
          </PrimaryButton>
        </motion.div>

      </motion.div>
    </div>
  )
}
