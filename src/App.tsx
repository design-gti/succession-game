import { GameProvider, useGame } from './game/GameProvider'
import { IntroScreen } from './screens/IntroScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { FinalRevealScreen } from './screens/FinalRevealScreen'
import { ResultScreen } from './screens/ResultScreen'
import { KelolaRevealScreen } from './screens/KelolaRevealScreen'
import { BrandMessageScreen } from './screens/BrandMessageScreen'
import { LeadCaptureScreen } from './screens/LeadCaptureScreen'

function GameRouter() {
  const { state } = useGame()
  const phase = state.phase.name

  function screen() {
    if (phase === 'intro') return <IntroScreen />
    if (phase === 'exploring') return <ExploreScreen />
    if (phase === 'finalReveal') return <FinalRevealScreen />
    if (phase === 'result') return <ResultScreen />
    if (phase === 'kelolaReveal') return <KelolaRevealScreen />
    if (phase === 'demoQR') return <BrandMessageScreen />
    if (phase === 'leadCapture') return <LeadCaptureScreen />
    if (phase === 'finished') return <BrandMessageScreen />
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
