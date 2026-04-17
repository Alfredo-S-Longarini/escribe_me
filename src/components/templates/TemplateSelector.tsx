import { useState } from 'react'
import { motion } from 'framer-motion'
import { TEMPLATES } from '../../lib/templates'
import { createBook } from '../../lib/books'
import { supabase } from '../../lib/supabase'
import type { TemplateKey } from '../../types'

export default function TemplateSelector() {
  const [creating, setCreating] = useState<TemplateKey | null>(null)
  const [hovered, setHovered] = useState<TemplateKey | null>(null)

  const handleSelect = async (key: TemplateKey) => {
    if (creating) return

    setCreating(key)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const template = TEMPLATES[key]
    const { data, error } = await createBook(user.id, key, template.defaultTitle)

    if (error || !data) {
      setCreating(null)
      return
    }

    window.location.href = `/app/editor/${data.id}`
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <p
          style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '0.65rem',
            color: '#6e5e4a',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin: '0 0 0.75rem',
          }}
        >
          Nuevo escrito
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 300,
            color: '#f0e6d3',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          ¿Cómo querés escribir hoy?
        </h1>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {(Object.entries(TEMPLATES) as [TemplateKey, typeof TEMPLATES[TemplateKey]][]).map(
          ([key, tmpl], i) => {
            const isCreating = creating === key
            const isDisabled = creating !== null && !isCreating
            const isHovered = hovered === key

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => handleSelect(key)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                disabled={!!creating}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isHovered && !isDisabled ? '#3a2f20' : '#2e261c'}`,
                  borderRadius: '10px',
                  padding: '1.5rem 1.25rem',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  opacity: isDisabled ? 0.35 : 1,
                  transform: isHovered && !isDisabled ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'border-color 0.2s, transform 0.2s, opacity 0.2s',
                  outline: 'none',
                }}
              >
                {/* Symbol */}
                <div
                  style={{
                    fontSize: '1.75rem',
                    color: tmpl.accentColor,
                    opacity: isCreating ? 1 : 0.6,
                    marginBottom: '0.875rem',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {isCreating ? (
                    <CreatingDots color={tmpl.accentColor} />
                  ) : (
                    tmpl.symbol
                  )}
                </div>

                {/* Label */}
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    color: 'var(--text)',
                    margin: '0 0 0.375rem',
                  }}
                >
                  {tmpl.label}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.7rem',
                    color: 'var(--text-faint)',
                    margin: '0 0 0.75rem',
                    lineHeight: 1.5,
                  }}
                >
                  {tmpl.description}
                </p>

                {/* Detail */}
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: '0.78rem',
                    color: '#6e5e4a',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {tmpl.detail}
                </p>

                {/* Arrow hint */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    right: '1.25rem',
                    fontFamily: 'DM Sans, system-ui',
                    fontSize: '0.65rem',
                    color: tmpl.accentColor,
                    opacity: isHovered && !isDisabled ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  Elegir →
                </span>
              </motion.button>
            )
          }
        )}
      </div>
    </div>
  )
}

/* ── Animated dots while creating ───────────────────── */
function CreatingDots({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', height: '1.75rem' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </span>
  )
}
