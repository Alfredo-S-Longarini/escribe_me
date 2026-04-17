import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { EDITOR_FONTS, FONT_CATEGORIES } from '../../lib/fonts'

interface Props {
  editor: Editor | null
  currentFont: string
  onDefaultChange: (key: string) => void
}

export default function FontPicker({ editor, currentFont, onDefaultChange }: Props) {
  const [open, setOpen] = useState(false)

  const current = EDITOR_FONTS.find(f => f.key === currentFont) ?? EDITOR_FONTS[0]

  const applyFont = (font: typeof EDITOR_FONTS[0]) => {
    setOpen(false)
    onDefaultChange(font.key)

    if (!editor) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to

    if (hasSelection) {
      // Apply only to selected text
      editor.chain().focus().setFontFamily(font.family).run()
    } else {
      // No selection — clear mark at cursor so new text uses default
      editor.chain().focus().unsetFontFamily().run()
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Cambiar fuente"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '5px',
          color: 'var(--text-muted)',
          fontFamily: current.family,
          fontSize: '0.7rem',
          padding: '4px 8px',
          cursor: 'pointer',
          outline: 'none',
          maxWidth: '130px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {current.label}
        <span style={{ fontSize: '0.5rem', opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          />
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 50,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            minWidth: '180px',
            maxHeight: '320px',
            overflowY: 'auto',
            boxShadow: '0 8px 24px var(--shadow)',
          }}>
            {FONT_CATEGORIES.map(cat => {
              const fonts = EDITOR_FONTS.filter(f => f.category === cat.key)
              return (
                <div key={cat.key}>
                  <div style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.55rem',
                    color: 'var(--text-ghost)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '0.5rem 0.75rem 0.25rem',
                  }}>
                    {cat.label}
                  </div>
                  {fonts.map(font => (
                    <button
                      key={font.key}
                      onClick={() => applyFont(font)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: font.key === currentFont ? 'var(--bg-paper)' : 'transparent',
                        border: 'none',
                        padding: '0.45rem 0.75rem',
                        fontFamily: font.family,
                        fontSize: '0.85rem',
                        color: font.key === currentFont ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-paper)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = font.key === currentFont ? 'var(--bg-paper)' : 'transparent' }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
