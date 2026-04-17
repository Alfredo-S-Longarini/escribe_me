import { motion } from 'framer-motion'
import { emptyLibraryPhrases, getRandomPhrase } from '../../lib/phrases'
import { useState } from 'react'

export default function EmptyLibrary() {
  const [phrase] = useState(() => getRandomPhrase(emptyLibraryPhrases))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '420px',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Decorative symbol */}
      <div
        style={{
          fontSize: '3rem',
          color: '#6e5e4a',
          marginBottom: '2rem',
          lineHeight: 1,
        }}
      >
        ○
      </div>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '1.1rem',
          color: '#8a7560',
          maxWidth: '280px',
          lineHeight: 1.7,
          margin: '0 0 2.5rem',
        }}
      >
        {phrase}
      </p>

      <a
        href="/app/nuevo"
        style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#c9a96e',
          textDecoration: 'none',
          borderBottom: '1px solid #3a2f20',
          paddingBottom: '2px',
        }}
      >
        Empezar a escribir
      </a>
    </motion.div>
  )
}
