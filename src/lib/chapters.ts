import { supabase } from './supabase'
import type { Chapter } from '../types'

export async function getChapters(bookId: string) {
  return supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('order', { ascending: true })
}

export async function createChapter(bookId: string, title: string, order: number) {
  return supabase
    .from('chapters')
    .insert({ book_id: bookId, title, content: '{}', order })
    .select()
    .single()
}

export async function updateChapterContent(chapterId: string, content: string) {
  return supabase
    .from('chapters')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', chapterId)
}

export async function updateChapterTitle(chapterId: string, title: string) {
  return supabase
    .from('chapters')
    .update({ title })
    .eq('id', chapterId)
}

export async function deleteChapter(chapterId: string) {
  return supabase.from('chapters').delete().eq('id', chapterId)
}
