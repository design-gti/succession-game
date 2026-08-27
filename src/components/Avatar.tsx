import { AVATAR_COLORS } from '../data/scenario'
import type { CandidateId } from '../game/types'

interface Props {
  id?: CandidateId | string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ id, name, size = 'md', className = '' }: Props) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = (id && AVATAR_COLORS[id]) || '#374151'

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${SIZE[size]} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
