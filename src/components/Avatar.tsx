import { AVATAR_COLORS } from '../data/scenario'
import type { CandidateId } from '../game/types'

interface Props {
  id?: CandidateId | string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  xs: 24, sm: 32, md: 48, lg: 64, xl: 80,
}

const FONT_SIZE: Record<NonNullable<Props['size']>, number> = {
  xs: 9, sm: 12, md: 16, lg: 20, xl: 26,
}

export function Avatar({ id, name, size = 'md', className = '' }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = (id && AVATAR_COLORS[id]) || '#374151'
  const px = SIZE_PX[size]
  const fs = FONT_SIZE[size]

  return (
    <div
      className={`rounded-full flex-shrink-0 relative overflow-hidden ${className}`}
      style={{
        width: px, height: px,
        background: color,
        boxShadow: `0 0 0 2px white, 0 0 0 3px ${color}30, 0 3px 10px ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Shine overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.35) 0%, transparent 55%)',
        borderRadius: '50%',
      }} />
      <span style={{ color: 'white', fontWeight: 900, fontSize: fs, position: 'relative', zIndex: 1, letterSpacing: '0.01em' }}>
        {initials}
      </span>
    </div>
  )
}
