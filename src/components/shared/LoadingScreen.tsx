import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadingPhrases, getRandomPhrase } from '../../lib/phrases'

interface Props {
  visible?: boolean
}

export default function LoadingScreen({ visible = true }: Props) {
  const [phrase] = useState(() => getRandomPhrase(loadingPhrases))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0a0806',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '2rem',
              fontWeight: 300,
              color: '#f0e6d3',
              marginBottom: '1.5rem',
            }}
          >
            Escribe
            <span style={{ color: '#c9a96e' }}>.</span>
            <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>me</span>
          </motion.div>

          {/* Phrase */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: '#8a7560',
              textAlign: 'center',
              maxWidth: '280px',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            {phrase}
          </motion.p>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#c9a96e',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
