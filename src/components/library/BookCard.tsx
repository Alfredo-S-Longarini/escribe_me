import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Book } from '../../types'
import { TEMPLATES, STATUS_LABELS, STATUS_STYLES } from '../../lib/templates'
import { deleteBook, formatRelativeDate } from '../../lib/books'

interface Props {
  book: Book
  onDelete: () => void
}

export default function BookCard({ book, onDelete }: Props) {
  const [showActions, setShowActions] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const template = TEMPLATES[book.template]
  const statusStyle = STATUS_STYLES[book.status]
  const statusLabel = STATUS_LABELS[book.status]

  const handleOpen = () => {
    if (!confirming) {
      window.location.href = `/app/editor/${book.id}`
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      return
    }
    setDeleting(true)
    await deleteBook(book.id)
    onDelete()
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={handleOpen}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirming(false) }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: deleting ? 0.4 : 1,
        transition: 'border-color 0.2s, opacity 0.3s',
        position: 'relative',
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: '160px',
          background: book.cover_url
            ? `url(${book.cover_url}) center/cover`
            : template.coverColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!book.cover_url && (
          <span
            style={{
              fontSize: '2.25rem',
              color: template.accentColor,
              opacity: 0.5,
            }}
          >
            {template.symbol}
          </span>
        )}

        {/* Hover actions overlay */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              {!confirming ? (
                <>
                  <ActionBtn
                    label="Abrir"
                    color={template.accentColor}
                    onClick={(e) => { e.stopPropagation(); handleOpen() }}
                  />
                  <ActionBtn
                    label="Eliminar"
                    color="#c06050"
                    onClick={handleDelete}
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'DM Sans, system-ui', fontSize: '0.7rem', color: 'var(--text)', marginBottom: '0.6rem' }}>
                    ¿Eliminar este escrito?
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <ActionBtn label="Sí, eliminar" color="#c06050" onClick={handleDelete} />
                    <ActionBtn label="Cancelar"     color="#8a7560"  onClick={cancelDelete} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div style={{ padding: '0.875rem' }}>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '0.95rem',
            color: 'var(--text)',
            fontWeight: 400,
            margin: '0 0 0.5rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {book.title}
        </h3>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Template badge */}
          <span
            style={{
              fontFamily: 'DM Sans, system-ui',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: template.accentColor,
              opacity: 1,
            }}
          >
            {template.label}
          </span>

          <span style={{ color: '#4e4030', fontSize: '0.5rem' }}>·</span>

          {/* Status badge */}
          <span
            style={{
              fontFamily: 'DM Sans, system-ui',
              fontSize: '0.6rem',
              letterSpacing: '0.06em',
              padding: '0.15rem 0.4rem',
              borderRadius: '3px',
              background: statusStyle.bg,
              color: statusStyle.color,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <p
          style={{
            fontFamily: 'DM Sans, system-ui',
            fontSize: '0.6rem',
            color: 'var(--text-faint)',
            marginTop: '0.4rem',
            marginBottom: 0,
          }}
        >
          {formatRelativeDate(book.updated_at)}
        </p>
      </div>
    </motion.div>
  )
}

function ActionBtn({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${color}`,
        color,
        fontFamily: 'DM Sans, system-ui',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '0.4rem 0.75rem',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}
