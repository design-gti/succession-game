import { useState, useEffect, type ReactNode } from 'react'

const CANVAS_W = 432

function getMetrics() {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    scale: w / CANVAS_W,
    canvasH: Math.round(CANVAS_W * (h / w)),
  }
}

export function KioskScaler({ children }: { children: ReactNode }) {
  const [{ scale, canvasH }, setMetrics] = useState(getMetrics)

  useEffect(() => {
    const update = () => setMetrics(getMetrics())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#f4f7fb',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: CANVAS_W,
          height: canvasH,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
