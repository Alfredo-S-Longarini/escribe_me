import { useState } from 'react'
import { motion } from 'framer-motion'
import { createChapter, updateChapterTitle } from '../../lib/chapters'
import type { Chapter } from '../../types'

interface Props {
  bookId: string
  chapters: Chapter[]
  activeChapter: Chapter | null
  accentColor: string
  onSelect: (chapter: Chapter) => void
  onChaptersChange: (chapters: Chapter[]) => void
}

export default function ChapterList({ bookId, chapters, activeChapter, accentColor, onSelect, onChaptersChange }: Props) {
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [adding, setAdding]           = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    const { data } = await createChapter(bookId, `Capítulo ${chapters.length + 1}`, chapters.length)
    if (data) { const c = data as Chapter; onChaptersChange([...chapters, c]); onSelect(c) }
    setAdding(false)
  }

  const startEdit = (c: Chapter) => { setEditingId(c.id); setEditingTitle(c.title) }

  const saveEdit = async (c: Chapter) => {
    if (editingTitle.trim() && editingTitle !== c.title) {
      await updateChapterTitle(c.id, editingTitle.trim())
      onChaptersChange(chapters.map(ch => ch.id === c.id ? { ...ch, title: editingTitle.trim() } : ch))
    }
    setEditingId(null)
  }

  return (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      style={{ width:'185px', flexShrink:0, borderRight:'1px solid #241d15', background:'#0d0b08', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      <div style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'#7a6852', letterSpacing:'0.2em', textTransform:'uppercase', padding:'1.25rem 1rem 0.75rem', borderBottom:'1px solid #241d15' }}>
        Capítulos
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0.375rem 0' }}>
        {chapters.map(c => {
          const isActive  = activeChapter?.id === c.id
          const isEditing = editingId === c.id
          return (
            <div key={c.id} onClick={() => onSelect(c)}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', cursor:'pointer', background: isActive ? '#13100d' : 'transparent', transition:'background 0.15s' }}>
              <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: isActive ? accentColor : 'var(--text-ghost)', flexShrink:0, transition:'background 0.2s' }} />
              {isEditing ? (
                <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                  onBlur={() => saveEdit(c)}
                  onKeyDown={e => { if (e.key==='Enter') saveEdit(c); if (e.key==='Escape') setEditingId(null); e.stopPropagation() }}
                  onClick={e => e.stopPropagation()} autoFocus
                  style={{ background:'transparent', border:'none', borderBottom:`1px solid ${accentColor}`, color:'#e8d5b0', fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.75rem', outline:'none', width:'100%', padding:0 }} />
              ) : (
                <span onDoubleClick={e => { e.stopPropagation(); startEdit(c) }}
                  style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.75rem', color: isActive ? '#e8d5b0' : '#9a8878', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1, transition:'color 0.15s', userSelect:'none' }}>
                  {c.title}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={handleAdd} disabled={adding}
        style={{ background:'none', border:'none', borderTop:'1px solid #241d15', color: adding ? 'var(--text-ghost)' : '#7a6852', fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', letterSpacing:'0.1em', padding:'0.875rem 1rem', cursor: adding ? 'wait' : 'pointer', textAlign:'left', transition:'color 0.15s' }}>
        {adding ? '...' : '+ Nuevo capítulo'}
      </button>
    </motion.div>
  )
}
