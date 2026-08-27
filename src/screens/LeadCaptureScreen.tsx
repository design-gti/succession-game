import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { PrimaryButton } from '../components/PrimaryButton'
import { submitLead } from '../lib/api'
import { logEvent } from '../lib/api'

export function LeadCaptureScreen() {
  const { state, actions } = useGame()
  const [name, setName] = useState(state.playerName || '')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name || !email) { setError('Name and email are required.'); return }
    setSubmitting(true)
    setError('')
    const ok = await submitLead({
      session_id: state.sessionId,
      name,
      company,
      email,
      score: state.score?.total,
      persona: state.score?.persona,
    })
    setSubmitting(false)
    if (ok) {
      logEvent('lead_submitted', state.sessionId, { email_domain: email.split('@')[1] })
      setSubmitted(true)
      setTimeout(() => actions.finish(), 2000)
    } else {
      setError('Could not send. Try again.')
    }
  }

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-black text-[#f0f4f8]">Get Your Result</h2>
          <p className="text-white/50 text-sm mt-1">
            We'll send your Talent Decision Score and a summary to your work email.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="text-5xl">✅</div>
            <div>
              <p className="text-[#f0f4f8] font-bold text-lg">Sent!</p>
              <p className="text-white/50 text-sm">Check your inbox at {email}</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            {(['Name', 'Company', 'Work Email'] as const).map((label, i) => {
              const vals = [name, company, email]
              const setters = [setName, setCompany, setEmail]
              const types = ['text', 'text', 'email']
              const placeholders = ['Your name', 'Where do you work?', 'you@company.com']
              return (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs uppercase tracking-widest font-semibold">{label}</label>
                  <input
                    type={types[i]}
                    value={vals[i]}
                    onChange={e => setters[i](e.target.value)}
                    placeholder={placeholders[i]}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f0f4f8] text-sm
                      placeholder:text-white/25 outline-none focus:border-brand transition-colors"
                  />
                </div>
              )
            })}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex-1" />

            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send My Result →'}
            </PrimaryButton>
            <button
              onClick={() => actions.finish()}
              className="w-full py-3 text-white/40 text-sm font-semibold active:scale-95 transition-all"
            >
              Skip
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
