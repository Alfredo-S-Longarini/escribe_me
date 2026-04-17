import { supabase } from './supabase'
import type { Book, TemplateKey } from '../types'

export async function getUserBooks(userId: string) {
  return supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}

export async function getBook(bookId: string) {
  return supabase
    .from('books')
    .select('*, chapters(*)')
    .eq('id', bookId)
    .single()
}

export async function createBook(
  userId: string,
  template: TemplateKey,
  title: string
): Promise<{ data: Book | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('books')
    .insert({ user_id: userId, template, title, status: 'draft' })
    .select()
    .single()

  // Create a first empty chapter for templates that use them
  if (data && ['novel', 'story', 'essay'].includes(template)) {
    await supabase.from('chapters').insert({
      book_id: data.id,
      title: 'Capítulo 1',
      content: '{}',
      order: 0,
    })
  }

  return { data: data as Book | null, error: error as Error | null }
}

export async function updateBook(
  bookId: string,
  updates: Partial<Pick<Book, 'title' | 'status' | 'cover_url' | 'is_private'>>
) {
  return supabase
    .from('books')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', bookId)
    .select()
    .single()
}

export async function deleteBook(bookId: string) {
  return supabase.from('books').delete().eq('id', bookId)
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1)   return 'Justo ahora'
  if (diffMins < 60)  return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7)   return `Hace ${diffDays} días`
  if (diffDays < 30)  return `Hace ${Math.floor(diffDays / 7)} sem`
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
