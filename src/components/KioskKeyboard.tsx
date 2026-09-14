import { motion } from 'framer-motion'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

interface Props {
  onKey: (key: string) => void
}

function Key({
  label,
  onKey,
  style,
}: {
  label: string
  onKey: (key: string) => void
  style?: React.CSSProperties
}) {
  return (
    <motion.button
      onPointerDown={e => {
        e.preventDefault()
        onKey(label)
      }}
      whileTap={{ scale: 0.85, backgroundColor: '#cbd5e1' }}
      style={{
        height: 44,
        minWidth: 36,
        borderRadius: 8,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        fontSize: 14,
        fontWeight: 700,
        color: '#0f172a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        ...style,
      }}
    >
      {label}
    </motion.button>
  )
}

export function KioskKeyboard({ onKey }: Props) {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '10px 6px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        userSelect: 'none',
      }}
    >
      {ROWS.map((row, i) => (
        <div
          key={i}
          style={{ display: 'flex', justifyContent: 'center', gap: 4 }}
        >
          {row.map(k => (
            <Key key={k} label={k} onKey={onKey} style={{ flex: 1, maxWidth: 40 }} />
          ))}
          {i === 2 && (
            <Key
              label="⌫"
              onKey={() => onKey('BACKSPACE')}
              style={{ minWidth: 52, fontSize: 16 }}
            />
          )}
        </div>
      ))}
      {/* Space bar row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
        <Key label="SPASI" onKey={() => onKey(' ')} style={{ width: 200, fontSize: 12 }} />
      </div>
    </div>
  )
}
