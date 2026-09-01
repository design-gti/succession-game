import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export function PrimaryButton({ onClick, disabled, children, variant = 'primary', className = '' }: Props) {
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          width: '100%', padding: '16px 24px', borderRadius: 16,
          background: disabled
            ? 'rgba(29,111,242,0.35)'
            : 'linear-gradient(135deg, #1D6FF2 0%, #6366f1 100%)',
          color: 'white', fontWeight: 900, fontSize: 15,
          border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          letterSpacing: '0.01em',
          boxShadow: disabled ? 'none' : '0 8px 28px rgba(29,111,242,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          position: 'relative', overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {!disabled && (
          <motion.div
            style={{
              position: 'absolute', top: 0, left: '-100%', bottom: 0, width: '60%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              pointerEvents: 'none',
            }}
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'linear' }}
          />
        )}
        {children}
      </button>
    )
  }

  const variantCls = variant === 'secondary'
    ? 'bg-[#e9ecef] hover:bg-[#dee2e6] text-[#212529]'
    : 'bg-red-600 hover:bg-red-700 text-white'

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-6 rounded-2xl font-semibold text-base
        transition-all duration-150 outline-none active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantCls}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
