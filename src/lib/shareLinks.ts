import { supabase } from './supabase'
import type { ShareLink } from '../types'

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function getShareLink(bookId: string) {
  return supabase
    .from('share_links')
    .select('*')
    .eq('book_id', bookId)
    .eq('is_active', true)
    .maybeSingle()
}

export async function createShareLink(bookId: string): Promise<{ data: ShareLink | null; error: Error | null }> {
  // Deactivate any existing link first
  await supabase
    .from('share_links')
    .update({ is_active: false })
    .eq('book_id', bookId)

  const token = generateToken()

  const { data, error } = await supabase
    .from('share_links')
    .insert({ book_id: bookId, token, is_active: true })
    .select()
    .single()

  return { data: data as ShareLink | null, error: error as Error | null }
}

export async function revokeShareLink(bookId: string) {
  return supabase
    .from('share_links')
    .update({ is_active: false })
    .eq('book_id', bookId)
}

export async function getBookByToken(token: string) {
  const { data: linkData, error } = await supabase
    .from('share_links')
    .select('book_id')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !linkData) return { data: null, error }

  return supabase
    .from('books')
    .select('*, chapters(*)')
    .eq('id', linkData.book_id)
    .single()
}
