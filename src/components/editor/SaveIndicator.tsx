import { motion, AnimatePresence } from 'framer-motion'

type Status = 'saved' | 'saving' | 'unsaved'

const config: Record<Status, { text: string; color: string }> = {
  saved:   { text: '✓ Guardado',   color: '#6a9e6a' },
  saving:  { text: '  Guardando...', color: '#8a7560' },
  unsaved: { text: '●  Sin guardar', color: '#7a6852' },
}

export default function SaveIndicator({ status }: { status: Status }) {
  const { text, color } = config[status]

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.6rem',
          color,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}
