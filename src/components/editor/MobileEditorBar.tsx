import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Editor } from '@tiptap/react'
import type { TemplateKey, Chapter } from '../../types'
import { EDITOR_FONTS } from '../../lib/fonts'
import { createChapter } from '../../lib/chapters'
import ShareModal from '../share/ShareModal'

interface Props {
  editor: Editor | null
  template: TemplateKey
  bookId: string
  bookTitle: string
  chapters: Chapter[]
  activeChapter: Chapter | null
  currentFont: string
  accentColor: string
  wordCount: number
  showChapters: boolean
  onSelectChapter: (c: Chapter) => void
  onChaptersChange: (cs: Chapter[]) => void
  onFontChange: (key: string) => void
  onShare: () => void
  onFocus: () => void
}

const MULTI_CHAPTER: TemplateKey[] = ['novel', 'story', 'essay']
const SHOW_HEADINGS: TemplateKey[] = ['novel', 'story', 'essay']
const SHOW_LISTS: TemplateKey[]    = ['novel', 'essay']

export default function MobileEditorBar({
  editor, template, bookId, bookTitle, chapters, activeChapter,
  currentFont, accentColor, wordCount, showChapters,
  onSelectChapter, onChaptersChange, onFontChange, onFocus,
}: Props) {
  const [panel, setPanel]       = useState<null | 'toolbar' | 'chapters'>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [addingChap, setAddingChap] = useState(false)

  const togglePanel = (p: 'toolbar' | 'chapters') =>
    setPanel(prev => prev === p ? null : p)

  const handleAddChapter = async () => {
    setAddingChap(true)
    const { data } = await createChapter(bookId, `Capítulo ${chapters.length + 1}`, chapters.length)
    if (data) {
      const c = data as Chapter
      onChaptersChange([...chapters, c])
      onSelectChapter(c)
      setPanel(null)
    }
    setAddingChap(false)
  }

  return (
    <>
      {/* ── Toolbar panel (slides up) ──────────────── */}
      <AnimatePresence>
        {panel === 'toolbar' && (
          <motion.div
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:16 }}
            transition={{ duration:0.18 }}
            style={{
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              alignItems: 'center',
            }}
          >
            <Tbtn active={editor?.isActive('bold') ?? false}
              onClick={() => editor?.chain().focus().toggleBold().run()}>
              <b style={{fontFamily:'system-ui',fontSize:'0.8rem'}}>B</b>
            </Tbtn>
            <Tbtn active={editor?.isActive('italic') ?? false}
              onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <i style={{fontFamily:'system-ui',fontSize:'0.8rem'}}>I</i>
            </Tbtn>
            <Tbtn active={editor?.isActive('underline') ?? false}
              onClick={() => editor?.chain().focus().toggleUnderline?.().run()}>
              <span style={{fontFamily:'system-ui',fontSize:'0.8rem',textDecoration:'underline'}}>U</span>
            </Tbtn>
            <Tbtn active={editor?.isActive('strike') ?? false}
              onClick={() => editor?.chain().focus().toggleStrike().run()}>
              <s style={{fontFamily:'system-ui',fontSize:'0.8rem'}}>S</s>
            </Tbtn>

            {SHOW_HEADINGS.includes(template) && <>
              <TSep />
              <Tbtn active={editor?.isActive('heading',{level:1}) ?? false}
                onClick={() => editor?.chain().focus().toggleHeading({level:1}).run()}>
                <span style={{fontFamily:'system-ui',fontSize:'0.7rem'}}>H1</span>
              </Tbtn>
              <Tbtn active={editor?.isActive('heading',{level:2}) ?? false}
                onClick={() => editor?.chain().focus().toggleHeading({level:2}).run()}>
                <span style={{fontFamily:'system-ui',fontSize:'0.7rem'}}>H2</span>
              </Tbtn>
            </>}

            {SHOW_LISTS.includes(template) && <>
              <TSep />
              <Tbtn active={editor?.isActive('bulletList') ?? false}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                <span style={{fontFamily:'system-ui',fontSize:'0.9rem'}}>≡</span>
              </Tbtn>
              <Tbtn active={editor?.isActive('orderedList') ?? false}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                <span style={{fontFamily:'system-ui',fontSize:'0.75rem'}}>1.</span>
              </Tbtn>
            </>}

            <TSep />
            <select
              value={currentFont}
              onChange={e => onFontChange(e.target.value)}
              style={{
                background:'var(--bg-paper)', border:'1px solid var(--border)',
                borderRadius:'5px', color:'var(--text-muted)',
                fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.65rem',
                padding:'5px 6px', outline:'none', maxWidth:'120px',
              }}
            >
              {EDITOR_FONTS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>

            <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'var(--text-ghost)', marginLeft:'auto', letterSpacing:'0.05em' }}>
              {wordCount.toLocaleString('es')} palabras
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chapters drawer (slides from left) ────── */}
      <AnimatePresence>
        {panel === 'chapters' && showChapters && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setPanel(null)}
              style={{ position:'fixed', inset:0, zIndex:49, background:'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ duration:0.22, ease:'easeOut' }}
              style={{
                position:'fixed', top:0, left:0, bottom:0, width:'240px',
                zIndex:50, background:'var(--bg-surface)',
                borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column',
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'var(--text-faint)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
                  Capítulos
                </span>
                <button onClick={() => setPanel(null)}
                  style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:0 }}>
                  ✕
                </button>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'0.375rem 0' }}>
                {chapters.map(c => {
                  const isActive = activeChapter?.id === c.id
                  return (
                    <div key={c.id}
                      onClick={() => { onSelectChapter(c); setPanel(null) }}
                      style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1rem', cursor:'pointer', background: isActive ? 'var(--bg-paper)' : 'transparent', transition:'background 0.15s' }}>
                      <div style={{ width:'5px', height:'5px', borderRadius:'50%', flexShrink:0, background: isActive ? accentColor : 'var(--text-ghost)', transition:'background 0.2s' }} />
                      <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.8rem', color: isActive ? 'var(--text)' : 'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.title}
                      </span>
                    </div>
                  )
                })}
              </div>
              <button onClick={handleAddChapter} disabled={addingChap}
                style={{ background:'none', border:'none', borderTop:'1px solid var(--border)', color: addingChap ? 'var(--text-ghost)' : 'var(--text-faint)', fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.65rem', letterSpacing:'0.1em', padding:'1rem', cursor: addingChap ? 'wait' : 'pointer', textAlign:'left', transition:'color 0.15s' }}>
                {addingChap ? '...' : '+ Nuevo capítulo'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Share modal ──────────────────────────── */}
      <AnimatePresence>
        {shareOpen && (
          <ShareModal bookId={bookId} bookTitle={bookTitle} onClose={() => setShareOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Bottom action bar ────────────────────── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-around',
        padding:'0.375rem 0 calc(0.375rem + env(safe-area-inset-bottom))',
        borderTop:'1px solid var(--border)',
        background:'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <BarBtn active={panel === 'toolbar'} label="Formato" onClick={() => togglePanel('toolbar')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h10"/>
          </svg>
        </BarBtn>

        {showChapters && (
          <BarBtn active={panel === 'chapters'} label="Capítulos" onClick={() => togglePanel('chapters')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6M9 8h6M9 16h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </BarBtn>
        )}

        <BarBtn active={shareOpen} label="Compartir" onClick={() => setShareOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
        </BarBtn>

        <BarBtn active={false} label="Foco" onClick={onFocus}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
          </svg>
        </BarBtn>
      </div>
    </>
  )
}

function BarBtn({ active, label, onClick, children }: {
  active: boolean; label: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', background:'none', border:'none', cursor:'pointer', padding:'0.4rem 0.75rem', borderRadius:'8px', color: active ? 'var(--accent)' : 'var(--text-faint)' }}>
      <span style={{ width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center' }}>{children}</span>
      <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.55rem', letterSpacing:'0.05em', color: active ? 'var(--accent)' : 'var(--text-ghost)' }}>
        {label}
      </span>
    </button>
  )
}

function Tbtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ background: active ? 'var(--bg-paper)' : 'transparent', border:'none', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor:'pointer', padding:'6px 8px', borderRadius:'5px', minWidth:'32px', textAlign:'center', transition:'all 0.15s', lineHeight:1 }}>
      {children}
    </button>
  )
}

function TSep() {
  return <div style={{ width:'1px', height:'18px', background:'var(--border)', margin:'0 2px', flexShrink:0 }} />
}
