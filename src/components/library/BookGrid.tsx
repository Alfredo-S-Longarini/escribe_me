import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BookCard from './BookCard'
import EmptyLibrary from './EmptyLibrary'
import { getUserBooks } from '../../lib/books'
import { supabase } from '../../lib/supabase'
import type { Book } from '../../types'

export default function BookGrid() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        loadBooks(user.id)
      }
    })
  }, [])

  const loadBooks = async (uid: string) => {
    setLoading(true)
    const { data } = await getUserBooks(uid)
    setBooks((data as Book[]) ?? [])
    setLoading(false)
  }

  const handleDelete = () => {
    if (userId) loadBooks(userId)
  }

  if (loading) return <Skeleton />
  if (books.length === 0) return <EmptyLibrary />

  return (
    <motion.div
      layout
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem',
      }}
    >
      <AnimatePresence>
        {books.map((book) => (
          <BookCard key={book.id} book={book} onDelete={handleDelete} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '1rem',
    }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
          animation: 'pulse 2s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}>
          <div style={{ height: '160px', background: 'var(--bg-paper)' }} />
          <div style={{ padding: '0.875rem' }}>
            <div style={{ height: '12px', background: 'var(--border)', borderRadius: '3px', marginBottom: '0.5rem', width: '75%' }} />
            <div style={{ height: '9px',  background: 'var(--border)', borderRadius: '3px', width: '50%' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
    </div>
  )
}
