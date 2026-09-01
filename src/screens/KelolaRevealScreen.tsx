import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

// ─── Mini-mockups ─────────────────────────────────────────────────────────────

function MiniVisibilityMap() {
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <div className="w-16 h-9 rounded-[5px] bg-slate-100 border border-slate-200" />
      <div className="w-px h-4 bg-slate-200" />
      <div className="relative flex gap-3">
        <div className="absolute -top-[6px] left-6 right-6 h-px bg-slate-200" />
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-slate-200" />
          <div className="w-14 h-9 rounded-[5px] bg-green-100 border border-green-300" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-slate-200" />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-14 h-9 rounded-[5px] bg-red-50 border border-dashed border-red-400 flex items-center justify-center"
          >
            <span className="text-red-500 text-[9px] font-black">VACANT</span>
          </motion.div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-px h-[6px] bg-slate-200" />
          <div className="w-14 h-9 rounded-[5px] bg-amber-50 border border-amber-200" />
        </div>
      </div>
    </div>
  )
}

function MiniTDP() {
  const cards = [
    { score: 92, top: true, name: 'Nadia' },
    { score: 80, top: false, name: 'Rani' },
    { score: 68, top: false, name: 'Kevin' },
  ]
  return (
    <div className="flex items-end gap-3">
      {cards.map(({ score, top, name }, i) => (
        <div
          key={i}
          className={`w-[72px] rounded-[8px] border overflow-hidden ${top ? 'border-brand bg-brand/10' : 'border-slate-200 bg-white'}`}
        >
          <div className={`h-10 flex items-center justify-center ${top ? 'bg-brand/10' : 'bg-slate-50'}`}>
            <div className={`w-7 h-7 rounded-full ${top ? 'bg-brand' : 'bg-slate-200'} flex items-center justify-center`}>
              <span className={`text-[9px] font-black ${top ? 'text-white' : 'text-slate-500'}`}>{name[0]}</span>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <p className={`text-xs font-bold truncate ${top ? 'text-[#0f172a]' : 'text-slate-400'}`}>{name}</p>
            <p className={`text-sm font-black ${top ? 'text-brand' : 'text-slate-300'}`}>{score}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniIProfile() {
  const bars = [
    { label: 'LEAD', val: 82 },
    { label: 'DRIVE', val: 68 },
    { label: 'INFL', val: 90 },
  ]
  return (
    <div className="w-[200px] rounded-[10px] border border-slate-200 bg-white px-4 py-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-brand/15 flex-shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-brand font-black">N</span>
        </div>
        <div>
          <p className="text-[#0f172a] text-xs font-bold leading-none">Nadia P.</p>
          <p className="text-slate-400 text-[9px] mt-0.5">Sales Supervisor</p>
        </div>
      </div>
      {bars.map(({ label, val }, i) => (
        <div key={i} className="flex items-center gap-2">
          <p className="text-slate-400 text-[8px] w-8 text-right flex-shrink-0">{label}</p>
          <div className="flex-1 h-[5px] rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${val}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="h-full rounded-full bg-brand"
            />
          </div>
          <p className="text-brand text-[9px] font-black w-6 flex-shrink-0">{val}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Beat content ─────────────────────────────────────────────────────────────

const REVEALS = [
  {
    inGame: 'Org chart dengan posisi kosong',
    module: 'Visibility Map',
    inKelola: 'Struktur organisasi nyata Anda dengan peta risiko suksesi. Posisi rentan terdeteksi secara otomatis.',
    mockup: <MiniVisibilityMap />,
  },
  {
    inGame: 'Perbandingan kandidat berdasarkan skor',
    module: 'Talent Decision Platform',
    inKelola: 'Bandingkan kandidat secara berdampingan menggunakan data asesmen nyata. Bandingkan dulu, baru putuskan.',
    mockup: <MiniTDP />,
  },
  {
    inGame: '3 aspek di setiap kartu kandidat',
    module: 'iProfile',
    inKelola: 'Laporan asesmen lengkap yang bisa dibaca dalam sekali pandang.',
    mockup: <img src="/iprofile.gif" alt="iProfile" className="w-[340px] rounded-[10px] shadow-sm border border-slate-200" />,
  },
]

const N_BEATS = 4

function KelolaBeat({ beat }: { beat: number }) {
  if (beat === 0) {
    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <div className="w-16 h-16 rounded-3xl bg-brand/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#1D6FF2" strokeWidth="1.5" fill="none" opacity="0.6" />
            <circle cx="16" cy="16" r="4" fill="#1D6FF2" />
          </svg>
        </div>
        <div>
          <p className="text-brand text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Plot twist</p>
          <h1 className="text-4xl font-black text-[#0f172a] leading-tight">
            Anda baru saja<br />menggunakan <span className="text-brand">Kelola Apps</span>.
          </h1>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]">
          Setiap mekanik dalam permainan tadi adalah fitur nyata dari Kelola.
        </p>
      </div>
    )
  }

  if (beat >= 1 && beat <= 3) {
    const r = REVEALS[beat - 1]
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        <p className="text-slate-400 text-xs uppercase tracking-widest">
          Dalam game: <span className="text-slate-600 normal-case tracking-normal">{r.inGame}</span>
        </p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 220 }}
          className="py-2"
        >
          {r.mockup}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-brand/40" />
            <p className="text-brand font-black text-2xl">{r.module}</p>
            <div className="w-4 h-px bg-brand/40" />
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]">{r.inKelola}</p>
        </motion.div>
      </div>
    )
  }

  return null
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function KelolaRevealScreen() {
  const { actions } = useGame()
  const [beat, setBeat] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollRef = useRef(0)
  const touchStartY = useRef(0)
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

  if (isFinal) {
    return (
      <div
        className="flex flex-col h-full overflow-y-auto bg-white"
        style={{ scrollbarWidth: 'none' }}
        onWheel={e => { if (e.deltaY < 0) goBack() }}
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
        onTouchEnd={e => {
          const dy = touchStartY.current - e.changedTouches[0].clientY
          if (dy < -40) goBack()
        }}
      >

        <div className="flex flex-col items-center px-6 pt-6 pb-8 gap-5 max-w-sm mx-auto w-full">

          {/* Back */}
          <div className="w-full">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-slate-400 text-[11px] font-semibold"
            >
              ← Kembali
            </button>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(29,111,242,0.08)', border: '1px solid rgba(29,111,242,0.15)' }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-1.5 h-1.5 rounded-full bg-brand"
            />
            <span className="text-brand text-[9px] font-bold uppercase tracking-[0.2em]">Next Stop</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-[#0f172a] text-2xl font-black leading-tight">
              Lanjut ke kanan<br />
              <span className="text-brand">lihat Kelola langsung</span>
            </h1>
            <p className="text-slate-500 text-[12px] leading-relaxed mt-2">
              Kamu sudah mencoba menyusun talent.<br />
              Sekarang, lihat bagaimana Kelola bekerja<br />di organisasi nyata.
            </p>
          </motion.div>

          {/* BIG ARROW + BUBBLE TRAIL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="flex items-center gap-3 py-2"
          >
            {/* Arrow bubble */}
            <motion.div
              animate={{ x: [0, 7, 0], opacity: [1, 0.85, 1] }}
              transition={{ repeat: Infinity, duration: 1.35, ease: 'easeInOut' }}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, #1D6FF2, #06B6D4)',
                boxShadow: '0 0 0 8px rgba(29,111,242,0.10), 0 0 28px rgba(29,111,242,0.35)',
              }}
            >
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* Bubble trail */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.75, 0.2], x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.35, delay: i * 0.18, ease: 'easeInOut' }}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: 10 - i * 2.5,
                    height: 10 - i * 2.5,
                    background: `rgba(29,111,242,${0.7 - i * 0.2})`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* 3 micro-steps */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="w-full flex flex-col gap-2"
          >
            {[
              {
                text: 'Jalan ke bagian kanan booth',
                svg: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
              },
              {
                text: 'Temui tim Talentlytica',
                svg: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
              },
              {
                text: 'Lihat demo Kelola langsung',
                svg: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
              },
            ].map(({ svg, text }, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(29,111,242,0.08)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D6FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {svg}
                  </svg>
                </div>
                <p className="text-[#0f172a] text-[12px] font-semibold">{text}</p>
              </div>
            ))}
          </motion.div>

          {/* Contact — secondary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46 }}
            className="w-full"
          >
            <p className="text-slate-400 text-[9px] text-center mb-2">Tidak sempat ngobrol sekarang? Hubungi kami:</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D6FF2" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.0 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[8px] uppercase tracking-wide">WhatsApp</p>
                  <p className="text-[#0f172a] text-[10px] font-semibold truncate">+62 XXX-XXXX-XXXX</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D6FF2" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[8px] uppercase tracking-wide">Email</p>
                  <p className="text-[#0f172a] text-[10px] font-semibold truncate">hello@talentlytica.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="w-full"
          >
            <button
              onClick={() => actions.finish()}
              className="w-full py-4 rounded-2xl font-black text-white text-[15px] tracking-wide flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1D6FF2 0%, #6366f1 100%)',
                boxShadow: '0 8px 28px rgba(29,111,242,0.30)',
              }}
            >
              Lanjut ke Demo Kelola
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </button>
          </motion.div>

        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col h-full items-center justify-center px-6 text-center overflow-hidden bg-white"
      onClick={() => { if (!isFinal) advance() }}
      onWheel={handleWheel}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        if (isFinal) return
        const dy = touchStartY.current - e.changedTouches[0].clientY
        if (Math.abs(dy) > 40) dy > 0 ? advance() : goBack()
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.32 }}
          className="relative"
        >
          <KelolaBeat beat={beat} />
        </motion.div>
      </AnimatePresence>

      {/* Scroll hint — beat 0, belum interaksi */}
      <AnimatePresence>
        {beat === 0 && !scrolled && (
          <motion.div
            key="scroll-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
          >
            <span className="text-slate-400 text-[9px] uppercase tracking-[0.2em] font-semibold">geser</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4l5 5 5-5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="flex gap-1.5">
          {Array.from({ length: N_BEATS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === beat ? 'w-5 bg-brand' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
