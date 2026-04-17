import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getShareLink, createShareLink, revokeShareLink } from '../../lib/shareLinks'
import type { ShareLink } from '../../types'

interface Props {
  bookId: string
  bookTitle: string
  onClose: () => void
}

type CopyState = 'idle' | 'copied'

export default function ShareModal({ bookId, bookTitle, onClose }: Props) {
  const [link, setLink]           = useState<ShareLink | null>(null)
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    loadLink()
  }, [bookId])

  const loadLink = async () => {
    setLoading(true)
    const { data } = await getShareLink(bookId)
    setLink(data as ShareLink | null)
    setLoading(false)
  }

  const handleToggle = async () => {
    setToggling(true)
    if (link) {
      await revokeShareLink(bookId)
      setLink(null)
    } else {
      const { data } = await createShareLink(bookId)
      setLink(data)
    }
    setToggling(false)
  }

  const handleCopy = () => {
    if (!link) return
    const url = `${window.location.origin}/read/${link.token}`
    navigator.clipboard.writeText(url)
    setCopyState('copied')
    setTimeout(() => setCopyState('idle'), 2000)
  }

  const shareUrl = link ? `${window.location.origin}/read/${link.token}` : ''

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '1.5rem', fontWeight: 300, color: 'var(--text)', margin: 0 }}>
            Compartir
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '1rem', padding: '0', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic', margin: '0 0 2rem' }}>
          Cualquier persona con el link puede leer <em style={{ color: 'var(--text-muted)' }}>{bookTitle}</em>.
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid #2e261c', borderBottom: '1px solid #2e261c', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {loading ? '...' : link ? 'Link activo' : 'Link inactivo'}
            </div>
            <div style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem', color: 'var(--text-faint)', marginTop: '2px' }}>
              {link ? 'El visor está disponible públicamente' : 'El escrito es privado por ahora'}
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={loading || toggling}
            title={link ? 'Desactivar link' : 'Activar link'}
            style={{
              width: '40px', height: '22px',
              borderRadius: '11px',
              background: link ? '#c9a96e' : '#2e261c',
              position: 'relative',
              cursor: loading || toggling ? 'wait' : 'pointer',
              border: 'none',
              transition: 'background 0.25s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: link ? '21px' : '3px',
                width: '16px', height: '16px',
                borderRadius: '50%',
                background: '#0a0806',
                transition: 'left 0.25s',
              }}
            />
          </button>
        </div>

        {/* Link section */}
        <AnimatePresence>
          {link && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* URL box */}
              <div style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copyState === 'copied' ? '#4a7a4a' : '#c9a96e',
                    color: '#0a0806',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '0.4rem 0.875rem',
                    fontFamily: 'DM Sans,system-ui,sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  {copyState === 'copied' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Open in new tab */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.65rem', color: 'var(--text-faint)', letterSpacing: '0.08em', textDecoration: 'none', marginBottom: '0.75rem' }}
              >
                Ver el visor →
              </a>

              {/* Revoke */}
              <button
                onClick={handleToggle}
                style={{
                  width: '100%',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-faint)',
                  fontFamily: 'DM Sans,system-ui,sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor='#5a4030'; e.currentTarget.style.color='#c06050' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor='#2e261c'; e.currentTarget.style.color='#7a6852' }}
              >
                Revocar acceso
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No link state */}
        {!loading && !link && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', fontSize: '0.9rem', color: '#3d3020', margin: '0 0 1.25rem' }}>
              Solo vos podés ver este escrito.
            </p>
            <button
              onClick={handleToggle}
              style={{
                background: '#c9a96e', color: '#0a0806', border: 'none',
                borderRadius: '8px', padding: '0.75rem 2rem',
                fontFamily: 'DM Sans,system-ui,sans-serif', fontSize: '0.7rem',
                fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Generar link
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
