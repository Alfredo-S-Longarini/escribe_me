import type { Editor } from '@tiptap/react'
import type { TemplateKey } from '../../types'
import FontPicker from './FontPicker'

interface Props {
  editor: Editor | null
  template: TemplateKey
  wordCount: number
  currentFont: string
  zoom: number
  onFontChange: (key: string) => void
  onZoomChange: (zoom: number) => void
}

const SHOW_HEADINGS: TemplateKey[] = ['novel', 'story', 'essay']
const SHOW_LISTS: TemplateKey[]    = ['novel', 'essay']
const ZOOM_MIN = 70
const ZOOM_MAX = 200
const ZOOM_STEP = 10

export default function Toolbar({ editor, template, wordCount, currentFont, zoom, onFontChange, onZoomChange }: Props) {
  if (!editor) return null

  const readingTime = Math.max(1, Math.round(wordCount / 200))

  const zoomIn  = () => onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))
  const zoomOut = () => onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))
  const zoomReset = () => onZoomChange(100)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '4px',
      width: '100%',
      maxWidth: '680px',
      flexWrap: 'wrap',
    }}>
      <ToolBtn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Negrita (Ctrl+B)"><b style={{fontFamily:'system-ui',fontSize:'0.75rem'}}>B</b></ToolBtn>
      <ToolBtn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Cursiva (Ctrl+I)"><i style={{fontFamily:'system-ui',fontSize:'0.75rem'}}>I</i></ToolBtn>
      <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Subrayado (Ctrl+U)"><span style={{fontFamily:'system-ui',fontSize:'0.75rem',textDecoration:'underline'}}>U</span></ToolBtn>
      <ToolBtn active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Tachado"><s style={{fontFamily:'system-ui',fontSize:'0.75rem'}}>S</s></ToolBtn>

      {SHOW_HEADINGS.includes(template) && (<>
        <Sep />
        <ToolBtn active={editor.isActive('heading',{level:1})} onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} title="H1"><span style={{fontFamily:'system-ui',fontSize:'0.65rem'}}>H1</span></ToolBtn>
        <ToolBtn active={editor.isActive('heading',{level:2})} onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} title="H2"><span style={{fontFamily:'system-ui',fontSize:'0.65rem'}}>H2</span></ToolBtn>
      </>)}

      {SHOW_LISTS.includes(template) && (<>
        <Sep />
        <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Lista"><span style={{fontFamily:'system-ui',fontSize:'0.8rem'}}>≡</span></ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada"><span style={{fontFamily:'system-ui',fontSize:'0.7rem'}}>1.</span></ToolBtn>
      </>)}

      <Sep />
      <FontPicker editor={editor} currentFont={currentFont} onDefaultChange={onFontChange} />

      <Sep />

      {/* Zoom controls */}
      <ToolBtn active={false} onClick={zoomOut} title="Reducir zoom (Ctrl+-)">
        <span style={{fontFamily:'system-ui',fontSize:'1rem',lineHeight:1}}>−</span>
      </ToolBtn>
      <button
        onClick={zoomReset}
        title="Restablecer zoom (Ctrl+0)"
        style={{
          background: zoom !== 100 ? 'var(--bg-paper)' : 'transparent',
          border: 'none',
          color: zoom !== 100 ? 'var(--accent)' : 'var(--text-ghost)',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: '5px',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.03em',
          minWidth: '38px',
          textAlign: 'center',
          transition: 'all 0.15s',
        }}
      >
        {zoom}%
      </button>
      <ToolBtn active={false} onClick={zoomIn} title="Aumentar zoom (Ctrl++)">
        <span style={{fontFamily:'system-ui',fontSize:'1rem',lineHeight:1}}>+</span>
      </ToolBtn>

      <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'var(--text-ghost)', marginLeft:'auto', padding:'0 6px', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
        {wordCount.toLocaleString('es')} palabras · {readingTime} min
      </span>
    </div>
  )
}

function ToolBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title?: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} title={title}
      style={{
        background: active ? 'var(--bg-paper)' : 'transparent',
        border: 'none',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer',
        padding: '5px 7px',
        borderRadius: '5px',
        minWidth: '28px',
        textAlign: 'center',
        transition: 'all 0.15s',
        lineHeight: 1,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-paper)'; e.currentTarget.style.color='var(--accent)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' } }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{ width:'1px', height:'16px', background:'var(--border)', margin:'0 3px', flexShrink:0 }} />
}
