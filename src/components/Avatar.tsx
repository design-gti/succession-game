import { AVATAR_COLORS } from '../data/scenario'
import type { CandidateId } from '../game/types'

interface Props {
  id?: CandidateId | string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ringColor?: string // amber for external candidates
}

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  xs: 24, sm: 32, md: 48, lg: 64, xl: 80,
}

const FONT_SIZE: Record<NonNullable<Props['size']>, number> = {
  xs: 9, sm: 12, md: 16, lg: 20, xl: 26,
}

const PHOTO_IDS = new Set([
  'reza', 'maya', 'dimas', 'bintang', 'andi', 'rani', 'fajar', 'rizky',
  'dewi', 'aryo', 'liana', 'nadia', 'kevin',
])

export function Avatar({ id, name, size = 'md', className = '', ringColor }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const baseColor = (id && AVATAR_COLORS[id as CandidateId]) || '#4f6eb5'
  const px = SIZE_PX[size]
  const fs = FONT_SIZE[size]
  const hasPhoto = id && PHOTO_IDS.has(id as string)

  // Rim tint: amber for external, cool blue for internal
  const rimA = ringColor ? `${ringColor}50` : 'rgba(100,185,255,0.28)'
  const rimB = ringColor ? `${ringColor}80` : 'rgba(130,205,255,0.42)'
  const glowColor = ringColor
    ? `${ringColor}30`
    : 'rgba(80,150,230,0.20)'
  const glow2 = ringColor
    ? `${ringColor}18`
    : 'rgba(80,150,230,0.10)'

  return (
    // Outer wrapper: only carries the floating shadow/glow — no overflow clip
    <div
      className={`flex-shrink-0 ${className}`}
      style={{
        width: px, height: px,
        borderRadius: '50%',
        position: 'relative',
        flexShrink: 0,
        // Soft floating shadow
        boxShadow: `0 6px 20px ${glowColor}, 0 2px 6px ${glow2}`,
      }}
    >
      {/* ── Inner bubble: clips photo + all glass layers ── */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        // Very subtle light-blue radial background — visible at edges around the photo
        background: 'radial-gradient(circle at 50% 38%, #e6f2ff 0%, #c8dff7 100%)',
      }}>

        {/* Photo or gradient-initials */}
        {hasPhoto ? (
          <img
            src={`/avatars/${id}.png`}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            draggable={false}
          />
        ) : (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              background: baseColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: fs, letterSpacing: '0.01em' }}>
                {initials}
              </span>
            </div>
          </>
        )}

        {/* ── Layer: bottom soft fade — photo bleeds into bubble ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 85% 55% at 50% 108%, rgba(200,228,255,0.55) 0%, transparent 68%)',
        }} />

        {/* ── Layer: translucent glass rim — NOT a solid border ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          // Transparent in center → colored only at the edge
          background: `radial-gradient(circle, transparent 60%, ${rimA} 74%, ${rimB} 87%, rgba(220,238,255,0.18) 100%)`,
          // Inset glow reinforces the edge softness
          boxShadow: `inset 0 0 ${Math.round(px * 0.22)}px ${rimA}`,
        }} />

        {/* ── Layer: top glass highlight — wide crescent, the main "glass" cue ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 75% 50% at 50% -4%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 38%, transparent 60%)',
        }} />

        {/* ── Layer: small specular dot — secondary reflection, top-left ── */}
        <div style={{
          position: 'absolute',
          top: Math.round(px * 0.10),
          left: Math.round(px * 0.18),
          width: Math.round(px * 0.21),
          height: Math.round(px * 0.12),
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.92) 0%, transparent 72%)',
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
        }} />

        {/* ── Layer: subtle side cyan glow top-left arc ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 80% at -5% 30%, rgba(150,215,255,0.22) 0%, transparent 65%)',
        }} />

      </div>
    </div>
  )
}
