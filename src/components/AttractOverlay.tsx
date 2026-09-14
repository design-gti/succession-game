import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  visible: boolean
  onDismiss: () => void
}

export function AttractOverlay({ visible, onDismiss }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (visible) {
      video.currentTime = 0
      video.muted = false
      video.play().catch(() => {
        if (video) {
          video.muted = true
          video.play().catch(() => {})
        }
      })
    } else {
      video.pause()
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="attract"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onPointerDown={onDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: '#000', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            src="/attract.mp4"
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Tap to start hint — fades in after 1s, pulses every 4s */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 2 }}
            style={{
              position: 'absolute', bottom: 48, left: 0, right: 0,
              textAlign: 'center', pointerEvents: 'none',
            }}
          >
            <span style={{
              display: 'inline-block',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'white', fontWeight: 700, fontSize: 14,
              padding: '10px 24px', borderRadius: 100,
              letterSpacing: '0.02em',
            }}>
              Tap untuk mulai →
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
