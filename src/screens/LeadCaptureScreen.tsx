import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'

const COUNTRY_CODES = [
  { code: '+62', flag: '🇮🇩', label: 'ID' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+60', flag: '🇲🇾', label: 'MY' },
  { code: '+63', flag: '🇵🇭', label: 'PH' },
  { code: '+66', flag: '🇹🇭', label: 'TH' },
  { code: '+84', flag: '🇻🇳', label: 'VN' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+1',  flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
]

function normalizeWithPrefix(countryCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '')
  // Strip leading 0 (local format) or the country digits if user typed them
  const stripped = digits.startsWith('0') ? digits.slice(1) : digits
  return countryCode + stripped
}

export function LeadCaptureScreen() {
  const { actions } = useGame()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+62')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!name.trim() || !phone.trim()) {
      setError('Nama dan nomor HP harus diisi.')
      return
    }
    const digits = phone.replace(/\D/g, '').replace(/^0/, '')
    if (digits.length < 6 || digits.length > 13) {
      setError('Nomor HP tidak valid.')
      return
    }

    const normalizedPhone = normalizeWithPrefix(countryCode, phone)
    setLoading(true)
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.exists) {
          actions.skipToReveal(name.trim(), normalizedPhone, company.trim(), data.score ?? null)
          return
        }
      }
    } catch {
      // Network/API unavailable — proceed normally
    } finally {
      setLoading(false)
    }

    actions.submitLeadInfo(name.trim(), normalizedPhone, company.trim())
  }

  const inputCls = (val: string, required = true) =>
    `w-full px-4 py-3 rounded-xl border text-[#0f172a] text-sm placeholder:text-slate-400
     outline-none focus:border-brand transition-colors bg-white
     ${required && !val.trim() && error ? 'border-red-400' : 'border-slate-200'}`

  const phoneHasError = !phone.trim() && !!error

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
            Data Anda
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Lengkapi data berikut agar hasil permainan dapat kami simpan untuk Anda.
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
              placeholder="Nama atau nickname Anda"
              className={inputCls(name)}
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">
              Perusahaan
            </label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Perusahaan Anda bekerja"
              className={inputCls(company, false)}
              autoComplete="organization"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">
              No. HP <span className="text-red-400">*</span>
            </label>
            <div className={`flex rounded-xl border overflow-hidden transition-colors bg-white ${phoneHasError ? 'border-red-400' : 'border-slate-200'}`}>
              {/* Country code dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  value={countryCode}
                  onChange={e => { setCountryCode(e.target.value); setError('') }}
                  className="appearance-none h-full pl-3 pr-7 py-3 text-sm text-[#0f172a] bg-slate-50 border-r border-slate-200 outline-none cursor-pointer font-medium"
                  style={{ WebkitAppearance: 'none' }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Phone input */}
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                placeholder="812 3456 7890"
                className="flex-1 px-3 py-3 text-sm text-[#0f172a] placeholder:text-slate-400 outline-none bg-white"
                autoComplete="tel-national"
                inputMode="numeric"
              />
            </div>
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
