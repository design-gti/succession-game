import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { checkNameAvailable } from '../lib/api'

export function LeadCaptureScreen() {
  const { actions } = useGame()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Nama harus diisi.')
      return
    }
    if (trimmedName.length < 2) {
      setError('Nama minimal 2 karakter.')
      return
    }

    setLoading(true)
    try {
      const available = await checkNameAvailable(trimmedName)
      if (!available) {
        setError('Nama ini sudah dipakai hari ini, coba nama lain.')
        return
      }
    } catch {
      // offline — lanjut saja
    } finally {
      setLoading(false)
    }

    actions.submitLeadInfo(trimmedName, '', '')
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-[#0f172a] text-sm placeholder:text-slate-400
     outline-none focus:border-brand transition-colors bg-white
     ${hasError ? 'border-red-400' : 'border-slate-200'}`

  return (
    <div className="flex flex-col h-full px-6 py-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#1D6FF2" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1D6FF2" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-brand text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Satu langkah lagi</p>
          <h2 className="text-2xl font-black text-[#0f172a] leading-snug">
            Siapa kamu?
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Masukkan nama untuk muncul di leaderboard.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">
              Nama <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Nama atau nickname kamu"
              className={inputCls(!name.trim() && !!error)}
              autoComplete="name"
              maxLength={30}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="flex-1" />

          <PrimaryButton onClick={handleStart} disabled={loading}>
            {loading ? 'Mengecek…' : 'Mulai Game →'}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  )
}
