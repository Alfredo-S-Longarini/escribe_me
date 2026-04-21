import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Toolbar from './Toolbar'
import { getFontFamily } from '../../lib/fonts'
import type { Editor } from '@tiptap/react'
import type { Chapter, TemplateKey } from '../../types'

const PLACEHOLDERS: Record<TemplateKey, string> = {
  diary:   'Hoy...',
  novel:   'Había una vez...',
  story:   'Todo empezó cuando...',
  poetry:  'Escribí. Sin pensar.',
  letter:  'Querida/o...',
  free:    '',
  essay:   'Lo que quiero decir es...',
}

const PAPER_EXTRA: Partial<Record<TemplateKey, React.CSSProperties>> = {
  poetry: { textAlign: 'center', lineHeight: '2.2' },
  letter: { fontStyle: 'italic' },
}

const ZOOM_MIN = 70
const ZOOM_MAX = 200
const ZOOM_STEP = 10

interface Props {
  chapter: Chapter | null
  cachedContent?: string
  template: TemplateKey
  focusMode: boolean
  accentColor: string
  currentFont: string
  isMobile: boolean
  zoom: number
  onZoomChange: (z: number) => void
  onFontChange: (key: string) => void
  onChange: (content: string) => void
  onEditorReady?: (editor: Editor) => void
}

export default function EditorArea({
  chapter,
  cachedContent,
  template,
  focusMode,
  accentColor,
  currentFont,
  isMobile,
  zoom,
  onZoomChange,
  onFontChange,
  onChange,
  onEditorReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      Placeholder.configure({
        placeholder: PLACEHOLDERS[template],
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
    ],
    content: (() => {
      const source = cachedContent ?? chapter?.content
      if (!source || source === '{}') return ''
      try { return JSON.parse(source) } catch { return '' }
    })(),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: `escribe-editor template-${template}`,
        spellcheck: 'true',
      },
    },
  })

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor)
  }, [editor])

  useEffect(() => {
    if (!editor || !chapter) return
    const source = cachedContent ?? chapter.content
    const content = (() => {
      if (!source || source === '{}') return ''
      try { return JSON.parse(source) } catch { return '' }
    })()
    editor.commands.setContent(content)
    editor.commands.focus('end')
  }, [chapter?.id])

  // Ctrl+Scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
    onZoomChange(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta)))
  }, [zoom, onZoomChange])

  // Ctrl++ / Ctrl+- / Ctrl+0
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey) return
    if (e.key === '=' || e.key === '+') {
      e.preventDefault()
      onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))
    } else if (e.key === '-') {
      e.preventDefault()
      onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))
    } else if (e.key === '0') {
      e.preventDefault()
      onZoomChange(100)
    }
  }, [zoom, onZoomChange])

  // Pinch-to-zoom (mobile)
  const lastPinchDist = useRef<number | null>(null)
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (lastPinchDist.current !== null) {
      const delta = dist - lastPinchDist.current
      if (Math.abs(delta) > 3) {
        onZoomChange(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + (delta > 0 ? 2 : -2))))
      }
    }
    lastPinchDist.current = dist
  }, [zoom, onZoomChange])

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd)
    return () => {
      el.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleWheel, handleKeyDown, handleTouchMove, handleTouchEnd])

  const wordCount = editor?.storage.characterCount?.words() ?? 0

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: focusMode ? '3rem 1.5rem' : isMobile ? '1rem' : '2rem 1.5rem',
        background: 'var(--bg)',
        transition: 'background 0.3s',
      }}
    >
      {!focusMode && !isMobile && (
        <Toolbar
          editor={editor}
          template={template}
          wordCount={wordCount}
          currentFont={currentFont}
          zoom={zoom}
          onFontChange={onFontChange}
          onZoomChange={onZoomChange}
        />
      )}

      <div style={{
        width: '100%',
        maxWidth: focusMode ? '620px' : '680px',
        background: focusMode ? 'transparent' : 'var(--bg-paper)',
        border: focusMode ? 'none' : '1px solid var(--border)',
        borderRadius: focusMode ? '0' : '4px',
        padding: focusMode ? '0' : isMobile ? '1.5rem 1.25rem' : '3rem 3.5rem',
        marginTop: isMobile ? '0' : '1.25rem',
        fontFamily: getFontFamily(currentFont),
        fontSize: `${zoom}%`,
        transition: 'font-size 0.15s ease',
        ...PAPER_EXTRA[template],
      }}>
        <EditorContent editor={editor} />
      </div>

      {!focusMode && !isMobile && (
        <div style={{
          width: '100%',
          maxWidth: '680px',
          marginTop: '0.625rem',
          paddingBottom: '3rem',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.6rem',
          color: 'var(--text-ghost)',
          textAlign: 'right',
          letterSpacing: '0.05em',
        }}>
          {wordCount.toLocaleString('es')} palabras
          {wordCount > 0 && ` · ${Math.max(1, Math.round(wordCount / 200))} min de lectura`}
        </div>
      )}

      <style>{`
        .escribe-editor { outline: none; color: var(--text-body); min-height: 400px; }
        .ProseMirror { min-height: 400px; height: auto !important; overflow: visible !important; }
        .escribe-editor p  { margin: 0 0 1rem; }
        .escribe-editor p:last-child { margin-bottom: 0; }
        .escribe-editor h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.75em; font-weight: 400;
          color: var(--text); margin: 2rem 0 1rem; line-height: 1.2;
        }
        .escribe-editor h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.3em; font-weight: 400;
          color: var(--text-muted); margin: 1.75rem 0 0.875rem; line-height: 1.3;
        }
        .escribe-editor ul, .escribe-editor ol { padding-left: 1.5rem; margin: 0 0 1rem; }
        .escribe-editor li { margin-bottom: 0.25rem; }
        .escribe-editor strong { color: var(--text); }
        .escribe-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: var(--text-ghost);
          pointer-events: none; height: 0; font-style: italic;
        }
        .template-poetry .escribe-editor p { text-align: center; line-height: 2.2; }
        .template-letter .escribe-editor { font-style: italic; }
        .escribe-editor * { caret-color: ${accentColor}; }
      `}</style>
    </div>
  )
}
