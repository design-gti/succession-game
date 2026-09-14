import { useEffect, useRef } from 'react'

export function useIdleTimer(
  onIdle: () => void,
  delayMs: number,
  enabled: boolean,
) {
  const onIdleRef  = useRef(onIdle)
  const delayRef   = useRef(delayMs)
  onIdleRef.current  = onIdle
  delayRef.current   = delayMs

  useEffect(() => {
    if (!enabled) return

    let timer: ReturnType<typeof setTimeout>

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => onIdleRef.current(), delayRef.current)
    }

    reset()

    window.addEventListener('touchstart', reset, { passive: true })
    window.addEventListener('mousedown',  reset, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('touchstart', reset)
      window.removeEventListener('mousedown',  reset)
    }
  }, [enabled])
}
