import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Editor } from '@tiptap/react'
import { supabase } from '../../lib/supabase'
import { getBook, updateBook } from '../../lib/books'
import { getChapters, createChapter, updateChapterContent } from '../../lib/chapters'
import { TEMPLATES } from '../../lib/templates'
import ChapterList from './ChapterList'
import EditorArea from './EditorArea'
import SaveIndicator from './SaveIndicator'
import ShareButton from '../share/ShareButton'
import ThemeToggle from '../shared/ThemeToggle'
import MobileEditorBar from './MobileEditorBar'
import type { Book, Chapter } from '../../types'

const MULTI_CHAPTER: string[] = ['novel', 'story', 'essay']

interface Props { bookId: string }

export default function BookEditor({ bookId }: Props) {
  const [book, setBook]                   = useState<Book | null>(null)
  const [chapters, setChapters]           = useState<Chapter[]>([])
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)
  const [saveStatus, setSaveStatus]       = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [focusMode, setFocusMode]         = useState(false)
  const [loading, setLoading]             = useState(true)
  const [editingTitle, setEditingTitle]   = useState(false)
  const [bookTitle, setBookTitle]         = useState('')
  const [currentFont, setCurrentFont]     = useState('lora')
  const [isMobile, setIsMobile]           = useState(false)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

  const saveTimer     = useRef<ReturnType<typeof setTimeout>>()
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleFontChange = async (key: string) => {
    setCurrentFont(key)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
    if (profile) {
      await supabase.from('profiles').update({
        preferences: { ...profile.preferences, editorFont: key },
      }).eq('id', user.id)
    }
  }

  useEffect(() => { init() }, [bookId])
  useEffect(() => { if (editingTitle) titleInputRef.current?.focus() }, [editingTitle])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && focusMode) setFocusMode(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusMode])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
    if (profile?.preferences?.editorFont) setCurrentFont(profile.preferences.editorFont)

    const { data: bookData } = await getBook(bookId)
    if (!bookData) { window.location.href = '/app'; return }

    setBook(bookData as unknown as Book)
    setBookTitle((bookData as unknown as Book).title)

    const { data: chaptersData } = await getChapters(bookId)
    let chaps = (chaptersData as Chapter[]) ?? []

    if (chaps.length === 0) {
      const { data: newChap } = await createChapter(bookId, 'Capítulo 1', 0)
      if (newChap) chaps = [newChap as Chapter]
    }

    setChapters(chaps)
    setActiveChapter(chaps[0] ?? null)
    setLoading(false)
  }

  const handleContentChange = (content: string) => {
    setSaveStatus('unsaved')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      if (activeChapter) {
        await updateChapterContent(activeChapter.id, content)
        await updateBook(bookId, {})
      }
      setSaveStatus('saved')
    }, 1500)
  }

  const handleTitleSave = async () => {
    setEditingTitle(false)
    const trimmed = bookTitle.trim()
    if (trimmed && trimmed !== book?.title) {
      await updateBook(bookId, { title: trimmed })
      setBook(prev => prev ? { ...prev, title: trimmed } : prev)
    } else {
      setBookTitle(book?.title ?? '')
    }
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'1.5rem', color:'var(--text)', fontWeight:300 }}>
        Escribe<span style={{ color:'var(--accent)' }}>.</span><span style={{ color:'var(--accent)', fontStyle:'italic' }}>me</span>
      </div>
      <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:'italic', fontSize:'0.85rem', color:'var(--text-faint)' }}>
        Abriendo tu escrito...
      </p>
    </div>
  )

  if (!book) return null

  const template    = TEMPLATES[book.template]
  const showChapters = MULTI_CHAPTER.includes(book.template) && !focusMode && !isMobile

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>

      {/* ── Desktop top bar ──────────────────────────── */}
      {!isMobile && !focusMode && (
        <motion.div
          initial={{ opacity:0, y:-6 }}
          animate={{ opacity:1, y:0 }}
          style={{ display:'flex', alignItems:'center', padding:'0 1.5rem', height:'50px', borderBottom:'1px solid var(--border)', gap:'1rem', flexShrink:0 }}
        >
          <a href="/app" style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'var(--text-faint)', textDecoration:'none', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>
            ← Biblioteca
          </a>
          <Divider />
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => { if (e.key==='Enter') handleTitleSave(); if (e.key==='Escape') { setEditingTitle(false); setBookTitle(book.title) } }}
                style={{ background:'transparent', border:'none', borderBottom:'1px solid var(--accent)', color:'var(--text)', fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'0.95rem', textAlign:'center', outline:'none', padding:'2px 8px', minWidth:'200px', maxWidth:'400px' }}
              />
            ) : (
              <button onClick={() => setEditingTitle(true)} title="Click para editar"
                style={{ background:'none', border:'none', color:'var(--text)', fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'0.95rem', cursor:'text', padding:'2px 8px', maxWidth:'400px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {bookTitle}
              </button>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexShrink:0 }}>
            <span style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:template.accentColor, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {template.label}
            </span>
            <Divider />
            <SaveIndicator status={saveStatus} />
            <Divider />
            <ShareButton bookId={bookId} bookTitle={bookTitle} />
            <Divider />
            <ThemeToggle />
            <Divider />
            <button onClick={() => setFocusMode(true)} title="Modo foco — Esc para salir"
              style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', letterSpacing:'0.08em', padding:'4px 0', whiteSpace:'nowrap' }}>
              ⊞ Foco
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Mobile top bar ──────────────────────────── */}
      {isMobile && !focusMode && (
        <div style={{ display:'flex', alignItems:'center', padding:'0 1rem', height:'46px', borderBottom:'1px solid var(--border)', gap:'0.75rem', flexShrink:0, background:'var(--bg)' }}>
          <a href="/app" style={{ fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.9rem', color:'var(--text-faint)', textDecoration:'none', flexShrink:0 }}>
            ←
          </a>
          <span style={{ flex:1, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'1rem', color:'var(--text)', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {bookTitle}
          </span>
          <SaveIndicator status={saveStatus} />
        </div>
      )}

      {/* Focus exit hint */}
      {focusMode && (
        <div style={{ position:'fixed', top:'1rem', right:'1.5rem', zIndex:100, fontFamily:'DM Sans,system-ui,sans-serif', fontSize:'0.6rem', color:'var(--text-ghost)', letterSpacing:'0.1em', cursor:'pointer' }}
          onClick={() => setFocusMode(false)}>
          ESC para salir
        </div>
      )}

      {/* ── Main ────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {showChapters && (
          <ChapterList
            bookId={bookId}
            chapters={chapters}
            activeChapter={activeChapter}
            accentColor={template.accentColor}
            onSelect={setActiveChapter}
            onChaptersChange={setChapters}
          />
        )}
        <EditorArea
          key={activeChapter?.id ?? 'empty'}
          chapter={activeChapter}
          template={book.template}
          focusMode={focusMode}
          accentColor={template.accentColor}
          currentFont={currentFont}
          isMobile={isMobile}
          onFontChange={handleFontChange}
          onChange={handleContentChange}
          onEditorReady={setEditorInstance}
        />
      </div>

      {/* ── Mobile bottom bar ───────────────────────── */}
      {isMobile && !focusMode && (
        <MobileEditorBar
          editor={editorInstance}
          template={book.template}
          bookId={bookId}
          chapters={chapters}
          activeChapter={activeChapter}
          currentFont={currentFont}
          accentColor={template.accentColor}
          wordCount={editorInstance?.storage.characterCount?.words() ?? 0}
          showChapters={MULTI_CHAPTER.includes(book.template)}
          onSelectChapter={setActiveChapter}
          onChaptersChange={setChapters}
          onFontChange={handleFontChange}
          onShare={() => {}}
          onFocus={() => setFocusMode(true)}
          bookTitle={bookTitle}
        />
      )}
    </div>
  )
}

function Divider() {
  return <div style={{ width:'1px', height:'14px', background:'var(--border)', flexShrink:0 }} />
}
