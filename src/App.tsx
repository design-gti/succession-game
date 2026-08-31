import { motion } from 'framer-motion'
import { GameProvider, useGame } from './game/GameProvider'
import { IntroScreen } from './screens/IntroScreen'
import { LeadCaptureScreen } from './screens/LeadCaptureScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { ResultScreen } from './screens/ResultScreen'
import { KelolaRevealScreen } from './screens/KelolaRevealScreen'

function FinishedScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center px-8 text-center gap-4 bg-[#f4f7fb]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-[#0f172a] font-black text-xl">Terima kasih sudah main!</p>
        <p className="text-slate-500 text-sm">Yuk ngobrol langsung sama tim Talentlytica di booth.</p>
      </motion.div>
    </div>
  )
}

function GameRouter() {
  const { state } = useGame()
  const phase = state.phase.name

  function screen() {
    if (phase === 'intro') return <IntroScreen />
    if (phase === 'leadCapture') return <LeadCaptureScreen />
    if (phase === 'exploring') return <ExploreScreen />
    if (phase === 'result') return <ResultScreen />
    if (phase === 'kelolaReveal') return <KelolaRevealScreen />
    if (phase === 'finished') return <FinishedScreen />
    return null
  }

  return (
    <div key={phase} className="h-full">
      {screen()}
    </div>
  )
}

export default function App() {
  return (
    <div className="h-full bg-[#f4f7fb] text-[#0f172a] relative overflow-hidden">
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </div>
  )
}
