import { GameProvider, useGame } from './game/GameProvider'
import { IntroScreen } from './screens/IntroScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { FinalRevealScreen } from './screens/FinalRevealScreen'
import { ResultScreen } from './screens/ResultScreen'
import { KelolaRevealScreen } from './screens/KelolaRevealScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { LeadCaptureScreen } from './screens/LeadCaptureScreen'
import { BrandMessageScreen } from './screens/BrandMessageScreen'

function GameRouter() {
  const { state } = useGame()
  const phase = state.phase.name

  function screen() {
    if (phase === 'intro' || phase === 'nameEntry') return <IntroScreen />
    if (phase === 'exploring') return <ExploreScreen />
if (phase === 'finalReveal') return <FinalRevealScreen />
    if (phase === 'result') return <ResultScreen />
    if (phase === 'kelolaReveal') return <KelolaRevealScreen />
    if (phase === 'demoQR') return <BrandMessageScreen />
    if (phase === 'leaderboard') return <LeaderboardScreen />
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
    <div className="h-full bg-[#0f1724] text-[#f0f4f8] relative overflow-hidden">
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </div>
  )
}
