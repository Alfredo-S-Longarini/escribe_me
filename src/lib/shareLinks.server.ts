import type { SupabaseClient } from '@supabase/supabase-js'

export async function getBookByTokenServer(supabase: SupabaseClient, token: string) {
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
