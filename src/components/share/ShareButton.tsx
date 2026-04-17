import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ShareModal from './ShareModal'

interface Props {
  bookId: string
  bookTitle: string
}

export default function ShareButton({ bookId, bookTitle }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: '1px solid #2e261c',
          borderRadius: '5px',
          color: '#9e8c76',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.color = '#c9a96e' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e261c'; e.currentTarget.style.color = '#9e8c76' }}
      >
        Compartir
      </button>

      <AnimatePresence>
        {open && (
          <ShareModal
            bookId={bookId}
            bookTitle={bookTitle}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
