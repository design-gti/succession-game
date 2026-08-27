import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

const VARIANTS = {
  primary: 'bg-brand hover:bg-brand-dark active:scale-95 text-white',
  secondary: 'bg-[#e9ecef] hover:bg-[#dee2e6] active:scale-95 text-[#212529]',
  danger: 'bg-red-600 hover:bg-red-700 active:scale-95 text-white',
}

export function PrimaryButton({ onClick, disabled, children, variant = 'primary', className = '' }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-6 rounded-2xl font-semibold text-base
        transition-all duration-150 outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
